import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CustomSkill } from '../../../types';
import { TRACKING_EVENTS } from '../../../constants';
import { Storage } from '../../../services/storageService';
import { EventService } from '../../../services/eventService';
import { useToast } from '../../../contexts/ToastContext';

interface SkillContextType {
    skills: CustomSkill[];
    interviewSkill: string | null;
    isLoading: boolean;

    // Actions
    setInterviewSkill: (skill: string | null) => void;
    handleInterviewComplete: (proficiency: CustomSkill['proficiency'], evidence: string, skillNameOverride?: string) => Promise<void>;
    updateSkills: (skills: CustomSkill[]) => void;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export const useSkillContext = () => {
    const context = useContext(SkillContext);
    if (!context) {
        throw new Error('useSkillContext must be used within a SkillProvider');
    }
    return context;
};

export const SkillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [skills, setSkills] = useState<CustomSkill[]>([]);
    const [interviewSkill, setInterviewSkill] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showError } = useToast();

    // Initial Load
    useEffect(() => {
        let mounted = true;
        Storage.getSkills().then(loadedSkills => {
            if (mounted) {
                setSkills(loadedSkills);
                setIsLoading(false);
            }
        }).catch(err => {
            console.error("Failed to load skills:", err);
            if (mounted) setIsLoading(false);
        });
        return () => { mounted = false; };
    }, []);

    const handleInterviewComplete = useCallback(async (proficiency: CustomSkill['proficiency'], evidence: string, skillNameOverride?: string) => {
        const skillToUpdate = skillNameOverride || interviewSkill;

        if (!skillToUpdate) return;

        try {
            const updatedSkill = await Storage.saveSkill({ name: skillToUpdate, proficiency, evidence });
            EventService.trackUsage(TRACKING_EVENTS.SKILLS);
            setSkills(prev => {
                const exists = prev.some(s => s.name === skillToUpdate);
                if (exists) {
                    return prev.map(s => s.name === skillToUpdate ? updatedSkill : s);
                }
                return [...prev, updatedSkill];
            });

            if (!skillNameOverride) {
                setInterviewSkill(null);
            }
        } catch (err) {
            console.error("Failed to save skill:", err);
            showError("Failed to save skill. Please try again.");
        }
    }, [interviewSkill, showError]);

    const updateSkills = useCallback((newSkills: CustomSkill[]) => {
        setSkills(newSkills);
        // Storage sync if needed? Usually we save individual updates.
    }, []);

    return (
        <SkillContext.Provider value={{
            skills,
            interviewSkill,
            isLoading,
            setInterviewSkill,
            handleInterviewComplete,
            updateSkills
        }}>
            {children}
        </SkillContext.Provider>
    );
};
