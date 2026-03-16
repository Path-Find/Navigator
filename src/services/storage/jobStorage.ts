import { supabase } from '../supabase';
import { Vault, getUserId } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import { withTimeout } from '../../utils/promiseUtils';
import type { SavedJob } from '../../types';

export const JobStorage = {
    async getJobs(): Promise<SavedJob[]> {
        const localResult = await Vault.getSecure<SavedJob[]>(STORAGE_KEYS.JOBS_HISTORY);
        
        // If undefined, decryption failed. We must NOT merge or overwrite because we'd lose the local history.
        if (localResult === undefined) {
             console.error("[JobStorage] Failed to decrypt local history. Aborting cloud sync to prevent data loss.");
             return [];
        }

        const localJobs: SavedJob[] = localResult || [];
        let jobs = localJobs;

        const userId = await getUserId();
        if (userId) {
            try {
                const { data, error } = await withTimeout(
                    supabase
                        .from('jobs')
                        .select('*')
                        .eq('user_id', userId)
                        .order('date_added', { ascending: false })
                );

                if (error) {
                    if (error.code === 'PGRST204' || error.message?.includes('column')) {
                        console.warn("Cloud fetch partially failed due to schema mismatch. Using local data fallback.");
                    } else {
                        throw error;
                    }
                }

                if (data) {
                    const cloudJobs: SavedJob[] = data.map(row => ({
                        id: row.id,
                        company: row.company,
                        position: row.job_title || row.position || 'Untitled Role',
                        location: row.location,
                        description: row.original_text || row.description,
                        fitScore: row.fit_score,
                        status: row.status as SavedJob['status'],
                        dateAdded: new Date(row.date_added || row.created_at || Date.now()).getTime(),
                        updatedAt: new Date(row.updated_at || row.date_added || row.created_at || Date.now()).getTime(),
                        resumeId: row.resume_id,
                        coverLetter: row.cover_letter,
                        coverLetterCritique: row.cover_letter_critique,
                        analysis: row.analysis,
                    }));

                    // Non-destructive merge: 
                    const processedCloudJobs = cloudJobs.map(cloudJob => {
                        const localMatch = localJobs.find(l => l.id === cloudJob.id);
                        let needsRepair = false;
                        let finalJob = cloudJob;

                        if (localMatch) {
                            // Conflict Resolution: If cloud is significantly newer (>1s), use it.
                            // If local is significantly newer, keep local and mark for cloud update.
                            const cloudTime = cloudJob.updatedAt || 0;
                            const localTime = localMatch.updatedAt || 0;

                            if (cloudTime > localTime + 1000) {
                                finalJob = cloudJob;
                            } else if (localTime > cloudTime + 1000) {
                                finalJob = localMatch;
                                needsRepair = true;
                            } else {
                                // Close timestamps — use standard field-level healing
                                if (!cloudJob.analysis && localMatch.analysis) {
                                    finalJob = { ...finalJob, analysis: localMatch.analysis, status: localMatch.status };
                                    needsRepair = true;
                                }

                                if ((!cloudJob.description || cloudJob.description.length < 50) && localMatch.description && localMatch.description.length > 50) {
                                    finalJob = { ...finalJob, description: localMatch.description };
                                    needsRepair = true;
                                }
                            }

                            if (needsRepair) {
                                this.updateJob(finalJob).catch(err => console.error("Self-healing failed:", err));
                            }
                        }

                        type ProcessedJob = SavedJob & { _synced?: boolean };
                        (finalJob as ProcessedJob)._synced = true;
                        return finalJob;
                    });

                    const cloudIds = new Set(cloudJobs.map(j => j.id));
                    const unsyncedLocalJobs = localJobs.filter(l => !cloudIds.has(l.id) && !(l as SavedJob & { _synced?: boolean })._synced);

                    jobs = [...processedCloudJobs, ...unsyncedLocalJobs].sort((a, b) => b.dateAdded - a.dateAdded);
                    await Vault.setSecure(STORAGE_KEYS.JOBS_HISTORY, jobs);
                }
            } catch (err) {
                console.warn("Exception during cloud job fetch:", err);
            }
        }
        return jobs;
    },

    async addJobs(jobs: SavedJob[]) {
        const localResult = await Vault.getSecure<SavedJob[]>(STORAGE_KEYS.JOBS_HISTORY);
        if (localResult === undefined) {
             console.error("[JobStorage] Decryption error. Aborting addJobs.");
             return [];
        }
        if (jobs.length === 0) return localResult || [];

        const localJobs: SavedJob[] = localResult || [];
        const updated = [...jobs, ...localJobs];
        await Vault.setSecure(STORAGE_KEYS.JOBS_HISTORY, updated);

        const userId = await getUserId();
        if (userId) {
            const payload = jobs.map(job => ({
                user_id: userId,
                id: job.id,
                job_title: job.analysis?.distilledJob?.roleTitle || job.position || 'Untitled Role',
                company: job.analysis?.distilledJob?.companyName || job.company || 'Unknown Company',
                original_text: job.description,
                url: job.url,
                analysis: job.analysis,
                canonical_role: job.analysis?.distilledJob?.canonicalTitle,
                status: job.status || 'saved',
                resume_id: job.resumeId,
                cover_letter: job.coverLetter,
                cover_letter_critique: job.coverLetterCritique,
                date_added: new Date(job.dateAdded).toISOString()
            }));

            const { error } = await supabase.from('jobs').insert(payload);
            if (error) console.error("Cloud Sync Error (Add Jobs):", error);
        }
        return updated;
    },

    async addJob(job: SavedJob) {
        const userId = await getUserId();
        
        // Use atomic modify to prevent race conditions during concurrent additions
        const updated = await Vault.modifySecure<SavedJob[]>(STORAGE_KEYS.JOBS_HISTORY, (current) => {
            const localJobs = current || [];
            return [job, ...localJobs];
        });

        // Cloud sync happens in background after local persistence
        if (userId) {
            withTimeout(
                supabase.from('jobs').insert({
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
                    date_added: new Date(job.dateAdded).toISOString(),
                    updated_at: new Date(job.updatedAt || job.dateAdded).toISOString()
                })
            ).catch(err => console.error('Cloud Sync Error (Add Job):', err));
        }

        return updated;
    },

    async updateJob(updatedJob: SavedJob) {
        const userId = await getUserId();
        
        // Use atomic modify to prevent race conditions during concurrent updates (e.g. analysis finish vs user edit)
        const updated = await Vault.modifySecure<SavedJob[]>(STORAGE_KEYS.JOBS_HISTORY, (current) => {
            const localJobs = current || [];
            return localJobs.map(j => j.id === updatedJob.id ? updatedJob : j);
        });

        // Cloud sync happens in background after local persistence
        if (userId) {
            withTimeout(
                supabase.from('jobs').update({
                    job_title: updatedJob.analysis?.distilledJob?.roleTitle || updatedJob.position,
                    company: updatedJob.analysis?.distilledJob?.companyName || updatedJob.company,
                    original_text: updatedJob.description,
                    location: updatedJob.analysis?.distilledJob?.location || updatedJob.location,
                    url: updatedJob.url,
                    status: updatedJob.status || 'saved',
                    analysis: updatedJob.analysis,
                    canonical_role: updatedJob.analysis?.distilledJob?.canonicalTitle,
                    resume_id: updatedJob.resumeId,
                    cover_letter: updatedJob.coverLetter,
                    cover_letter_critique: updatedJob.coverLetterCritique,
                    fit_score: updatedJob.analysis?.compatibilityScore,
                    updated_at: new Date().toISOString()
                }).eq('id', updatedJob.id)
                    .eq('user_id', userId)
            ).catch(err => console.error('Cloud Sync Error (Update Job):', err));
        }

        return updated;
    },

    async syncLocalToCloud() {
        const userId = await getUserId();
        if (!userId) return;

        const localJobs: SavedJob[] = await Vault.getSecure(STORAGE_KEYS.JOBS_HISTORY) || [];
        if (localJobs.length === 0) return;

        try {
            // 1. Check cloud state
            const { data: cloudJobs, error } = await supabase
                .from('jobs')
                .select('id')
                .eq('user_id', userId);

            if (error) {
                console.error("Sync: Failed to fetch cloud IDs", error);
                return;
            }

            const cloudIds = new Set(cloudJobs?.map(j => j.id) || []);

            // 2. Identify jobs that need to be uploaded
            const missingFromCloud = localJobs.filter(l => !cloudIds.has(l.id));

            if (missingFromCloud.length > 0) {
                console.log(`Sync: Uploading ${missingFromCloud.length} unsynced jobs to cloud...`);

                // Upload in small batches to avoid hitting limits
                for (const job of missingFromCloud) {
                    await supabase.from('jobs').insert({
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
                        date_added: new Date(job.dateAdded || Date.now()).toISOString(),
                        source_type: 'manual',
                        fit_score: job.analysis?.compatibilityScore
                    });
                }
                console.log("Sync: Bulk upload complete.");
            }
        } catch (err) {
            console.error("Sync: Fatal error during sync", err);
        }
    },

    async deleteJob(id: string) {
        const userId = await getUserId();
        
        // Use atomic modify to prevent race conditions during deletion
        const updated = await Vault.modifySecure<SavedJob[]>(STORAGE_KEYS.JOBS_HISTORY, (current) => {
            const localJobs = current || [];
            return localJobs.filter(j => j.id !== id);
        });

        if (userId) {
            (async () => {
                try {
                    const { error } = await supabase.from('jobs').delete().eq('id', id);
                    if (error) throw error;
                } catch (err) {
                    console.error('Cloud Sync Error (Delete Job):', err);
                }
            })();
        }

        return updated;
    }
};
