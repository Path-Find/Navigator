import { describe, it, expect } from 'vitest';
import { areBlocksEqual } from './blockUtils';

describe('areBlocksEqual', () => {
    describe('Type matching', () => {
        it('should return false if types are different', () => {
            const a = { type: 'work', title: 'Engineer' };
            const b = { type: 'education', title: 'Engineer' };
            expect(areBlocksEqual(a, b)).toBe(false);
        });
    });

    describe('work, education, project, volunteer types', () => {
        const types = ['work', 'education', 'project', 'volunteer'];

        types.forEach(type => {
            it(`should return true for ${type} if title and organization match exactly`, () => {
                const a = { type, title: 'Software Engineer', organization: 'Tech Corp' };
                const b = { type, title: 'Software Engineer', organization: 'Tech Corp' };
                expect(areBlocksEqual(a, b)).toBe(true);
            });

            it(`should return true for ${type} if title and organization match with different case and whitespace`, () => {
                const a = { type, title: 'Software Engineer', organization: 'Tech Corp' };
                const b = { type, title: '  software engineer  ', organization: '  TECH CORP  ' };
                expect(areBlocksEqual(a, b)).toBe(true);
            });

            it(`should return false for ${type} if titles are different`, () => {
                const a = { type, title: 'Software Engineer', organization: 'Tech Corp' };
                const b = { type, title: 'Hardware Engineer', organization: 'Tech Corp' };
                expect(areBlocksEqual(a, b)).toBe(false);
            });

            it(`should return false for ${type} if organizations are different`, () => {
                const a = { type, title: 'Software Engineer', organization: 'Tech Corp' };
                const b = { type, title: 'Software Engineer', organization: 'Other Corp' };
                expect(areBlocksEqual(a, b)).toBe(false);
            });

            it(`should handle missing title or organization for ${type}`, () => {
                const a = { type };
                const b = { type, title: '', organization: '' };
                expect(areBlocksEqual(a, b)).toBe(true);
            });
        });
    });

    describe('skill type', () => {
        it('should return true if titles match exactly', () => {
            const a = { type: 'skill', title: 'React' };
            const b = { type: 'skill', title: 'React' };
            expect(areBlocksEqual(a, b)).toBe(true);
        });

        it('should return true if titles match with different case and whitespace', () => {
            const a = { type: 'skill', title: 'React' };
            const b = { type: 'skill', title: '  react  ' };
            expect(areBlocksEqual(a, b)).toBe(true);
        });

        it('should return false if titles are different', () => {
            const a = { type: 'skill', title: 'React' };
            const b = { type: 'skill', title: 'Vue' };
            expect(areBlocksEqual(a, b)).toBe(false);
        });

        it('should ignore organization for skill type', () => {
            const a = { type: 'skill', title: 'React', organization: 'A' };
            const b = { type: 'skill', title: 'React', organization: 'B' };
            expect(areBlocksEqual(a, b)).toBe(true);
        });
    });

    describe('summary type', () => {
        it('should always return true if types match', () => {
            const a = { type: 'summary', title: 'Summary A' };
            const b = { type: 'summary', title: 'Summary B' };
            expect(areBlocksEqual(a, b)).toBe(true);
        });
    });

    describe('other types', () => {
        it('should return false for unknown types', () => {
            const a = { type: 'unknown', title: 'Test' };
            const b = { type: 'unknown', title: 'Test' };
            expect(areBlocksEqual(a, b)).toBe(false);
        });
    });

    describe('Robustness and Edge Cases', () => {
        it('should treat whitespace-only title as empty string', () => {
            const a = { type: 'work', title: '   ', organization: 'Tech Corp' };
            const b = { type: 'work', title: '', organization: 'Tech Corp' };
            expect(areBlocksEqual(a, b)).toBe(true);
        });

        it('should treat whitespace-only organization as empty string', () => {
            const a = { type: 'work', title: 'Dev', organization: '   ' };
            const b = { type: 'work', title: 'Dev', organization: '' };
            expect(areBlocksEqual(a, b)).toBe(true);
        });

        it('should handle explicitly null fields gracefully', () => {
            const a = { type: 'work', title: null, organization: 'Tech Corp' };
            const b = { type: 'work', title: '', organization: 'Tech Corp' };
            // @ts-expect-error - testing runtime behavior
            expect(areBlocksEqual(a as any, b)).toBe(true);
        });

        it('should handle non-string title by converting to string', () => {
            const a = { type: 'work', title: 123, organization: 'Tech Corp' };
            const b = { type: 'work', title: '123', organization: 'Tech Corp' };
            // @ts-expect-error - testing runtime behavior
            expect(areBlocksEqual(a as any, b)).toBe(true);
        });

        it('should handle non-string organization by converting to string', () => {
            const a = { type: 'work', title: 'Dev', organization: { name: 'Corp' } };
            // Object.toString() is [object Object]
            const b = { type: 'work', title: 'Dev', organization: '[object Object]' };
            // @ts-expect-error - testing runtime behavior
            expect(areBlocksEqual(a as any, b)).toBe(true);
        });

        it('should handle undefined fields gracefully', () => {
            const a = { type: 'work', title: undefined, organization: 'Tech Corp' };
            const b = { type: 'work', title: '', organization: 'Tech Corp' };
            expect(areBlocksEqual(a, b)).toBe(true);
        });
    });
});
