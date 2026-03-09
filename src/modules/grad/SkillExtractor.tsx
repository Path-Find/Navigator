import React, { useState } from 'react';
import { Award, Plus, Check, Loader2, Sparkles, Brain, Hammer } from 'lucide-react';
import { extractSkillsFromCourses } from '../../services/geminiService';
import { useToast } from '../../contexts/ToastContext';
import type { Transcript } from '../../types';

interface SkillExtractorProps {
    transcript: Transcript;
    onAddSkills: (skills: Array<{ name: string; category?: 'hard' | 'soft'; proficiency: 'learning' | 'comfortable' | 'expert'; evidence?: string }>) => Promise<void>;
}

interface ExtractedSkill {
    name: string;
    category: 'hard' | 'soft';
    proficiency: 'learning' | 'comfortable' | 'expert';
    evidence: string;
    selected: boolean;
}

export const SkillExtractor: React.FC<SkillExtractorProps> = ({ transcript, onAddSkills }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[] | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { showError, showSuccess } = useToast();

    const handleExtraction = async () => {
        setIsAnalyzing(true);
        try {
            const result = await extractSkillsFromCourses(transcript);
            setExtractedSkills(result.map((r) => ({ ...r, selected: true } as ExtractedSkill)));
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : 'Failed to extract skills');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleSkill = (index: number) => {
        if (!extractedSkills) return;
        const updated = [...extractedSkills];
        updated[index].selected = !updated[index].selected;
        setExtractedSkills(updated);
    };

    const handleSave = async () => {
        if (!extractedSkills) return;
        const toAdd = extractedSkills.filter(s => s.selected);
        if (toAdd.length === 0) return;

        setIsSaving(true);
        try {
            await onAddSkills(toAdd.map(({ name, proficiency, category, evidence }) => ({ name, proficiency, category, evidence })));
            showSuccess(`Added ${toAdd.length} new skills obtained from your courses`);
            setExtractedSkills(null); // Reset
        } catch {
            showError('Failed to save skills');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-neutral-700/50 p-8 shadow-2xl shadow-violet-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors duration-700" />

            <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-neutral-900 dark:text-white tracking-tight">Skill Extraction</h3>
                        <p className="text-sm text-neutral-500 font-medium">Academic path to professional mastery.</p>
                    </div>
                </div>
            </div>

            {!extractedSkills ? (
                <div className="text-center py-12 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 relative">
                    <p className="text-neutral-500 font-bold mb-6">
                        Ready to analyze <strong>{transcript.semesters.reduce((acc, s) => acc + s.courses.length, 0)} courses</strong> for professional skills.
                    </p>
                    <button
                        onClick={handleExtraction}
                        disabled={isAnalyzing}
                        className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-violet-500/30 flex items-center gap-2 mx-auto active:scale-95 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Mining Insights...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Extract Skills
                            </>
                        )}
                    </button>
                    {isAnalyzing && <p className="text-[10px] text-neutral-400 mt-4 font-black uppercase tracking-widest animate-pulse">Consulting the Knowledge Graph...</p>}
                </div>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
                    <div className="flex items-center justify-between bg-neutral-900 dark:bg-black p-4 rounded-2xl shadow-lg">
                        <div className="text-xs font-black text-white uppercase tracking-widest pl-2">Found {extractedSkills.length} Professional Assets</div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || extractedSkills.filter(s => s.selected).length === 0}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-xs font-black disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Store in Vault
                        </button>
                    </div>

                    {/* Hard Skills */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                            <div className="p-1 bg-violet-100 text-violet-600 rounded">
                                <Hammer className="w-3 h-3" />
                            </div>
                            Technical Mastery
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {extractedSkills.map((skill, idx) => (
                                skill.category === 'hard' && (
                                    <SkillCard key={idx} skill={skill} idx={idx} toggleSkill={toggleSkill} />
                                )
                            ))}
                        </div>
                    </div>

                    {/* Soft Skills */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                            <div className="p-1 bg-amber-100 text-amber-600 rounded">
                                <Brain className="w-3 h-3" />
                            </div>
                            Cognitive & Leadership
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {extractedSkills.map((skill, idx) => (
                                skill.category !== 'hard' && (
                                    <SkillCard key={idx} skill={skill} idx={idx} toggleSkill={toggleSkill} />
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SkillCard: React.FC<{ skill: ExtractedSkill; idx: number; toggleSkill: (i: number) => void }> = ({ skill, idx, toggleSkill }) => (
    <div
        onClick={() => toggleSkill(idx)}
        className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-start gap-4 group relative overflow-hidden ${skill.selected
            ? 'bg-violet-600 border-violet-500 text-white shadow-xl shadow-violet-500/20'
            : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 opacity-60 hover:opacity-100 hover:border-violet-200'
            }`}
    >
        {skill.selected && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
        )}

        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mt-0.5 transition-all ${skill.selected
            ? 'bg-white border-white text-violet-600'
            : 'border-neutral-200 dark:border-neutral-700'
            }`}>
            {skill.selected && <Check className="w-4 h-4 scale-110 font-black" />}
        </div>

        <div className="flex-1">
            <div className={`font-black text-sm tracking-tight ${skill.selected ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                {skill.name}
            </div>
            <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded-full uppercase tracking-widest font-black text-[8px] ${skill.selected
                    ? 'bg-white/20 text-white'
                    : skill.proficiency === 'expert' ? 'bg-emerald-100 text-emerald-700' :
                        skill.proficiency === 'comfortable' ? 'bg-blue-100 text-blue-700' :
                            'bg-neutral-100 text-neutral-600'
                    }`}>
                    {skill.proficiency}
                </span>
                <span className={`text-[10px] font-medium truncate max-w-[150px] ${skill.selected ? 'text-white/80' : 'text-neutral-400'}`}>
                    {skill.evidence}
                </span>
            </div>
        </div>
    </div>
);
