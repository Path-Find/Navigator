import { supabase } from '../supabase';
import { Vault, getUserId, areBlocksEqual } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import { withTimeout } from '../../utils/promiseUtils';
import type { ResumeProfile } from '../../types';

export const ResumeStorage = {
    async getResumes(): Promise<ResumeProfile[]> {
        const localResult = await Vault.getSecure<ResumeProfile[]>(STORAGE_KEYS.RESUMES);

        if (localResult === undefined) {
            console.error("[ResumeStorage] Failed to decrypt resumes. Aborting to prevent data loss.");
            return [{ id: 'primary', name: 'Primary Experience', blocks: [] }];
        }

        let profiles = localResult || [{ id: 'primary', name: 'Primary Experience', blocks: [] }];

        const userId = await getUserId();
        if (userId) {
            const { data } = await supabase
                .from('resumes')
                .select('profile_id, content, updated_at')
                .eq('user_id', userId)
                .order('profile_id');

            if (data && data.length > 0) {
                const cloudProfiles: ResumeProfile[] = data.map(row => {
                    const p = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
                    return p as ResumeProfile;
                });

                const cloudUpdatedAt = cloudProfiles.reduce((max, p) => Math.max(max, p.updatedAt || 0), 0);
                const localUpdatedAt = profiles.reduce((max, p) => Math.max(max, p.updatedAt || 0), 0);
                const localHasData = profiles.some(p => p.blocks.length > 0);
                const cloudHasData = cloudProfiles.some(p => p.blocks?.length > 0);

                if (cloudUpdatedAt > localUpdatedAt + 1000 || (!localHasData && cloudHasData)) {
                    profiles = cloudProfiles;
                    await Vault.setSecure(STORAGE_KEYS.RESUMES, profiles);
                } else if (localUpdatedAt > cloudUpdatedAt + 1000) {
                    this.saveResumes(profiles).catch(err => console.error("[ResumeStorage] Sync-back failed:", err));
                }
            }
        }
        return profiles;
    },

    async saveResumes(resumes: ResumeProfile[]) {
        const userId = await getUserId();
        const now = Date.now();
        const updatedResumes = resumes.map(r => ({ ...r, updatedAt: now }));

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.RESUMES, updatedResumes),
            (async () => {
                if (!userId) return;

                // Upsert each profile individually — eliminates the SELECT-then-INSERT race condition.
                // UNIQUE (user_id, profile_id) means concurrent saves to the same profile merge safely.
                const upserts = updatedResumes.map(profile =>
                    withTimeout(
                        supabase.from('resumes').upsert(
                            {
                                user_id: userId,
                                profile_id: profile.id,
                                name: profile.name || 'Default Profile',
                                content: profile,
                                updated_at: new Date().toISOString(),
                            },
                            { onConflict: 'user_id,profile_id' }
                        )
                    ).then(({ error }) => { if (error) throw error; })
                );

                // Delete any rows for profiles that were removed from the local array
                const activeIds = updatedResumes.map(p => p.id);
                const cleanup = withTimeout(
                    supabase.from('resumes')
                        .delete()
                        .eq('user_id', userId)
                        .not('profile_id', 'in', `(${activeIds.map(id => `"${id}"`).join(',')})`)
                );

                await Promise.all([...upserts, cleanup]);
            })()
        ]);
    },

    async addResume(profile: ResumeProfile) {
        const localResult = await Vault.getSecure<ResumeProfile[]>(STORAGE_KEYS.RESUMES);
        if (localResult === undefined) {
            console.error("[ResumeStorage] Decryption error. Aborting addResume.");
            throw new Error("Storage unavailable");
        }
        const existing: ResumeProfile[] = localResult || [];
        let updated: ResumeProfile[];

        if (existing.length === 0) {
            updated = [profile];
        } else {
            const master = existing[0];
            const newBlocks = [...master.blocks];
            profile.blocks.forEach(newBlock => {
                const matchIndex = newBlocks.findIndex(b => areBlocksEqual(b, newBlock));
                if (matchIndex !== -1) {
                    const existingBlock = newBlocks[matchIndex];
                    const seen = new Set<string>();
                    const combinedBullets = [...existingBlock.bullets, ...newBlock.bullets].filter(b => {
                        const key = b.trim().toLowerCase();
                        if (!key || seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                    newBlocks[matchIndex] = {
                        ...existingBlock,
                        bullets: combinedBullets,
                        dateRange: existingBlock.dateRange || newBlock.dateRange
                    };
                } else {
                    newBlocks.push(newBlock);
                }
            });
            updated = [{ ...master, blocks: newBlocks, importRevision: (master.importRevision || 0) + 1 }, ...existing.slice(1)];
        }

        await this.saveResumes(updated);
        return updated;
    }
};
