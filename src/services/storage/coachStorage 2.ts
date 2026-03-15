import { supabase } from '../supabase';
import { Vault, getUserId } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import { withTimeout } from '../../utils/promiseUtils';
import type { RoleModelProfile, TargetJob } from '../../types';

export const CoachStorage = {
    async getRoleModels(): Promise<RoleModelProfile[]> {
        const localResult = await Vault.getSecure<RoleModelProfile[]>(STORAGE_KEYS.ROLE_MODELS);
        if (localResult === undefined) {
             console.error("[CoachStorage] Failed to decrypt role models. Skipping sync.");
             return [];
        }

        let roleModels: RoleModelProfile[] = localResult || [];
        const userId = await getUserId();
        if (userId) {
            try {
                const { data, error } = await withTimeout(
                    supabase
                        .from('role_models')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                );

                if (error) {
                    console.error("Cloud Sync Error (Get Role Models):", error);
                } else if (data) {
                    const cloudModels: RoleModelProfile[] = data.map(row => ({ ...row.content, id: row.id }));
                    const cloudIds = new Set(cloudModels.map(m => m.id));
                    const unsyncedModels = roleModels.filter(m => !cloudIds.has(m.id));

                    roleModels = [...cloudModels, ...unsyncedModels];
                    await Vault.setSecure(STORAGE_KEYS.ROLE_MODELS, roleModels);
                }
            } catch (err) {
                console.warn("Exception during cloud role models fetch:", err);
            }
        }
        return roleModels;
    },

    async addRoleModels(roleModels: RoleModelProfile[]) {
        const localResult = await Vault.getSecure<RoleModelProfile[]>(STORAGE_KEYS.ROLE_MODELS);
        if (localResult === undefined) {
             console.error("[CoachStorage] Decryption error. Aborting addRoleModels.");
             return [];
        }
        if (roleModels.length === 0) return localResult || [];

        const existing: RoleModelProfile[] = localResult || [];
        const updated = [...roleModels, ...existing];
        await Vault.setSecure(STORAGE_KEYS.ROLE_MODELS, updated);

        const userId = await getUserId();
        if (userId) {
            const payload = roleModels.map(roleModel => ({
                id: roleModel.id,
                user_id: userId,
                name: roleModel.name,
                content: roleModel
            }));
            const { error } = await supabase.from('role_models').insert(payload);
            if (error) console.error("Failed to sync role models to cloud:", error);
        }
        return updated;
    },

    async addRoleModel(roleModel: RoleModelProfile) {
        const localResult = await Vault.getSecure<RoleModelProfile[]>(STORAGE_KEYS.ROLE_MODELS);
        if (localResult === undefined) {
             console.error("[CoachStorage] Decryption error. Aborting addRoleModel.");
             throw new Error("Storage unavailable");
        }
        const existing: RoleModelProfile[] = localResult || [];
        const updated = [roleModel, ...existing];
        const userId = await getUserId();

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.ROLE_MODELS, updated),
            (async () => {
                if (!userId) return;
                const { error } = await withTimeout(
                    supabase.from('role_models').insert({
                        id: roleModel.id,
                        user_id: userId,
                        name: roleModel.name,
                        content: roleModel
                    })
                );
                if (error) console.error('Cloud Sync Error (Add Role Model):', error);
            })()
        ]);

        return updated;
    },

    async deleteRoleModel(id: string) {
        const existing: RoleModelProfile[] = await Vault.getSecure(STORAGE_KEYS.ROLE_MODELS) || [];
        const updated = existing.filter(rm => rm.id !== id);
        const userId = await getUserId();

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.ROLE_MODELS, updated),
            (async () => {
                if (!userId) return;
                const { error } = await withTimeout(
                    supabase.from('role_models').delete().eq('id', id)
                );
                if (error) console.error('Cloud Sync Error (Delete Role Model):', error);
            })()
        ]);

        return updated;
    },

    async getTargetJobs(): Promise<TargetJob[]> {
        const localResult = await Vault.getSecure<TargetJob[]>(STORAGE_KEYS.TARGET_JOBS);
        if (localResult === undefined) {
             console.error("[CoachStorage] Failed to decrypt target jobs. Skipping sync.");
             return [];
        }

        let targetJobs: TargetJob[] = localResult || [];
        const userId = await getUserId();
        if (userId) {
            try {
                const { data, error } = await withTimeout(
                    supabase
                        .from('target_jobs')
                        .select('*')
                        .eq('user_id', userId)
                        .order('date_added', { ascending: false })
                );

                if (error) {
                    console.error("Cloud Sync Error (Get Target Jobs):", error);
                } else if (data) {
                    const cloudTargets: TargetJob[] = data.map(row => ({
                        id: row.id,
                        title: row.title,
                        description: row.description,
                        roleModelId: row.role_model_id,
                        gapAnalysis: row.gap_analysis,
                        roadmap: row.roadmap,
                        type: row.type,
                        strictMode: row.strict_mode,
                        dateAdded: new Date(row.date_added).getTime()
                    }));

                    const cloudIds = new Set(cloudTargets.map(t => t.id));
                    const unsyncedTargets = targetJobs.filter(t => !cloudIds.has(t.id));

                    targetJobs = [...cloudTargets, ...unsyncedTargets].sort((a, b) => b.dateAdded - a.dateAdded);
                    await Vault.setSecure(STORAGE_KEYS.TARGET_JOBS, targetJobs);
                }
            } catch (err) {
                console.warn("Exception during cloud target jobs fetch:", err);
            }
        }
        return targetJobs;
    },

    async saveTargetJobs(targetJobs: TargetJob[]) {
        if (targetJobs.length === 0) return await Vault.getSecure(STORAGE_KEYS.TARGET_JOBS) || [];

        const existing: TargetJob[] = await Vault.getSecure(STORAGE_KEYS.TARGET_JOBS) || [];
        let updated = [...existing];

        targetJobs.forEach(targetJob => {
            const index = updated.findIndex(tj => tj.id === targetJob.id);
            if (index !== -1) {
                updated[index] = targetJob;
            } else {
                updated = [targetJob, ...updated];
            }
        });
        await Vault.setSecure(STORAGE_KEYS.TARGET_JOBS, updated);

        const userId = await getUserId();
        if (userId) {
            const payload = targetJobs.map(targetJob => ({
                id: targetJob.id,
                user_id: userId,
                title: targetJob.title,
                description: targetJob.description,
                role_model_id: targetJob.roleModelId,
                gap_analysis: targetJob.gapAnalysis,
                roadmap: targetJob.roadmap,
                type: targetJob.type || 'goal',
                strict_mode: targetJob.strictMode ?? true,
                date_added: new Date(targetJob.dateAdded).toISOString()
            }));

            const { error } = await supabase.from('target_jobs').upsert(payload);
            if (error) console.error("Failed to sync target jobs to cloud:", error);
        }
        return updated;
    },

    async saveTargetJob(targetJob: TargetJob) {
        const localResult = await Vault.getSecure<TargetJob[]>(STORAGE_KEYS.TARGET_JOBS);
        if (localResult === undefined) {
             console.error("[CoachStorage] Decryption error. Aborting saveTargetJob.");
             throw new Error("Storage unavailable");
        }
        const existing: TargetJob[] = localResult || [];
        const index = existing.findIndex(tj => tj.id === targetJob.id);
        let updated: TargetJob[];

        if (index !== -1) {
            updated = [...existing];
            updated[index] = targetJob;
        } else {
            updated = [targetJob, ...existing];
        }

        const userId = await getUserId();

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.TARGET_JOBS, updated),
            (async () => {
                if (!userId) return;
                const { error } = await withTimeout(
                    supabase.from('target_jobs').upsert({
                        id: targetJob.id,
                        user_id: userId,
                        title: targetJob.title,
                        description: targetJob.description,
                        role_model_id: targetJob.roleModelId,
                        gap_analysis: targetJob.gapAnalysis,
                        roadmap: targetJob.roadmap,
                        type: targetJob.type || 'goal',
                        strict_mode: targetJob.strictMode ?? true,
                        date_added: new Date(targetJob.dateAdded).toISOString()
                    })
                );
                if (error) console.error('Cloud Sync Error (Save Target Job):', error);
            })()
        ]);

        return updated;
    },

    async deleteTargetJob(id: string) {
        const existing: TargetJob[] = await Vault.getSecure(STORAGE_KEYS.TARGET_JOBS) || [];
        const updated = existing.filter(tj => tj.id !== id);
        const userId = await getUserId();

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.TARGET_JOBS, updated),
            (async () => {
                if (!userId) return;
                const { error } = await withTimeout(
                    supabase.from('target_jobs').delete().eq('id', id)
                );
                if (error) console.error('Cloud Sync Error (Delete Target Job):', error);
            })()
        ]);

        return updated;
    }
};
