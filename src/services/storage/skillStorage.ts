import { supabase } from '../supabase';
import { Vault, getUserId } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import { withTimeout } from '../../utils/promiseUtils';
import type { CustomSkill } from '../../types';

export const SkillStorage = {
    async getSkills(): Promise<CustomSkill[]> {
        let skills: CustomSkill[] = await Vault.getSecure(STORAGE_KEYS.SKILLS) || [];

        const userId = await getUserId();
        if (userId) {
            try {
                const { data, error } = await withTimeout(
                    supabase
                        .from('user_skills')
                        .select('*')
                        .eq('user_id', userId)
                        .order('name')
                );

                if (error) {
                    console.error("Cloud Sync Error (Get Skills):", error);
                } else if (data) {
                    const cloudSkills: CustomSkill[] = data.map(row => ({
                        id: row.id,
                        user_id: row.user_id,
                        name: row.name,
                        proficiency: row.proficiency,
                        evidence: row.evidence,
                        created_at: row.created_at,
                        updated_at: row.updated_at
                    }));

                    const cloudNames = new Set(cloudSkills.map((s: CustomSkill) => s.name));
                    const unsyncedSkills = skills.filter((s: CustomSkill) => !cloudNames.has(s.name));

                    skills = [...cloudSkills, ...unsyncedSkills].sort((a, b) => a.name.localeCompare(b.name));
                    await Vault.setSecure(STORAGE_KEYS.SKILLS, skills);
                }
            } catch (err) {
                console.warn("Exception during cloud skills fetch:", err);
            }
        }
        return skills;
    },

    async saveSkill(skill: Partial<CustomSkill>): Promise<CustomSkill> {
        const userId = await getUserId();
        if (!userId) {
            const skills: CustomSkill[] = await Vault.getSecure(STORAGE_KEYS.SKILLS) || [];
            const existingIdx = skills.findIndex(s => s.name === skill.name);
            const newSkill = {
                ...skill,
                id: existingIdx !== -1 ? skills[existingIdx].id : crypto.randomUUID(),
                user_id: 'anonymous',
                created_at: existingIdx !== -1 ? skills[existingIdx].created_at : new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as CustomSkill;

            if (existingIdx !== -1) skills[existingIdx] = newSkill;
            else skills.push(newSkill);

            await Vault.setSecure(STORAGE_KEYS.SKILLS, skills);
            return newSkill;
        }

        const { data, error } = await withTimeout(
            supabase
                .from('user_skills')
                .upsert({
                    user_id: userId,
                    name: skill.name,
                    proficiency: skill.proficiency,
                    evidence: skill.evidence,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,name' })
                .select()
                .single()
        );

        if (error) throw error;

        const localSkills: CustomSkill[] = await Vault.getSecure(STORAGE_KEYS.SKILLS) || [];
        const updated = localSkills.filter(s => s.name !== skill.name);
        updated.push(data);
        await Vault.setSecure(STORAGE_KEYS.SKILLS, updated);

        return data as CustomSkill;
    },

    async deleteSkill(name: string) {
        const localSkills: CustomSkill[] = await Vault.getSecure(STORAGE_KEYS.SKILLS) || [];
        const updated = localSkills.filter(s => s.name !== name);
        await Vault.setSecure(STORAGE_KEYS.SKILLS, updated);

        const userId = await getUserId();
        if (userId) {
            const { error } = await withTimeout(
                supabase.from('user_skills').delete().eq('user_id', userId).eq('name', name)
            );
            if (error) throw error;
        }
    }
};
