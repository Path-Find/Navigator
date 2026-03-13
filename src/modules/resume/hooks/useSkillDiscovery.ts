import { useMemo } from 'react';
import type { ExperienceBlock } from '../types';
import type { CustomSkill } from '../../skills/types';
import { isRecognizedSkill } from '../../../data/skillDatabase';

const ACTION_VERBS = new Set(['Doing', 'Working', 'Led', 'Managed', 'Developed', 'Created', 'Implemented', 'Designed', 'Built', 'Oversaw', 'Supervised', 'Coordinated', 'Monitored', 'Evaluated', 'Analyzed', 'Researched', 'Presented', 'Reported', 'Negotiated', 'Facilitated', 'Collaborated', 'Supported', 'Assisted', 'Provided', 'Handled', 'Operated', 'Maintained', 'Repaired', 'Installed', 'Performed', 'Conducted', 'Participated', 'Attended', 'Represented', 'Served', 'Acted', 'Assigned', 'Awarded', 'Earned', 'Gained', 'Obtained', 'Received', 'Recognized', 'Selected', 'Chosen', 'Nominated', 'Appointed', 'Promoted', 'Increased', 'Improved', 'Enhanced', 'Expanded', 'Reduced', 'Saved', 'Generated', 'Produced', 'Delivered', 'Completed', 'Achieved', 'Exceeded', 'Met', 'Succeeded']);
const GENERIC_TITLES = new Set(['Program', 'Representative', 'Student', 'Students', 'Member', 'Officer', 'Coordinator', 'Director', 'Manager', 'Lead', 'Analyst', 'Consultant', 'Specialist', 'Assistant', 'Advisor', 'Chair', 'President', 'Vice', 'Head', 'Chief', 'Intern', 'Volunteer', 'Employee', 'Staff', 'Associate', 'Participant', 'Group', 'Team', 'Unit', 'Corps', 'Candidate', 'Scholar', 'Fellow']);
const CONTEXT_WORDS = new Set(['University', 'College', 'School', 'Department', 'Institute', 'Academy', 'Foundation', 'Association', 'Organization', 'Company', 'Corporation', 'Agency', 'Board', 'Committee', 'Council', 'Federation', 'Society', 'Union', 'Club', 'League', 'Party', 'Major', 'Minor', 'Degree', 'Course', 'Class', 'Project', 'Experience', 'History', 'Summary', 'Profile', 'Skill', 'Skills', 'Change', 'Focused', 'Proven', 'Relevant', 'Strong', 'Excellent', 'Highly', 'Professional', 'Based', 'Context', 'Results', 'Action', 'Impact', 'Goal', 'Target', 'Status', 'Level', 'Standard', 'Quality', 'Process', 'Spring', 'Fall', 'Summer', 'Winter', 'Semester', 'Quarter', 'Session', 'Year', 'Annual', 'Monthly', 'Weekly', 'Daily']);

interface UseSkillDiscoveryResult {
    verifiedSkills: CustomSkill[];
    uniqueDiscovered: string[];
}

export function useSkillDiscovery(blocks: ExperienceBlock[], skills: CustomSkill[]): UseSkillDiscoveryResult {
    return useMemo(() => {
        const allText = blocks.flatMap(b => [...b.bullets, b.title, b.organization]).join(' ').toLowerCase();
        const verifiedSkills = skills.filter(s => allText.includes(s.name.toLowerCase()));

        const explicitSkills = blocks
            .filter(b => b.type === 'skill')
            .flatMap(b => b.bullets)
            .filter(bul => bul.trim().length > 0)
            .map(bul => bul.trim());

        const discovered = blocks
            .filter(b => b.type !== 'skill')
            .flatMap(b => b.bullets)
            .join(' ')
            .match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2}/g)
            ?.map(s => s.trim())
            .filter(s => {
                const words = s.split(/\s+/);
                if (words.length === 0) return false;
                if (ACTION_VERBS.has(words[0])) return false;
                const allGeneric = words.every(w =>
                    GENERIC_TITLES.has(w) || CONTEXT_WORDS.has(w) || ACTION_VERBS.has(w)
                );
                if (allGeneric) return false;
                const lastWord = words[words.length - 1];
                if (['Student', 'Students', 'Member', 'Members', 'Associate', 'Representative'].includes(lastWord)) return false;
                return (
                    isRecognizedSkill(s) &&
                    s.length > 3 &&
                    !explicitSkills.includes(s) &&
                    !skills.some(ks => ks.name.toLowerCase() === s.toLowerCase())
                );
            }) || [];

        const uniqueDiscovered = Array.from(new Set(discovered)).slice(0, 6);
        return { verifiedSkills, uniqueDiscovered };
    }, [blocks, skills]);
}
