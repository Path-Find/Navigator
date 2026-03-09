import { generateSkillQuestions } from './geminiService';
import { LocalStorage } from '../utils/localStorage';

interface SkillQuestions {
    skillName: string;
    proficiency: string;
    questions: string[];
    generatedAt: number;
}

const CACHE_KEY = 'skillQuestions_cache_v2'; // Bump version to invalidate old cache
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getSkillVerificationQuestions(skillName: string, proficiency: string, useAI: boolean = true): Promise<string[]> {
    // If AI is disabled, return fallback immediately (don't check/pollute cache with static data)
    if (!useAI) {
        return getFallbackQuestions(skillName);
    }

    // Check cache first
    const cached = getFromCache(skillName, proficiency);
    if (cached) {
        return cached;
    }

    // Generate new questions
    const questions = await generateQuestionsForSkill(skillName, proficiency);

    // Cache them
    saveToCache(skillName, proficiency, questions);

    return questions;
}

async function generateQuestionsForSkill(skillName: string, proficiency: string): Promise<string[]> {
    try {
        const { questions } = await generateSkillQuestions(skillName, proficiency);
        return questions.length > 0 ? questions : getFallbackQuestions(skillName);
    } catch (error) {
        console.error("AI Generation failed, using fallback", error);
        return getFallbackQuestions(skillName);
    }
}

function getFallbackQuestions(skillName: string): string[] {
    return [
        `I have experience with ${skillName}`,
        `I can work independently with ${skillName}`,
        `I have used ${skillName} in multiple projects`
    ];
}

function getFromCache(skillName: string, proficiency: string): string[] | null {
    try {
        const cacheStr = LocalStorage.get(CACHE_KEY);
        if (!cacheStr) return null;

        const cache: SkillQuestions[] = JSON.parse(cacheStr);
        const cached = cache.find(
            item =>
                item.skillName.toLowerCase() === skillName.toLowerCase() &&
                item.proficiency === proficiency
        );

        if (!cached) return null;

        // Check if cache is still valid
        const age = Date.now() - cached.generatedAt;
        if (age > CACHE_DURATION) {
            return null; // Cache expired
        }

        return cached.questions;
    } catch (error) {
        console.error('Error reading skill questions cache:', error);
        return null;
    }
}

function saveToCache(skillName: string, proficiency: string, questions: string[]): void {
    try {
        const cacheStr = LocalStorage.get(CACHE_KEY);
        let cache: SkillQuestions[] = cacheStr ? JSON.parse(cacheStr) : [];

        // Remove old entry for this skill+level if exists
        cache = cache.filter(
            item => !(item.skillName.toLowerCase() === skillName.toLowerCase() && item.proficiency === proficiency)
        );

        // Add new entry
        cache.push({
            skillName,
            proficiency,
            questions,
            generatedAt: Date.now()
        });

        // Keep cache size reasonable (max 100 entries)
        if (cache.length > 100) {
            cache = cache.slice(-100);
        }

        LocalStorage.set(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error('Error saving skill questions cache:', error);
    }
}
