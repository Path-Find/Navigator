import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import type { Transcript, Course, AdmissionEligibility } from '../types';
import { analyzeCurrentProgramRequirements } from '../../../services/ai/eduAiService';
import { parseTranscript } from '../../../services/geminiService';
import { useToast } from '../../../contexts/ToastContext';

export const useAcademicLogic = () => {
    const [transcript, setTranscript] = useLocalStorage<Transcript | null>('NAVIGATOR_TRANSCRIPT_CACHE', null);
    const [targetCredits, setTargetCredits] = useLocalStorage<number>('NAVIGATOR_TARGET_CREDITS', 0);
    const [tempTranscript, setTempTranscript] = useState<Transcript | null>(null);
    const [showVerification, setShowVerification] = useState(false);
    const [editingCourse, setEditingCourse] = useState<{
        semIndex: number;
        courseIndex: number;
        course: Course
    } | null>(null);
    const [programRequirements, setProgramRequirements] = useLocalStorage<AdmissionEligibility | null>('NAVIGATOR_PROGRAM_REQUIREMENTS', null);
    const [isParsingRequirements, setIsAnalyzingRequirements] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const { showError } = useToast();

    const handleFileUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];

        if (!file.type.includes('pdf')) {
            setParseError('Please upload a PDF transcript.');
            return;
        }

        setIsParsing(true);
        setParseError(null);

        try {
            await new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = (reader.result as string).split(',')[1];
                    try {
                        const parsed = await parseTranscript(base64, file.type);
                        setTempTranscript(parsed);
                        setShowVerification(true);
                        resolve();
                    } catch (err: unknown) {
                        reject(err);
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });
        } catch (e: unknown) {
            setParseError(e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            setIsParsing(false);
        }
    }, [setTempTranscript, setShowVerification]);

    const toTitleCase = (str: string) => {
        if (!str) return str;
        // If it's all caps and more than one word, title case it
        if (str === str.toUpperCase() && str.length > 3) {
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        return str;
    };

    const handleVerificationSave = useCallback((verified: Transcript) => {
        // Formatter to clean up screaming caps
        const cleaned: Transcript = {
            ...verified,
            studentName: toTitleCase(verified.studentName || ''),
            university: toTitleCase(verified.university || ''),
            program: toTitleCase(verified.program || ''),
            semesters: verified.semesters.map(sem => ({
                ...sem,
                courses: sem.courses.map(course => ({
                    ...course,
                    title: toTitleCase(course.title)
                }))
            }))
        };
        setTranscript(cleaned);
        setTempTranscript(null);
    }, [setTranscript]);

    const handleCourseUpdate = useCallback((updated: Course, targetSemIndex?: number) => {
        if (!transcript || !editingCourse) return;

        const { semIndex: sourceSemIndex, courseIndex } = editingCourse;
        const targetIndex = targetSemIndex !== undefined ? targetSemIndex : sourceSemIndex;

        const newSemesters = [...transcript.semesters];

        if (sourceSemIndex === targetIndex) {
            // Simple update within the same semester
            const newCourses = [...newSemesters[sourceSemIndex].courses];
            newCourses[courseIndex] = updated;
            newSemesters[sourceSemIndex] = { ...newSemesters[sourceSemIndex], courses: newCourses };
        } else {
            // Move between semesters
            // 1. Remove from source
            const sourceCourses = [...newSemesters[sourceSemIndex].courses];
            sourceCourses.splice(courseIndex, 1);
            newSemesters[sourceSemIndex] = { ...newSemesters[sourceSemIndex], courses: sourceCourses };

            // 2. Add to target
            const targetCourses = [...newSemesters[targetIndex].courses];
            targetCourses.push(updated); // Add to end of target semester
            newSemesters[targetIndex] = { ...newSemesters[targetIndex], courses: targetCourses };
        }

        setTranscript({ ...transcript, semesters: newSemesters });
        setEditingCourse(null);
    }, [transcript, editingCourse, setTranscript]);

    const handleCourseDelete = useCallback(() => {
        if (!transcript || !editingCourse) return;

        const newSemesters = transcript.semesters.map((sem, idx) => {
            if (idx !== editingCourse.semIndex) return sem;
            const newCourses = [...sem.courses];
            newCourses.splice(editingCourse.courseIndex, 1);
            return { ...sem, courses: newCourses };
        });

        setTranscript({ ...transcript, semesters: newSemesters });
        setEditingCourse(null);
    }, [transcript, editingCourse, setTranscript]);

    const fetchRequirements = useCallback(async () => {
        if (!transcript || !transcript.program || !transcript.university) return;

        setIsAnalyzingRequirements(true);
        try {
            const result = await analyzeCurrentProgramRequirements(
                transcript,
                transcript.program,
                transcript.university
            );
            setProgramRequirements(result);
            if (result.targetCredits) {
                setTargetCredits(result.targetCredits);
            }
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : "Failed to analyze program requirements");
        } finally {
            setIsAnalyzingRequirements(false);
        }
    }, [transcript, setProgramRequirements, setTargetCredits, showError]);

    // Cleanup requirements if transcript is reset
    useEffect(() => {
        if (!transcript) {
            setProgramRequirements(null);
        }
    }, [transcript, setProgramRequirements]);

    const addSemester = useCallback(() => {
        if (!transcript) return;
        const newSemesters = [...transcript.semesters];

        // Predict next term
        let newTerm = 'Next Term';
        let newYear = new Date().getFullYear();

        if (newSemesters.length > 0) {
            const last = newSemesters[0]; // Assuming reverse chronological order (newest first)
            newYear = last.year;
            if (last.term.toLowerCase().includes('fall') || last.term.toLowerCase().includes('fw')) {
                newTerm = 'Winter';
                newYear++;
            } else if (last.term.toLowerCase().includes('winter')) {
                newTerm = 'Summer';
            } else {
                newTerm = 'Fall';
            }
        }

        newSemesters.unshift({
            term: newTerm,
            year: newYear,
            courses: []
        });

        setTranscript({ ...transcript, semesters: newSemesters });
    }, [transcript, setTranscript]);

    const deleteSemester = useCallback((semIndex: number) => {
        if (!transcript) return;
        if (!confirm('Are you sure you want to delete this semester and all its courses?')) return;

        const newSemesters = [...transcript.semesters];
        newSemesters.splice(semIndex, 1);
        setTranscript({ ...transcript, semesters: newSemesters });
    }, [transcript, setTranscript]);

    const addCourse = useCallback((semIndex: number) => {
        if (!transcript) return;

        const newSemesters = [...transcript.semesters];
        newSemesters[semIndex].courses.push({
            code: 'NEW 100',
            title: 'New Course',
            grade: '', // Empty grade = Planned
            credits: 3.0 // Default credits (usually 3.0 or 0.5 depending on system, user can edit)
        });

        setTranscript({ ...transcript, semesters: newSemesters });
    }, [transcript, setTranscript]);

    const totalCredits = useMemo(() => transcript
        ? transcript.semesters.reduce((acc, s) => acc + s.courses.reduce((cAcc, c) => {
            // Only count completed courses (with a grade)
            return (c.grade && c.grade.trim().length > 0) ? cAcc + (c.credits || 0) : cAcc;
        }, 0), 0)
        : 0, [transcript]);

    const calculatedGpa = useMemo(() => {
        if (!transcript) return '0.00';

        // 4.0 Scale Mapping
        const gradeMap: Record<string, number> = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'E': 0, 'F': 0
        };

        let totalPoints = 0;
        let totalUnits = 0;

        transcript.semesters.forEach(sem => {
            sem.courses.forEach(course => {
                const gradeKey = course.grade?.trim().toUpperCase();
                if (!gradeKey) return;

                let points = gradeMap[gradeKey];

                // Numeric fallback
                if (points === undefined && !isNaN(parseFloat(gradeKey))) {
                    const num = parseFloat(gradeKey);
                    if (num >= 90) points = 4.0;
                    else if (num >= 85) points = 3.9;
                    else if (num >= 80) points = 3.7;
                    else if (num >= 77) points = 3.3;
                    else if (num >= 73) points = 3.0;
                    else if (num >= 70) points = 2.7;
                    else if (num >= 67) points = 2.3;
                    else if (num >= 63) points = 2.0;
                    else if (num >= 60) points = 1.7;
                    else if (num >= 50) points = 1.0;
                    else points = 0;
                }

                if (points !== undefined) {
                    const credits = course.credits || 0;
                    totalPoints += points * credits;
                    totalUnits += credits;
                }
            });
        });

        return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
    }, [transcript]);

    const progressPercentage = useMemo(() => targetCredits > 0 ? Math.min((totalCredits / targetCredits) * 100, 100) : 0, [totalCredits, targetCredits]);

    return {
        transcript,
        setTranscript,
        targetCredits,
        setTargetCredits,
        tempTranscript,
        showVerification,
        setShowVerification,
        editingCourse,
        setEditingCourse,
        handleFileUpload,
        isParsing,
        parseError,
        handleVerificationSave,
        handleCourseUpdate,
        handleCourseDelete,
        totalCredits,
        progressPercentage,
        calculatedGpa,
        addSemester,
        deleteSemester,
        addCourse,
        programRequirements,
        isAnalyzingRequirements: isParsingRequirements,
        fetchRequirements
    };
};
