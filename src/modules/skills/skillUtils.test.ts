import { describe, expect, it } from 'vitest';
import { canonicalSkillKey, mergeSkillRecords } from './skillUtils';

describe('skill normalization', () => {
    it('treats communication variants as one skill', () => {
        expect(canonicalSkillKey('Communications Skills')).toBe('communication');
        expect(canonicalSkillKey('Communications skill')).toBe('communication');
        expect(canonicalSkillKey('Communication')).toBe('communication');
    });

    it('handles obvious product-name and abbreviation variants', () => {
        expect(canonicalSkillKey('MS Excel')).toBe('microsoft excel');
        expect(canonicalSkillKey('PowerBI')).toBe('power bi');
        expect(canonicalSkillKey('Arc GIS')).toBe('arcgis');
        expect(canonicalSkillKey('Data Analytics')).toBe('data analytics');
    });

    it('keeps the strongest duplicate record and its evidence', () => {
        const merged = mergeSkillRecords([
            { id: 'one', user_id: 'user', name: 'Communications Skills', proficiency: 'learning', created_at: '', updated_at: '' },
            { id: 'two', user_id: 'user', name: 'Communication', proficiency: 'comfortable', evidence: 'Verified in an interview', created_at: '', updated_at: '' },
        ]);

        expect(merged).toHaveLength(1);
        expect(merged[0].name).toBe('Communication');
        expect(merged[0].proficiency).toBe('comfortable');
        expect(merged[0].evidence).toBe('Verified in an interview');
    });
});
