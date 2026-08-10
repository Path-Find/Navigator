export interface Course {
    code: string;
    title: string;
    grade: string; // "A+", "85", "Pass"
    credits: number; // e.g. 0.5 or 1.0
    term?: string; // "Fall 2023"
    /**
     * Optional explicit status for imported records. York's class list uses
     * the presence of a grade as the authoritative signal, so callers should
     * use getCourseCompletionStatus rather than trusting this field alone.
     */
    status?: CourseCompletionStatus;
}

export type CourseCompletionStatus = 'completed' | 'upcoming' | 'withdrawn';

/**
 * York class-list semantics: a grade means the course has an outcome; a
 * blank grade means it is upcoming/planned. A withdrawal is not completed
 * academic evidence even though it has a recorded grade marker.
 */
export const getCourseCompletionStatus = (course: Pick<Course, 'grade'>): CourseCompletionStatus => {
    const grade = (course.grade || '').trim().toUpperCase();
    if (!grade) return 'upcoming';
    if (grade === 'W' || grade === 'WITHDRAWN') return 'withdrawn';
    return 'completed';
};

export interface Semester {
    term: string; // "Fall 2023"
    year: number;
    courses: Course[];
    semesterGpa?: number;
}

export interface Transcript {
    id: string;
    studentName?: string;
    university?: string;
    program?: string;
    credentialType?: string; // e.g. "Bachelor's Degree", "Master's Degree"
    cgpa?: number; // Cumulative GPA if found
    semesters: Semester[];
    rawText?: string;
    dateUploaded: number;
}

export interface AdmissionPrerequisite {
    requirement: string;
    status: 'met' | 'missing' | 'in-progress';
    mapping?: string;
    description: string;
}

export interface AdmissionEligibility {
    probability: 'High' | 'Medium' | 'Low';
    analysis: string;
    gpaVerdict: string;
    gpaContext: string;
    gpaBenchmark?: {
        userGPA: string;
        typicalIntake: string;
        standing: 'Safe' | 'Competitive' | 'Reach';
    };
    prerequisites?: AdmissionPrerequisite[];
    weaknesses: string[];
    recommendations: string[];
    targetCredits?: number;
}

export interface ProjectProposal {
    title: string;
    course: string;
    description: string;
    skills: string[];
    evidence: string;
}
