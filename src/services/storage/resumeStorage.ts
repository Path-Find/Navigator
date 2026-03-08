import { supabase } from '../supabase';
import { Vault, getUserId, areBlocksEqual } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import { Logger } from '../../utils/logger';
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

                    if (cloudHasData || !localHasData) {
                        profiles = cloudProfiles;
                        await Vault.setSecure(STORAGE_KEYS.RESUMES, profiles);
                    } else {
                        // Keep local data, it's more complete
                        Logger.log("[ResumeStorage] Cloud resumes seem empty or less complete than local. Keeping local for sync.");
                    }
                }
            }
        }
        return profiles;
    },

    async saveResumes(resumes: ResumeProfile[]) {
        const userId = await getUserId();

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.RESUMES, resumes),
            (async () => {
                if (!userId) return;

                const { data, error: selectError } = await withTimeout(
                    supabase.from('resumes').select('id').eq('user_id', userId).limit(1).maybeSingle()
                );

                if (selectError) throw selectError;

                if (data) {
                    const { error: updateError } = await withTimeout(
                        supabase.from('resumes').update({ content: resumes, name: 'Default Profile' }).eq('id', data.id)
                    );
                    if (updateError) throw updateError;
                } else {
                    const { error: insertError } = await withTimeout(
                        supabase.from('resumes').insert({ user_id: userId, name: 'Default Profile', content: resumes })
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
