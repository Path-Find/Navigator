import { dataClient } from '../../lib/data-client';
import { getUserId, areBlocksEqual } from './storageCore';
import { withTimeout } from '../../utils/promiseUtils';
import type { ResumeProfile } from '../../types';

const DEFAULT_PROFILE: ResumeProfile = { id: 'primary', name: 'Primary Experience', blocks: [] };

export const ResumeStorage = {
    async getResumes(): Promise<ResumeProfile[]> {
        const userId = await getUserId();
        if (!userId) return [{ ...DEFAULT_PROFILE }];

        const { data, error } = await dataClient
            .from('resumes')
            .select('profile_id, content')
            .eq('user_id', userId)
            .order('profile_id');

        if (error) {
            console.error('[ResumeStorage] Failed to fetch resumes:', error.message);
            return [{ ...DEFAULT_PROFILE }];
        }

        if (!data || data.length === 0) return [{ ...DEFAULT_PROFILE }];

        return data.map(row => {
            const p = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
            return p as ResumeProfile;
        });
    },

    async saveResumes(resumes: ResumeProfile[]) {
        const userId = await getUserId();
        if (!userId) return;

        const now = Date.now();
        const updatedResumes = resumes.map(r => ({ ...r, updatedAt: now }));

        const upserts = updatedResumes.map(profile =>
            withTimeout(
                dataClient.from('resumes').upsert(
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

        // Delete rows for profiles that were removed from the array
        const activeIds = updatedResumes.map(p => p.id);
        const cleanup = withTimeout(
            dataClient.from('resumes')
                .delete()
                .eq('user_id', userId)
                .not('profile_id', 'in', `(${activeIds.map(id => `"${id}"`).join(',')})`)
        );

        await Promise.all([...upserts, cleanup]);
    },

    async addResume(profile: ResumeProfile) {
        const existing = await this.getResumes();
        let updated: ResumeProfile[];

        const masterIsEmpty = existing.length === 0 || (existing.length === 1 && existing[0].blocks.length === 0);
        if (masterIsEmpty) {
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
