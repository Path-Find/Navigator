import { describe, it, expect } from 'vitest';
import { getGradePoint } from './gpaUtils';

describe('gpaUtils', () => {
    describe('OMSAS Scale', () => {
        it('correctly maps percentage grades', () => {
            expect(getGradePoint(90, 'OMSAS')).toBe(4.0);
            expect(getGradePoint(85, 'OMSAS')).toBe(3.9);
            expect(getGradePoint(80, 'OMSAS')).toBe(3.7);
            expect(getGradePoint(77, 'OMSAS')).toBe(3.3);
            expect(getGradePoint(73, 'OMSAS')).toBe(3.0);
            expect(getGradePoint(70, 'OMSAS')).toBe(2.7);
            expect(getGradePoint(67, 'OMSAS')).toBe(2.3);
            expect(getGradePoint(63, 'OMSAS')).toBe(2.0);
            expect(getGradePoint(60, 'OMSAS')).toBe(1.7);
            expect(getGradePoint(57, 'OMSAS')).toBe(1.3);
            expect(getGradePoint(53, 'OMSAS')).toBe(1.0);
            expect(getGradePoint(50, 'OMSAS')).toBe(0.7);
            expect(getGradePoint(49, 'OMSAS')).toBe(0.0);
        });

        it('correctly maps letter grades', () => {
            expect(getGradePoint('A+', 'OMSAS')).toBe(4.0);
            expect(getGradePoint('A', 'OMSAS')).toBe(3.9);
            expect(getGradePoint('A-', 'OMSAS')).toBe(3.7);
            expect(getGradePoint('B+', 'OMSAS')).toBe(3.3);
            expect(getGradePoint('B', 'OMSAS')).toBe(3.0);
            expect(getGradePoint('B-', 'OMSAS')).toBe(2.7);
            expect(getGradePoint('C+', 'OMSAS')).toBe(2.3);
            expect(getGradePoint('C', 'OMSAS')).toBe(2.0);
            expect(getGradePoint('C-', 'OMSAS')).toBe(1.7);
            expect(getGradePoint('D+', 'OMSAS')).toBe(1.3);
            expect(getGradePoint('D', 'OMSAS')).toBe(1.0);
            expect(getGradePoint('D-', 'OMSAS')).toBe(0.7);
            expect(getGradePoint('F', 'OMSAS')).toBe(0.0);
        });

        it('is case insensitive', () => {
            expect(getGradePoint('a', 'OMSAS')).toBe(3.9);
            expect(getGradePoint(' b+ ', 'OMSAS')).toBe(3.3);
        });
    });

    describe('York Scale', () => {
        it('correctly maps numeric grades', () => {
            expect(getGradePoint(9, 'YORK')).toBe(4.0);
            expect(getGradePoint(8, 'YORK')).toBe(3.8);
            expect(getGradePoint(7, 'YORK')).toBe(3.3);
            expect(getGradePoint(2, 'YORK')).toBe(1.0);
            expect(getGradePoint(1, 'YORK')).toBe(0.0);
        });

        it('correctly maps letter grades', () => {
            expect(getGradePoint('A+', 'YORK')).toBe(4.0);
            expect(getGradePoint('A', 'YORK')).toBe(3.8);
            expect(getGradePoint('B+', 'YORK')).toBe(3.3);
            expect(getGradePoint('D', 'YORK')).toBe(1.0);
        });
    });

    describe('Standard 4.0 Scale', () => {
        it('correctly maps percentage to 4.0', () => {
            expect(getGradePoint(100, 'STANDARD_4')).toBe(4.0);
            expect(getGradePoint(75, 'STANDARD_4')).toBe(3.0);
            expect(getGradePoint(3.5, 'STANDARD_4')).toBe(3.5);
        });

        it('correctly maps letter grades', () => {
            expect(getGradePoint('A', 'STANDARD_4')).toBe(4.0);
            expect(getGradePoint('B', 'STANDARD_4')).toBe(3.0);
            expect(getGradePoint('F', 'STANDARD_4')).toBe(0.0);
        });
    });
});
