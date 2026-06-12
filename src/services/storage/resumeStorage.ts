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
                .select('content')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data?.content) {
                let cloudProfiles = data.content;
                if (typeof cloudProfiles === 'string') {
                    try {
                        cloudProfiles = JSON.parse(cloudProfiles);
                    } catch (e) {
                        console.error('Failed to parse resumes content string:', e);
                    }
                }

                if (Array.isArray(cloudProfiles) && cloudProfiles.length > 0) {
                    // Non-destructive merge: Since resumes are a nested structure in a single column,
                    // we check if the cloud actually has something. 
                    // To be safe, if we have local profiles with blocks and cloud has fewer/none, we merge.
                    // But usually resumes are synced as a whole unit.
                    // For now, let's just ensure we don't wipe local if cloud is weirdly empty.

                    const localHasData = profiles.some(p => p.blocks.length > 0);
                    const cloudHasData = (cloudProfiles as ResumeProfile[]).some(p => p.blocks?.length > 0);

                    const cloudUpdatedAt = (cloudProfiles as ResumeProfile[]).reduce((max, p) => Math.max(max, p.updatedAt || 0), 0);
                    const localUpdatedAt = profiles.reduce((max, p) => Math.max(max, p.updatedAt || 0), 0);

                    if (cloudUpdatedAt > localUpdatedAt + 1000 || (!localHasData && cloudHasData)) {
                        profiles = cloudProfiles;
                        await Vault.setSecure(STORAGE_KEYS.RESUMES, profiles);
                    } else if (localUpdatedAt > cloudUpdatedAt + 1000) {
                        // Local is newer, sync back to cloud
                        this.saveResumes(profiles).catch(err => console.error("[ResumeStorage] Sync-back failed:", err));
                    }
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

                const { data, error: selectError } = await withTimeout(
                    supabase.from('resumes').select('id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
                );

                if (selectError) throw selectError;

                if (data) {
                    const { error: updateError } = await withTimeout(
                        supabase.from('resumes').update({ content: updatedResumes, name: 'Default Profile' }).eq('id', data.id)
                    );
                    if (updateError) throw updateError;
                } else {
                    const { error: insertError } = await withTimeout(
                        supabase.from('resumes').insert({ user_id: userId, name: 'Default Profile', content: updatedResumes })
                    );
                    if (insertError) throw insertError;
                }
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

        const userId = await getUserId();
        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.RESUMES, updated),
            (async () => {
                if (!userId) return;
                const { data: existingRow, error: selectError } = await supabase
                    .from('resumes')
                    .select('id')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (selectError && selectError.code !== 'PGRST116') {
                    console.error('Cloud Sync Error (Add Resume, select):', selectError);
                }
                if (existingRow) {
                    const { error: updateError } = await supabase.from('resumes').update({ content: updated }).eq('user_id', userId);
                    if (updateError) console.error('Cloud Sync Error (Add Resume, update):', updateError);
                } else {
                    const { error: insertError } = await supabase.from('resumes').insert({ user_id: userId, name: 'Default Profile', content: updated });
                    if (insertError) console.error('Cloud Sync Error (Add Resume, insert):', insertError);
                }
            })()
        ]);
        return updated;
    }
};
