import { useState, useEffect, useCallback } from 'react';
import type { AppState, RoleModelProfile, TargetJob, Transcript, GapAnalysisResult } from '../../../types';
import { Storage } from '../../../services/storageService';
import { parseRoleModel, analyzeGap, analyzeRoleModelGap, generateRoadmap } from '../../../services/geminiService';
import { ScraperService } from '../../../services/scraperService';
import { useToast } from '../../../contexts/ToastContext';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../../constants';
import { checkRoleModelLimit } from '../../../services/usageLimits';
import { supabase } from '../../../services/supabase';

export const useCoachManager = () => {
    const { showInfo, showError } = useToast();

    const [roleModels, setRoleModels] = useState<RoleModelProfile[]>([]);
    const [targetJobs, setTargetJobs] = useState<TargetJob[]>([]);
    const [transcript, setTranscript] = useLocalStorage<Transcript | null>(STORAGE_KEYS.TRANSCRIPT_CACHE, null);
    const [activeAnalysisIds, setActiveAnalysisIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        (async () => {
            try {
                const [loadedRoleModels, loadedTargetJobs] = await Promise.all([
                    Storage.getRoleModels(),
                    Storage.getTargetJobs()
                ]);
                if (mounted) {
                    setRoleModels(loadedRoleModels);
                    setTargetJobs(loadedTargetJobs);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed to load coach data:", err);
                if (mounted) {
                    setIsLoading(false);
                    showError("Failed to load coach data. Please refresh.");
                }
            }
        })();
        return () => { mounted = false; };
    }, [showError]);

    const handleAddRoleModel = useCallback(async (file: File) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const limitResult = await checkRoleModelLimit(user.id);
                if (!limitResult.allowed) {
                    const msg = limitResult.reason === 'free_limit_reached'
                        ? 'Upgrade to add role models.'
                        : `Role model limit reached (${limitResult.used}/${limitResult.limit}). Remove one or upgrade your plan.`;
                    throw new Error(msg);
                }
            }

            await new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const result = reader.result as string;
                        if (!result || !result.includes(',')) {
                            throw new Error('Failed to read file: unexpected format');
                        }
                        const base64 = result.split(',')[1];
                        const parsed = await parseRoleModel(base64, file.type);
                        const updated = await Storage.addRoleModel(parsed);
                        setRoleModels(updated);
                        resolve();
                    } catch (err) { reject(err); }
                };
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            });
        } catch (err) {
            console.error("Failed to add role model:", err);
            throw err;
        }
    }, []);

    const handleDeleteRoleModel = useCallback(async (id: string) => {
        try {
            const updated = await Storage.deleteRoleModel(id);
            setRoleModels(updated);
        } catch (err) {
            console.error("Failed to delete role model:", err);
            showError("Failed to delete role model. Please try again.");
        }
    }, [showError]);

    const handleRunGapAnalysis = useCallback(async (targetJobId: string, { resumes, skills }: { resumes: AppState['resumes'], skills: AppState['skills'] }) => {
        const targetJob = targetJobs.find(tj => tj.id === targetJobId);
        if (!targetJob) return;

        setActiveAnalysisIds(prev => new Set(prev).add(targetJobId));
        if (showInfo) showInfo("AI Coach is analyzing your skill gap in the background...");

        try {
            const analysisPromise = (targetJob.type === 'role_model' && targetJob.roleModelId)
                ? (() => {
                    const rm = roleModels.find(r => r.id === targetJob.roleModelId);
                    return rm
                        ? analyzeRoleModelGap(rm, resumes, skills)
                        : Promise.reject(new Error("Role Model not found"));
                })()
                : analyzeGap(roleModels, resumes, skills, transcript);

            const analysis: GapAnalysisResult = await analysisPromise;

            const updatedTargetJob = { ...targetJob, gapAnalysis: analysis };
            const updatedList = await Storage.saveTargetJob(updatedTargetJob);
            setTargetJobs(updatedList);
        } catch (err) {
            console.error("Gap Analysis Failed", err);
            showError('Gap analysis failed. Please try again.');
        } finally {
            setActiveAnalysisIds(prev => {
                const next = new Set(prev);
                next.delete(targetJobId);
                return next;
            });
        }
    }, [targetJobs, roleModels, transcript, showInfo, showError]);

    const handleGenerateRoadmap = useCallback(async (targetJobId: string) => {
        const targetJob = targetJobs.find(tj => tj.id === targetJobId);
        if (!targetJob || !targetJob.gapAnalysis) return;

        setActiveAnalysisIds(prev => new Set(prev).add(`${targetJobId}-roadmap`));
        if (showInfo) showInfo("AI Coach is building your 12-month roadmap...");

        try {
            const roadmap = await generateRoadmap(targetJob.gapAnalysis);
            const updatedTargetJob = { ...targetJob, roadmap };
            const updatedList = await Storage.saveTargetJob(updatedTargetJob);
            setTargetJobs(updatedList);
        } catch (err) {
            console.error("Roadmap Generation Failed", err);
            showError('Roadmap generation failed. Please try again.');
        } finally {
            setActiveAnalysisIds(prev => {
                const next = new Set(prev);
                next.delete(`${targetJobId}-roadmap`);
                return next;
            });
        }
    }, [targetJobs, showInfo, showError]);

    const handleToggleMilestone = useCallback(async (targetJobId: string, milestoneId: string) => {
        const targetJob = targetJobs.find(tj => tj.id === targetJobId);
        if (!targetJob || !targetJob.roadmap) return;

        const updatedRoadmap = targetJob.roadmap.map(m =>
            m.id === milestoneId ? { ...m, status: (m.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' } : m
        );
        const updatedTargetJob = { ...targetJob, roadmap: updatedRoadmap };
        try {
            const updatedList = await Storage.saveTargetJob(updatedTargetJob);
            setTargetJobs(updatedList);
        } catch (err) {
            console.error("Failed to save milestone:", err);
            showError("Failed to save milestone. Please try again.");
        }
    }, [targetJobs, showError]);

    const handleTargetJobCreated = useCallback(async (url: string) => {
        try {
            let jobDescription = url;
            if (url.startsWith('http')) {
                jobDescription = await ScraperService.scrapeJobContent(url);
            }

            // Derive a title from the content: use the first non-empty line (up to 60 chars),
            // or fall back to the URL hostname, or a generic placeholder.
            const firstLine = jobDescription.split('\n').find(l => l.trim().length > 3)?.trim() ?? '';
            const fallback = url.startsWith('http')
                ? new URL(url).hostname.replace(/^www\./, '')
                : 'New Dream Job';
            const title = (firstLine.slice(0, 60) || fallback);

            const newGoal: TargetJob = {
                id: crypto.randomUUID(),
                title,
                description: jobDescription,
                dateAdded: Date.now(),
            };

            const updated = await Storage.saveTargetJob(newGoal);
            setTargetJobs(updated);
        } catch (err) {
            console.error("Failed to add target job:", err);
            throw err;
        }
    }, []);

    const handleEmulateRoleModel = useCallback(async (roleModelId: string) => {
        const roleModel = roleModels.find(rm => rm.id === roleModelId);
        if (!roleModel) return;

        const newTarget: TargetJob = {
            id: crypto.randomUUID(),
            title: `Emulate: ${roleModel.name}`,
            description: roleModel.rawTextSummary || roleModel.careerSnapshot,
            dateAdded: Date.now(),
            type: 'role_model',
            roleModelId: roleModel.id
        };

        try {
            const updated = await Storage.saveTargetJob(newTarget);
            setTargetJobs(updated);
        } catch (err) {
            console.error("Failed to create emulation target:", err);
            showError("Failed to create target. Please try again.");
        }
    }, [roleModels, showError]);

    const handleUpdateTargetJob = useCallback(async (targetJob: TargetJob) => {
        try {
            const updatedList = await Storage.saveTargetJob(targetJob);
            setTargetJobs(updatedList);
        } catch (err) {
            console.error("Failed to update target job:", err);
            showError("Failed to save changes. Please try again.");
        }
    }, [showError]);

    return {
        roleModels,
        targetJobs,
        transcript,
        activeAnalysisIds,
        isLoading,
        handleAddRoleModel,
        handleDeleteRoleModel,
        handleRunGapAnalysis,
        handleGenerateRoadmap,
        handleToggleMilestone,
        handleTargetJobCreated,
        handleEmulateRoleModel,
        handleUpdateTargetJob,
        setTranscript
    };
};
