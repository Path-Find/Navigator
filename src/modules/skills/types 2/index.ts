export interface VerificationCache {
    questions: string[];
    generatedAt: number;
    proficiencyLevel: string;
}

export interface CustomSkill {
    id: string;
    user_id: string;
    name: string;
    category?: 'hard' | 'soft';
    proficiency: 'learning' | 'comfortable' | 'expert';
    description?: string; // Brief explanation of what this skill means
    evidence?: string;
    verificationCache?: VerificationCache; // New: Cache for AI questions
    created_at: string;
    updated_at: string;
}
