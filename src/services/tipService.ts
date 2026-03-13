import type { ResumeProfile } from '../modules/resume/types';


export interface Tip {
    id: string;
    text: string;
    category: 'quantification' | 'formatting' | 'strategy' | 'ats' | 'narrative';
}

const GENERAL_TIPS: Tip[] = [
    {
        id: 'quant-1',
        text: 'Pro Tip: Ditch the "Responsibilities included" list. Start every bullet with a strong action verb and end with a result or metric.',
        category: 'quantification'
    },
    {
        id: 'ats-1',
        text: 'Pro Tip: ATS systems scan for "contextual relevance". Don\'t just list skills—weave them into your achievements to prove you used them.',
        category: 'ats'
    },
    {
        id: 'strat-1',
        text: 'Pro Tip: Target one specific role at a time. If you\'re applying for "Marketing Manager", that phrase should appear at least 3 times in your resume.',
        category: 'strategy'
    },
    {
        id: 'narrative-1',
        text: 'Pro Tip: Use the STAR method (Situation, Task, Action, Result) for your most significant projects to give recruiters the full picture.',
        category: 'narrative'
    },
    {
        id: 'quant-2',
        text: 'Pro Tip: Ask "So What?" for every bullet. If you "Created a dashboard," did it save 5 hours a week? Did it identify $10k in lost revenue?',
        category: 'quantification'
    },
    {
        id: 'formatting-1',
        text: 'Pro Tip: White space is your friend. Recruiter eyes skip over large blocks of text. Keep bullets under three lines long.',
        category: 'formatting'
    }
];

export class TipService {
    static getTip(resume?: ResumeProfile): Tip {
        if (!resume || resume.blocks.length === 0) {
            return {
                id: 'onboarding-1',
                text: 'Pro Tip: Import your current resume to see how our AI identifies your hidden strengths and skill gaps.',
                category: 'strategy'
            };
        }

        const hasSummary = resume.blocks.some(b => b.type === 'summary');
        if (!hasSummary) {
            return {
                id: 'context-summary',
                text: 'Pro Tip: Add a Professional Summary. It\'s your elevator pitch to recruiters and helps set the tone for your profile.',
                category: 'narrative'
            };
        }

        const workBlocks = resume.blocks.filter(b => b.type === 'work');
        const lowBulletCount = workBlocks.some(b => b.bullets.length < 2);
        if (lowBulletCount) {
            return {
                id: 'context-bullets',
                text: 'Pro Tip: Detailed achievements beat lists of duties. Try to add 3-5 high-impact bullet points for your most recent roles.',
                category: 'quantification'
            };
        }

        // Return a random general tip
        return GENERAL_TIPS[Math.floor(Math.random() * GENERAL_TIPS.length)];
    }
}
