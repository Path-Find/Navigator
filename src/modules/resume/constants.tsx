import React from 'react';
import { UserCircle, Briefcase, GraduationCap, Heart, Code, Layers } from 'lucide-react';
import type { ExperienceBlock } from './types';
import type { EducationCredentialType } from './types';

export const EDUCATION_CREDENTIAL_TYPES: EducationCredentialType[] = [
    'High school', 'Certificate', 'Diploma', 'Associate degree',
    "Bachelor's degree", "Master's degree", 'Doctorate', 'Professional degree', 'Other',
];

export type SectionType = ExperienceBlock['type'];

export const SECTIONS: { type: SectionType; label: string; icon: React.ReactNode }[] = [
    { type: 'summary', label: 'Professional Summary', icon: <UserCircle className="w-4 h-4" /> },
    { type: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
    { type: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { type: 'volunteer', label: 'Volunteer', icon: <Heart className="w-4 h-4" /> },
    { type: 'project', label: 'Projects', icon: <Code className="w-4 h-4" /> },
    { type: 'other', label: 'Other', icon: <Layers className="w-4 h-4" /> },
];

export const getSortDate = (dateRange: string): number => {
    if (!dateRange) return 0;
    const parts = dateRange.split(/[-–—]| to /).map(p => p.trim());
    const end = parts[parts.length - 1] || parts[0];
    if (!end) return 0;
    const lowerEnd = end.toLowerCase();
    if (lowerEnd.includes('present') || lowerEnd.includes('current')) return Date.now() + 1000000;
    const date = new Date(end);
    if (!isNaN(date.getTime())) return date.getTime();
    const yearMatch = end.match(/\d{4}/);
    if (yearMatch) return new Date(`${yearMatch[0]}-12-31`).getTime();
    return 0;
};

export const getTypeColor = (type: string): string => {
    switch (type) {
        case 'summary': return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        case 'work': return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        case 'education': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        case 'volunteer': return 'text-rose-600 bg-rose-50 border-rose-200';
        case 'project': return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'other': return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
};
