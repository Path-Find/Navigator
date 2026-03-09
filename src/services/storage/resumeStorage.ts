import { supabase } from '../supabase';
import { Vault, getUserId, areBlocksEqual } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import { withTimeout } from '../../utils/promiseUtils';
import type { ResumeProfile } from '../../types';

export const ResumeStorage = {
    async getResumes(): Promise<ResumeProfile[]> {
        let profiles = await Vault.getSecure(STORAGE_KEYS.RESUMES) as ResumeProfile[];
        if (!profiles) {
            profiles = [{ id: 'primary', name: 'Primary Experience', blocks: [] }];
        }

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
                    supabase.from('resumes').select('id').eq('user_id', userId).limit(1).maybeSingle()
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
        const existing: ResumeProfile[] = await Vault.getSecure(STORAGE_KEYS.RESUMES) || [];
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
                    const combinedBullets = Array.from(new Set([
                        ...existingBlock.bullets,
                        ...newBlock.bullets
                    ])).filter(b => b.trim().length > 0);
                    newBlocks[matchIndex] = {
                        ...existingBlock,
                        bullets: combinedBullets,
                        dateRange: existingBlock.dateRange || newBlock.dateRange
                    };
                } else {
                    newBlocks.push(newBlock);
                }
            });
            updated = [{ ...master, blocks: newBlocks }, ...existing.slice(1)];
        }

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.RESUMES, updated),
            getUserId().then(async userId => {
                if (!userId) return;
                const { data: existingRow, error: selectError } = await supabase
                    .from('resumes')
                    .select('id')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (selectError && selectError.code !== 'PGRST116') {
                    console.error("Supabase select error in addResume:", selectError);
                }
                if (existingRow) {
                    const { error: updateError } = await supabase.from('resumes').update({ content: updated }).eq('user_id', userId);
                    if (updateError) console.error("Supabase update error:", updateError);
                } else {
                    const { error: insertError } = await supabase.from('resumes').insert({ user_id: userId, name: 'Default Profile', content: updated });
                    if (insertError) console.error("Supabase insert error:", insertError);
                }
            })
        ]);
        return updated;
    }
};
