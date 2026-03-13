import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { useAcademicLogic } from './useAcademicLogic';
import type { Transcript } from '../types';

vi.mock('../../../contexts/ToastContext', () => ({
    useToast: () => ({
        showError: vi.fn(),
        showSuccess: vi.fn(),
        showInfo: vi.fn(),
    })
}));

const mockStorage: Record<string, any> = {
    'NAVIGATOR_TARGET_CREDITS': 20.0
};

vi.mock('../../../hooks/useLocalStorage', () => ({
    useLocalStorage: vi.fn((key: string, initialValue: any) => {
        if (!(key in mockStorage)) {
            mockStorage[key] = initialValue;
        }

        // Wrap with useState so state updates trigger re-renders in the hook
        const [state, setState] = useState(mockStorage[key]);

        const setValue = (newValue: any) => {
            mockStorage[key] = newValue;
            setState(newValue);
        };

        return [state, setValue];
    })
}));

// Mock transcript data
const mockTranscript: Transcript = {
    id: 'test-transcript-id',
    university: 'Test University',
    program: 'Computer Science',
    studentName: 'John Doe',
    cgpa: 3.8,
    dateUploaded: Date.now(),
    semesters: [
        {
            term: 'Fall',
            year: 2023,
            courses: [
                { code: 'CS101', title: 'Intro to CS', grade: 'A', credits: 0.5 },
                { code: 'MATH101', title: 'Calculus I', grade: 'B+', credits: 0.5 }
            ]
        }
    ]
};

describe('useAcademicLogic', () => {
    beforeEach(() => {
        // Reset the mock storage explicitly before every test
        for (const key in mockStorage) {
            delete mockStorage[key];
        }
        mockStorage['NAVIGATOR_TARGET_CREDITS'] = 20.0;
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useAcademicLogic());
        expect(result.current.transcript).toBeNull();
        expect(result.current.targetCredits).toBe(20.0);
        expect(result.current.totalCredits).toBe(0);
        expect(result.current.progressPercentage).toBe(0);
    });



    it('handles verification save', () => {
        const { result } = renderHook(() => useAcademicLogic());

        act(() => {
            result.current.handleVerificationSave(mockTranscript);
        });

        expect(result.current.transcript).toEqual(mockTranscript);
        expect(result.current.tempTranscript).toBeNull();
    });

    it('calculates total credits accurately', () => {
        const { result } = renderHook(() => useAcademicLogic());

        act(() => {
            result.current.handleVerificationSave(mockTranscript);
        });

        // 0.5 + 0.5 = 1.0
        expect(result.current.totalCredits).toBe(1.0);
        // (1.0 / 20.0) * 100 = 5%
        expect(result.current.progressPercentage).toBe(5);
    });

    it('updates total credits when targetCredits changes', () => {
        const { result } = renderHook(() => useAcademicLogic());

        act(() => {
            result.current.handleVerificationSave(mockTranscript);
            result.current.setTargetCredits(10.0);
        });

        // (1.0 / 10.0) * 100 = 10%
        expect(result.current.progressPercentage).toBe(10);
    });

    it('handles course deletion and updates stats', async () => {
        const { result } = renderHook(() => useAcademicLogic());
        const localTranscript = JSON.parse(JSON.stringify(mockTranscript));

        act(() => {
            result.current.handleVerificationSave(localTranscript);
        });

        expect(result.current.totalCredits).toBe(1.0);

        act(() => {
            result.current.setEditingCourse({
                semIndex: 0,
                courseIndex: 0,
                course: result.current.transcript!.semesters[0].courses[0]
            });
        });

        act(() => {
            result.current.handleCourseDelete();
        });

        await waitFor(() => {
            expect(result.current.transcript?.semesters[0].courses.length).toBe(1);
            expect(result.current.totalCredits).toBe(0.5);
            expect(result.current.progressPercentage).toBe(2.5);
        });
    });
});
