import { supabase } from './supabase';
import { Vault, getUserId } from './storage/storageCore';
import { JobStorage } from './storage/jobStorage';
import { ResumeStorage } from './storage/resumeStorage';
import { SkillStorage } from './storage/skillStorage';
import { CoachStorage } from './storage/coachStorage';
import { TranscriptStorage } from './storage/transcriptStorage';
import { STORAGE_KEYS } from '../constants';

import { LocalStorage } from '../utils/localStorage';
import type { ResumeProfile, SavedJob, CustomSkill, RoleModelProfile, TargetJob } from '../types';

export const Storage = {
    ...JobStorage,
    ...ResumeStorage,
    ...SkillStorage,
    ...CoachStorage,
    ...TranscriptStorage,


    async syncLocalToCloud() {
        const userId = await getUserId();
        if (!userId) return;

        // Fetch local data and cloud ID state in parallel to identify deltas
        const [
            localResumes,
            localJobs,
            localSkills,
            localRoleModels,
            localTargetJobs,
            localTranscript,
            { data: cloudResume },
            { data: cloudJobs },
            { data: cloudSkills },
            { data: cloudModels },
            { data: cloudTargets },
            { data: cloudTranscript }
        ] = await Promise.all([
            Vault.getSecure(STORAGE_KEYS.RESUMES) as Promise<ResumeProfile[]>,
            Vault.getSecure(STORAGE_KEYS.JOBS_HISTORY) as Promise<SavedJob[]>,
            Vault.getSecure<CustomSkill[]>(STORAGE_KEYS.SKILLS),
            Vault.getSecure<RoleModelProfile[]>(STORAGE_KEYS.ROLE_MODELS),
            Vault.getSecure<TargetJob[]>(STORAGE_KEYS.TARGET_JOBS),
            Vault.getSecure(STORAGE_KEYS.TRANSCRIPT_CACHE),
            supabase.from('resumes').select('id').eq('user_id', userId).limit(1).maybeSingle(),
            supabase.from('jobs').select('id').eq('user_id', userId),
            supabase.from('user_skills').select('name').eq('user_id', userId),
            supabase.from('role_models').select('id').eq('user_id', userId),
            supabase.from('target_jobs').select('id').eq('user_id', userId),
            supabase.from('transcripts').select('id').eq('user_id', userId).limit(1).maybeSingle()
        ]);

        const syncTasks: (Promise<any> | PromiseLike<any>)[] = [];

        // 1. Sync Resumes (Batched)
        if (localResumes && localResumes.length > 0 && !cloudResume) {
            syncTasks.push(this.saveResumes(localResumes));
        }

        // 2. Sync Jobs (Corrected N+1 by Batching)
        if (localJobs && localJobs.length > 0) {
            const cloudIds = new Set(cloudJobs?.map(j => j.id) || []);
            const missingFromCloud = localJobs.filter(j => !cloudIds.has(j.id) && !(j as typeof j & { _synced?: boolean })._synced);

            if (missingFromCloud.length > 0) {
                const payload = missingFromCloud.map(job => ({
                    user_id: userId,
                    id: job.id,
                    job_title: job.analysis?.distilledJob?.roleTitle || job.position || 'Untitled Role',
                    company: job.analysis?.distilledJob?.companyName || job.company || 'Unknown Company',
                    original_text: job.description,
                    location: job.analysis?.distilledJob?.location || job.location,
                    url: job.url,
                    analysis: job.analysis,
                    canonical_role: job.analysis?.distilledJob?.canonicalTitle,
                    status: (job.status === 'analyzing' || !job.status) ? 'saved' : job.status,
                    resume_id: job.resumeId,
                    cover_letter: job.coverLetter,
                    cover_letter_critique: job.coverLetterCritique,
                    fit_score: job.analysis?.compatibilityScore,
                    date_added: new Date(job.dateAdded || Date.now()).toISOString(),
                    updated_at: new Date(job.updatedAt || job.dateAdded || Date.now()).toISOString()
                }));
                syncTasks.push(supabase.from('jobs').insert(payload).then(({ error }) => {
                    if (error) {
                        console.error("Cloud Sync Error (Sync Jobs):", error);
                        throw new Error(`Sync Jobs failed: ${error.message}`);
                    }
                }));
            }
        }

        // 3. Sync Skills (Corrected N+1 by Batching)
        if (localSkills && localSkills.length > 0) {
            const cloudNames = new Set(cloudSkills?.map(s => s.name) || []);
            const missingFromCloud = localSkills.filter(s => !cloudNames.has(s.name));

            if (missingFromCloud.length > 0) {
                const payload = missingFromCloud.map(skill => ({
                    user_id: userId,
                    name: skill.name,
                    proficiency: skill.proficiency,
                    evidence: skill.evidence,
                    updated_at: new Date().toISOString()
                }));
                syncTasks.push(supabase.from('user_skills').upsert(payload, { onConflict: 'user_id,name' }).then(({ error }) => {
                    if (error) {
                        console.error("Cloud Sync Error (Sync Skills):", error);
                        throw new Error(`Sync Skills failed: ${error.message}`);
                    }
                }));
            }
        }

        // 4. Sync Coach Models
        if (localRoleModels && localRoleModels.length > 0) {
            const cloudIds = new Set(cloudModels?.map(m => m.id) || []);
            const missingFromCloud = localRoleModels.filter(m => !cloudIds.has(m.id));

            if (missingFromCloud.length > 0) {
                const payload = missingFromCloud.map(model => ({
                    id: model.id,
                    user_id: userId,
                    name: model.name,
                    content: model
                }));
                syncTasks.push(supabase.from('role_models').insert(payload).then(({ error }) => {
                    if (error) {
                        console.error("Cloud Sync Error (Sync Role Models):", error);
                        throw new Error(`Sync Role Models failed: ${error.message}`);
                    }
                }));
            }
        }

        // 5. Sync Target Jobs
        if (localTargetJobs && localTargetJobs.length > 0) {
            const cloudIds = new Set(cloudTargets?.map(t => t.id) || []);
            const missingFromCloud = localTargetJobs.filter(t => !cloudIds.has(t.id));

            if (missingFromCloud.length > 0) {
                const payload = missingFromCloud.map(target => ({
                    id: target.id,
                    user_id: userId,
                    title: target.title,
                    description: target.description,
                    role_model_id: target.roleModelId,
                    gap_analysis: target.gapAnalysis,
                    roadmap: target.roadmap,
                    type: target.type || 'goal',
                    strict_mode: target.strictMode ?? true,
                    date_added: new Date(target.dateAdded || Date.now()).toISOString()
                }));
                syncTasks.push(supabase.from('target_jobs').upsert(payload).then(({ error }) => {
                    if (error) {
                        console.error("Cloud Sync Error (Sync Target Jobs):", error);
                        throw new Error(`Sync Target Jobs failed: ${error.message}`);
                    }
                }));
            }
        }

        // 6. Sync Transcripts
        if (localTranscript && !cloudTranscript) {
            syncTasks.push(this.saveTranscript(localTranscript));
        }

        const results = await Promise.allSettled(syncTasks);

        const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
        if (failures.length > 0) {
            console.error(`[Sync] ${failures.length}/${syncTasks.length} sync tasks failed:`, failures.map(f => f.reason));
        }
    },

    async signOut() {
        await supabase.auth.signOut();
    },

    async clearAllData() {
        // Wipe all user-specific localStorage keys
        const userKeys = [
            STORAGE_KEYS.RESUMES,
            STORAGE_KEYS.JOBS_HISTORY,
            STORAGE_KEYS.SKILLS,
            STORAGE_KEYS.ROLE_MODELS,
            STORAGE_KEYS.TARGET_JOBS,
            STORAGE_KEYS.TRANSCRIPT_CACHE,
            'jobfit_vault_seed' // Also clear the encryption seed
        ];

        userKeys.forEach(key => LocalStorage.remove(key));
    },

    // Legacy support for feedback and optimization logging if needed
    async submitFeedback(jobId: string, rating: 1 | -1, context: string) {
        const userId = await getUserId();
        if (userId) {
            await supabase.from('feedback').insert({ user_id: userId, job_id: jobId, rating, context });
        }
    }
};
