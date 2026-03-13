export const GPA_SCALES = {
    'OMSAS': {
        name: '4.0 (OMSAS/Ontario)',
        map: (grade: string | number): number => {
            if (typeof grade === 'number') {
                if (grade >= 90) return 4.0;
                if (grade >= 85) return 3.9;
                if (grade >= 80) return 3.7;
                if (grade >= 77) return 3.3;
                if (grade >= 73) return 3.0;
                if (grade >= 70) return 2.7;
                if (grade >= 67) return 2.3;
                if (grade >= 63) return 2.0;
                if (grade >= 60) return 1.7;
                if (grade >= 57) return 1.3;
                if (grade >= 53) return 1.0;
                if (grade >= 50) return 0.7;
                return 0.0;
            }
            const g = grade.toUpperCase().trim();
            if (['A+', 'A*'].includes(g)) return 4.0;
            if (g === 'A') return 3.9;
            if (g === 'A-') return 3.7;
            if (g === 'B+') return 3.3;
            if (g === 'B') return 3.0;
            if (g === 'B-') return 2.7;
            if (g === 'C+') return 2.3;
            if (g === 'C') return 2.0;
            if (g === 'C-') return 1.7;
            if (g === 'D+') return 1.3;
            if (g === 'D') return 1.0;
            if (g === 'D-') return 0.7;
            return 0.0;
        }
    },
    'YORK': {
        name: '9.0 (York)',
        map: (grade: string | number): number => {
            if (typeof grade === 'number') {
                if (grade >= 9) return 4.0;
                if (grade === 8) return 3.8;
                if (grade === 7) return 3.3;
                if (grade === 6) return 3.0;
                if (grade === 5) return 2.3;
                if (grade === 4) return 2.0;
                if (grade === 3) return 1.3;
                if (grade === 2) return 1.0;
                return 0.0;
            }
            const g = grade.toUpperCase().trim();
            if (g === 'A+') return 4.0;
            if (g === 'A') return 3.8;
            if (g === 'B+') return 3.3;
            if (g === 'B') return 3.0;
            if (g === 'C+') return 2.3;
            if (g === 'C') return 2.0;
            if (g === 'D+') return 1.3;
            if (g === 'D') return 1.0;
            return 0.0;
        }
    },
    'STANDARD_4': {
        name: '4.0 Standard',
        map: (grade: string | number): number => {
            if (typeof grade === 'number') return grade <= 4.0 ? grade : (grade / 100) * 4;
            const g = grade.toUpperCase().trim();
            const map: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
            return map[g] || 0.0;
        }
    }
};

export type ScaleKey = keyof typeof GPA_SCALES;

export const getGradePoint = (grade: string | number, scaleKey: ScaleKey = 'OMSAS'): number => {
    return GPA_SCALES[scaleKey].map(grade);
};
