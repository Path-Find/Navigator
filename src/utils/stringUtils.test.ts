import { describe, it, expect } from 'vitest';
import { toTitleCase, toSentenceCase } from './stringUtils';

describe('toTitleCase', () => {
    it('converts all-uppercase to title case', () => {
        expect(toTitleCase('PRINCIPAL COMPETENCIES')).toBe('Principal Competencies');
    });

    it('converts all-lowercase to title case', () => {
        expect(toTitleCase('graphic design')).toBe('Graphic Design');
    });

    it('leaves mixed-case strings unchanged', () => {
        // Mixed-case strings (neither all-upper nor all-lower) pass through untouched
        expect(toTitleCase('React')).toBe('React');
        expect(toTitleCase('JavaScript Developer')).toBe('JavaScript Developer');
    });

    it('converts all-uppercase acronyms to title case (expected behaviour)', () => {
        // All-uppercase strings are treated as needing conversion — 'GIS' → 'Gis'
        expect(toTitleCase('GIS')).toBe('Gis');
    });

    it('handles a single word', () => {
        expect(toTitleCase('MANAGER')).toBe('Manager');
        expect(toTitleCase('manager')).toBe('Manager');
    });

    it('returns empty string for empty input', () => {
        expect(toTitleCase('')).toBe('');
    });
});

describe('toSentenceCase', () => {
    it('converts all-uppercase to sentence case', () => {
        expect(toSentenceCase('DEVELOP A MARKETING STRATEGY')).toBe('Develop a marketing strategy');
    });

    it('converts all-lowercase to sentence case', () => {
        expect(toSentenceCase('develop a marketing strategy')).toBe('Develop a marketing strategy');
    });

    it('leaves mixed-case strings unchanged', () => {
        expect(toSentenceCase('Develop a Strategy')).toBe('Develop a Strategy');
        expect(toSentenceCase('GIS Analysis')).toBe('GIS Analysis');
    });

    it('handles a single word', () => {
        expect(toSentenceCase('MANAGER')).toBe('Manager');
        expect(toSentenceCase('manager')).toBe('Manager');
    });

    it('returns empty string for empty input', () => {
        expect(toSentenceCase('')).toBe('');
    });
});
