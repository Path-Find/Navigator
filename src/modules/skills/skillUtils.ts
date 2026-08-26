import type { CustomSkill } from './types';

const SKILL_ALIASES: Record<string, string> = {
    'communication': 'communication',
    'communications': 'communication',
    'communication skill': 'communication',
    'communications skill': 'communication',
    'communication skills': 'communication',
    'communications skills': 'communication',
};

const PROFICIENCY_RANK: Record<CustomSkill['proficiency'], number> = {
    learning: 1,
    comfortable: 2,
    expert: 3,
};

export const canonicalSkillKey = (name: string): string => {
    const normalized = name.toLowerCase().replace(/\s+/g, ' ').trim();
    return SKILL_ALIASES[normalized] || normalized;
};

export const canonicalSkillName = (name: string): string =>
    canonicalSkillKey(name) === 'communication' ? 'Communication' : name.trim();

export const mergeSkillRecords = (skills: CustomSkill[]): CustomSkill[] => {
    const groups = new Map<string, CustomSkill[]>();
    skills.forEach(skill => {
        const key = canonicalSkillKey(skill.name);
        groups.set(key, [...(groups.get(key) || []), skill]);
    });

    return [...groups.entries()].map(([key, records]) => {
        const strongest = [...records].sort((a, b) =>
            Number(Boolean(b.evidence)) - Number(Boolean(a.evidence))
            || PROFICIENCY_RANK[b.proficiency] - PROFICIENCY_RANK[a.proficiency]
        )[0];
        return {
            ...strongest,
            name: key === 'communication' ? 'Communication' : strongest.name,
            evidence: records.find(record => record.evidence)?.evidence || strongest.evidence,
            description: records.find(record => record.description)?.description || strongest.description,
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
};
