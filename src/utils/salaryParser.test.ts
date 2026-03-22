import { describe, it, expect } from 'vitest';
import { parseSalary, formatSalary } from './salaryParser';

describe('parseSalary', () => {
    it('returns null for empty or falsy input', () => {
        expect(parseSalary('')).toBeNull();
    });

    it('parses a dollar range with dash', () => {
        const result = parseSalary('$60,000 - $80,000');
        expect(result).toEqual({ min: 60000, max: 80000, midpoint: 70000 });
    });

    it('parses a K-notation range', () => {
        const result = parseSalary('$60k - $80k');
        expect(result).toEqual({ min: 60000, max: 80000, midpoint: 70000 });
    });

    it('parses a range with "to" separator', () => {
        const result = parseSalary('$70k to $90k');
        expect(result).toEqual({ min: 70000, max: 90000, midpoint: 80000 });
    });

    it('parses an em-dash range', () => {
        const result = parseSalary('$50,000\u2013$70,000');
        expect(result).toEqual({ min: 50000, max: 70000, midpoint: 60000 });
    });

    it('parses a single number as min/max/midpoint', () => {
        const result = parseSalary('$90,000');
        expect(result).toEqual({ min: 90000, max: 90000, midpoint: 90000 });
    });

    it('parses a single K value', () => {
        const result = parseSalary('$90k');
        expect(result).toEqual({ min: 90000, max: 90000, midpoint: 90000 });
    });

    it('converts hourly to annual (2080 hrs)', () => {
        const result = parseSalary('$25/hr');
        expect(result).toEqual({ min: 52000, max: 52000, midpoint: 52000 });
    });

    it('converts hourly range to annual', () => {
        const result = parseSalary('$20 - $30 per hour');
        expect(result).toEqual({ min: 41600, max: 62400, midpoint: 52000 });
    });

    it('returns null when no numbers are found', () => {
        expect(parseSalary('competitive salary')).toBeNull();
    });

    it('falls back to single-number match when range is inverted (min > max)', () => {
        // The inverted range is rejected; the parser then finds the first number as a single match
        const result = parseSalary('$90k - $50k');
        expect(result).toEqual({ min: 90000, max: 90000, midpoint: 90000 });
    });
});

describe('formatSalary', () => {
    it('formats thousands as K with no decimal when even', () => {
        expect(formatSalary(90000)).toBe('$90K');
        expect(formatSalary(100000)).toBe('$100K');
    });

    it('formats thousands as K with one decimal when not even', () => {
        expect(formatSalary(85500)).toBe('$85.5K');
    });

    it('formats sub-thousand amounts as plain dollars', () => {
        expect(formatSalary(500)).toBe('$500');
        expect(formatSalary(999)).toBe('$999');
    });

    it('formats exactly 1000 as $1K', () => {
        expect(formatSalary(1000)).toBe('$1K');
    });
});
