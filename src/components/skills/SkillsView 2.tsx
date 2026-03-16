import React, { useState, useMemo } from 'react';
import type { CustomSkill } from '../../types';
import { Storage } from '../../services/storageService';
import { SharedPageLayout } from '../common/SharedPageLayout';
import { Zap } from 'lucide-react';
import { StandardSearchBar } from '../common/StandardSearchBar';
import { StandardFilterGroup } from '../common/StandardFilterGroup';
import { suggestSkillsFromResumes } from '../../services/geminiService';
import { useToast } from '../../contexts/ToastContext';
import { SkillCard } from './SkillCard';
import { SkillsStats } from './SkillsStats';
import { AddSkillModal } from './AddSkillModal';
import { SkillSuggestions } from './SkillSuggestions';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../constants';

import { useNavigate } from 'react-router-dom';
import { useSkillContext } from '../../modules/skills/context/SkillContext';
import { useResumeContext } from '../../modules/resume/context/ResumeContext';

export const SkillsView: React.FC = () => {
    const navigate = useNavigate();
    const { skills, updateSkills: onSkillsUpdated } = useSkillContext();
    const { resumes } = useResumeContext();

    const onStartUnifiedInterview = (skillsToVerify: { name: string; proficiency: string }[]) => {
        navigate('/career/skills/interview', { state: { skills: skillsToVerify } });
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Persist suggestions in LocalStorage so they don't vanish on unmount/reload
    const [suggestions, setSuggestions] = useLocalStorage<Array<{ name: string; description: string }>>(
        STORAGE_KEYS.SKILL_SUGGESTIONS,
        []
    );
    const [isSuggesting, setIsSuggesting] = useState(false);
    const { showSuccess } = useToast();

    // Dynamically filter suggestions: Include only those NOT in current skills
    const displayedSuggestions = suggestions.filter(s =>
        !skills.some(existing => existing.name.toLowerCase() === s.name.toLowerCase())
    );

    // Skills that haven't been verified yet
    const unverifiedSkills = skills.filter(s => !s.evidence);

    const handleAddSkill = async (newSkillName: string) => {
        if (!newSkillName.trim()) return;

        try {
            const newSkill = await Storage.saveSkill({
                name: newSkillName.trim(),
                proficiency: 'learning'
            });
            onSkillsUpdated([...skills, newSkill]);
            setIsAdding(false);
        } catch (err) {
            console.error("Add Skill Failed", err);
        }
    };

    const handleDeleteSkill = async (name: string) => {
        await Storage.deleteSkill(name);
        onSkillsUpdated(skills.filter(s => s.name !== name));
        showSuccess(`Removed ${name}`);
    };

    const FILTER_OPTIONS = [
        { id: 'all', label: 'All' },
        { id: 'learning', label: 'Learning' },
        { id: 'comfortable', label: 'Comfortable' },
        { id: 'expert', label: 'Expert' },
    ] as const;

    type ProficiencyFilter = typeof FILTER_OPTIONS[number]['id'];

    const [filter, setFilter] = useState<ProficiencyFilter>('all');

    const filteredSkills = useMemo(() => {
        return skills
            .filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFilter = filter === 'all' || s.proficiency === filter;
                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [skills, searchTerm, filter]);


    const handleSuggestSkills = async () => {
        setIsSuggesting(true);
        try {
            const rawSuggestions = await suggestSkillsFromResumes(resumes);
            setSuggestions(rawSuggestions);
        } catch (err) {
            console.error("Suggestion Failed", err);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleAddSuggestedSkill = async (name: string, description?: string) => {
        try {
            const newSkill = await Storage.saveSkill({
                name,
                proficiency: 'learning',
                description
            });
            onSkillsUpdated([...skills, newSkill]);
        } catch (err) {
            console.error("Add Suggested Skill Failed", err);
        }
    };

    const handleStartVerification = () => {
        const skillsToVerify = unverifiedSkills.map(s => ({
            name: s.name,
            proficiency: s.proficiency,
        }));
        onStartUnifiedInterview(skillsToVerify);
    };

    return (
        <SharedPageLayout className="theme-coach" spacing="compact" maxWidth="6xl">
            {/* Quick Stats */}
            <SkillsStats
                skills={skills}
                onSuggestSkills={handleSuggestSkills}
                isSuggesting={isSuggesting}
                onAddSkill={() => setIsAdding(true)}
                onVerifySkills={handleStartVerification}
                unverifiedCount={unverifiedSkills.length}
            />

            {/* Suggestions Area */}
            <SkillSuggestions
                suggestions={displayedSuggestions}
                onAddSuggestion={handleAddSuggestedSkill}
                onClear={() => setSuggestions([])}
            />

            {/* Filter & Search */}
            <div className="mb-6">
                <StandardSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search"
                    themeColor="emerald"
                    rightElement={
                        <StandardFilterGroup
                            options={FILTER_OPTIONS}
                            activeFilter={filter}
                            onSelect={(p) => setFilter(p as ProficiencyFilter)}
                            themeColor="emerald"
                        />
                    }
                />
            </div>

            {/* Skills Grid */}
            {skills.length === 0 ? (
                <div className="text-center py-32 bg-neutral-50 dark:bg-neutral-900/50 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                    <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Zap className="w-10 h-10 text-neutral-200" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Your skills list is empty</h3>
                    <p className="text-sm text-neutral-400 mt-2 font-medium">Start adding skills to analyze gaps</p>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="mt-8 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        Add your first skill
                    </button>
                </div>
            ) : filteredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-12 px-1">
                    {filteredSkills.map((skill: CustomSkill) => (
                        <SkillCard
                            key={skill.id}
                            skill={skill}
                            onDelete={handleDeleteSkill}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-neutral-50 dark:bg-neutral-900/50 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                    <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Zap className="w-10 h-10 text-neutral-200 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">No skills match your search</h3>
                    <p className="text-sm text-neutral-400 mt-2 font-medium">Try adjusting your filters or search term</p>
                    <button
                        onClick={() => { setSearchTerm(''); setFilter('all'); }}
                        className="mt-8 text-emerald-600 font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Add Skill Modal Overlay */}
            <AddSkillModal
                isOpen={isAdding}
                onAdd={handleAddSkill}
                onClose={() => setIsAdding(false)}
            />
        </SharedPageLayout>
    );
};
