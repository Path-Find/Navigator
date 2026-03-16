import React from 'react';
import { GPACalculator } from '../GPACalculator';
import { MAEligibility } from '../MAEligibility';
import { SkillExtractor } from '../SkillExtractor';
import type { Transcript } from '../../../types';

interface AcademicProgramsProps {
    transcript: Transcript;
    onAddSkills?: (skills: Array<{ name: string; category?: 'hard' | 'soft'; proficiency: 'learning' | 'comfortable' | 'expert' }>) => Promise<void>;
}

export const AcademicPrograms: React.FC<AcademicProgramsProps> = ({ transcript, onAddSkills }) => {
    return (
        <div className="space-y-8">
            <GPACalculator transcript={transcript} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MAEligibility transcript={transcript} />
                {onAddSkills && <SkillExtractor transcript={transcript} onAddSkills={onAddSkills} />}
            </div>
        </div>
    );
};
