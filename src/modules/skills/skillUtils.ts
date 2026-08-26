import type { CustomSkill } from './types';

interface CanonicalSkillDefinition {
    key: string;
    name: string;
    aliases: string[];
}

// Keep this deliberately conservative: spelling, abbreviation, and product-name variants only.
const CANONICAL_SKILLS: CanonicalSkillDefinition[] = [
    { key: 'communication', name: 'Communication', aliases: ['communications', 'communication skill', 'communications skill', 'communication skills', 'communications skills'] },
    { key: 'customer service', name: 'Customer Service', aliases: ['customer services', 'customer support', 'client service', 'client support'] },
    { key: 'microsoft excel', name: 'Microsoft Excel', aliases: ['excel', 'ms excel', 'microsoft office excel'] },
    { key: 'microsoft outlook', name: 'Microsoft Outlook', aliases: ['outlook', 'ms outlook', 'microsoft office outlook'] },
    { key: 'microsoft powerpoint', name: 'Microsoft PowerPoint', aliases: ['powerpoint', 'power point', 'ms powerpoint', 'microsoft office powerpoint'] },
    { key: 'microsoft word', name: 'Microsoft Word', aliases: ['word', 'ms word', 'microsoft office word'] },
    { key: 'microsoft office', name: 'Microsoft Office', aliases: ['ms office', 'microsoft office suite'] },
    { key: 'javascript', name: 'JavaScript', aliases: ['java script'] },
    { key: 'typescript', name: 'TypeScript', aliases: ['type script'] },
    { key: 'arcgis', name: 'ArcGIS', aliases: ['arc gis'] },
    { key: 'power bi', name: 'Power BI', aliases: ['powerbi', 'microsoft power bi'] },
    { key: 'google workspace', name: 'Google Workspace', aliases: ['g suite', 'gsuite', 'google apps'] },
];

const normalizeSkillLabel = (name: string): string => name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const SKILL_ALIASES = new Map<string, CanonicalSkillDefinition>();
CANONICAL_SKILLS.forEach(definition => {
    [definition.key, definition.name, ...definition.aliases].forEach(label => {
        SKILL_ALIASES.set(normalizeSkillLabel(label), definition);
    });
});

const PROFICIENCY_RANK: Record<CustomSkill['proficiency'], number> = {
    learning: 1,
    comfortable: 2,
    expert: 3,
};

export const canonicalSkillKey = (name: string): string =>
    SKILL_ALIASES.get(normalizeSkillLabel(name))?.key || normalizeSkillLabel(name);

export const canonicalSkillName = (name: string): string =>
    SKILL_ALIASES.get(normalizeSkillLabel(name))?.name || name.trim();

export const mergeSkillRecords = (skills: CustomSkill[]): CustomSkill[] => {
    const groups = new Map<string, CustomSkill[]>();
    skills.forEach(skill => {
        const key = canonicalSkillKey(skill.name);
        groups.set(key, [...(groups.get(key) || []), skill]);
    });

    return [...groups.entries()].map(([, records]) => {
        const strongest = [...records].sort((a, b) =>
            Number(Boolean(b.evidence)) - Number(Boolean(a.evidence))
            || PROFICIENCY_RANK[b.proficiency] - PROFICIENCY_RANK[a.proficiency]
        )[0];
        return {
            ...strongest,
            name: canonicalSkillName(strongest.name),
            evidence: records.find(record => record.evidence)?.evidence || strongest.evidence,
            description: records.find(record => record.description)?.description || strongest.description,
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
};
