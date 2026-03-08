import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExperienceBlock } from './types';
import { Upload, Loader2, Plus, Trash2, Briefcase, GraduationCap, Code, Layers, Calendar, UserCircle, FileText, Zap, Sparkles, Heart, Download, ArrowRightLeft, ChevronUp, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRACKING_EVENTS, ROUTES } from '../../constants';
import { isRecognizedSkill } from '../../data/skillDatabase';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useResumeContext } from './context/ResumeContext';
import { EventService } from '../../services/eventService';
import { UnifiedUploadHero } from '../../components/common/UnifiedUploadHero';
import { GlobalDragOverlay } from '../../components/common/GlobalDragOverlay';
import { ResumePreview } from './components/ResumePreview';
import { Storage } from '../../services/storageService';




type SectionType = ExperienceBlock['type'];

const SECTIONS: { type: SectionType; label: string; icon: React.ReactNode }[] = [
    { type: 'summary', label: 'Professional Summary', icon: <UserCircle className="w-4 h-4" /> },
    { type: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
    { type: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { type: 'volunteer', label: 'Volunteer', icon: <Heart className="w-4 h-4" /> },
    { type: 'project', label: 'Projects', icon: <Code className="w-4 h-4" /> },
    { type: 'other', label: 'Other', icon: <Layers className="w-4 h-4" /> },
];

const getSortDate = (dateRange: string) => {
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

import { useSkillContext } from '../skills/context/SkillContext';

export const ResumeEditor: React.FC = () => {
    const {
        resumes,
        handleUpdateResumes: onSave,
        handleImportResume: onImport,
        isParsingResume: isParsing,
        importError,
        clearImportError
    } = useResumeContext();

    const {
        skills,
        updateSkills: onSkillsUpdated
    } = useSkillContext();

    const initialResume = resumes.length > 0 ? resumes[0] : { id: 'primary', name: 'Primary Experience', blocks: [] };

    const [blocks, setBlocks] = useState<ExperienceBlock[]>(initialResume.blocks || []);
    const [movingBlockId, setMovingBlockId] = useState<string | null>(null);
    const [hasStartedManually, setHasStartedManually] = useState(false);
    const [parsingMessageIndex, setParsingMessageIndex] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const PARSING_MESSAGES = [
        { title: "Summoning achievement hunters...", subtitle: "Scouring your past for those gold-medal moments.", icon: Briefcase },
        { title: "Powering up impact engine...", subtitle: "Translating your hard work into career-defining fuel.", icon: Zap },
        { title: "Deciphering skill matrix...", subtitle: "Translating your 'can-do' attitude into 'done-that' proof.", icon: Code },
        { title: "Celebrating your altruism...", subtitle: "Ensuring your community impact gets the spotlight it deserves.", icon: Heart },
        { title: "Adding finishing sparkles...", subtitle: "Polishing every bullet point until it shines like a supernova.", icon: Sparkles }
    ];

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isParsing) {
            interval = setInterval(() => {
                setParsingMessageIndex((prev) => (prev + 1) % PARSING_MESSAGES.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isParsing, PARSING_MESSAGES.length]);



    useEffect(() => {
        if (resumes.length > 0) {
            setBlocks(resumes[0].blocks);
        }
    }, [resumes]);

    // Clear error on unmount
    useEffect(() => {
        return () => {
            clearImportError();
        };
    }, [clearImportError]);



    useEffect(() => {
        const handler = setTimeout(() => {
            const updatedProfile = { ...initialResume, blocks };
            onSave([updatedProfile]);
            // Track usage of resume builder
            EventService.trackUsage(TRACKING_EVENTS.RESUMES);
        }, 800);
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks, initialResume.id]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onImport(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addBlock = (type: SectionType) => {
        if (type === 'summary' && blocks.some(b => b.type === 'summary')) return;
        const newBlock: ExperienceBlock = {
            id: crypto.randomUUID(),
            type: type,
            title: type === 'summary' ? 'Professional Summary' : '',
            organization: '',
            dateRange: '',
            bullets: [''],
            isVisible: true
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, field: keyof ExperienceBlock, value: string | string[] | boolean) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const updateBullet = (blockId: string, index: number, value: string) => {
        setBlocks(blocks.map(b => {
            if (b.id !== blockId) return b;
            const newBullets = [...b.bullets];
            newBullets[index] = value;
            return { ...b, bullets: newBullets };
        }));
    };

    const addBullet = (blockId: string, text: string = '') => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== blockId) return b;
            // If the last bullet is empty and we're inserting non-empty text, fill that slot
            const newBullets = [...b.bullets];
            if (text !== '' && newBullets.length > 0 && newBullets[newBullets.length - 1] === '') {
                newBullets[newBullets.length - 1] = text;
            } else {
                newBullets.push(text);
            }
            return { ...b, bullets: newBullets };
        }));
    };

    const removeBullet = (blockId: string, index: number) => {
        setBlocks(blocks.map(b => {
            if (b.id !== blockId) return b;
            return { ...b, bullets: b.bullets.filter((_: string, i: number) => i !== index) };
        }));
    };

    const moveBullet = (blockId: string, index: number, direction: 'up' | 'down') => {
        setBlocks(blocks.map(b => {
            if (b.id !== blockId) return b;
            const newBullets = [...b.bullets];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex >= 0 && targetIndex < newBullets.length) {
                [newBullets[index], newBullets[targetIndex]] = [newBullets[targetIndex], newBullets[index]];
            }
            return { ...b, bullets: newBullets };
        }));
    };

    const handleApplySuggestion = (suggestion: { id: string; type: string; suggestion: string }) => {
        if (suggestion.type === 'add' || suggestion.type === 'update') {
            // Find summary block or add one
            const summaryBlock = blocks.find(b => b.type === 'summary');
            if (summaryBlock) {
                addBullet(summaryBlock.id, suggestion.suggestion);
            } else {
                const newBlock: ExperienceBlock = {
                    id: crypto.randomUUID(),
                    type: 'summary',
                    title: 'Professional Summary',
                    organization: '',
                    dateRange: '',
                    bullets: [suggestion.suggestion],
                    isVisible: true
                };
                setBlocks([newBlock, ...blocks]);
            }
        }
        handleDismissSuggestion(suggestion.id);
    };

    const handleDismissSuggestion = (suggestionId: string) => {
        const updatedProfile = {
            ...initialResume,
            suggestedUpdates: (initialResume.suggestedUpdates || []).filter(s => s.id !== suggestionId)
        };
        onSave([updatedProfile]);
    };

    const handlePrint = () => {
        window.print();
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'summary': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'work': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
            case 'education': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'volunteer': return 'text-rose-600 bg-rose-50 border-rose-200';
            case 'project': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'other': return 'text-neutral-600 bg-neutral-50 border-neutral-200';
            default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
        }
    };

    const showEmptyState = blocks.length === 0 && !hasStartedManually && !isParsing;



    if (isParsing) {
        const CurrentIcon = PARSING_MESSAGES[parsingMessageIndex].icon;
        return (
            <SharedPageLayout>
                <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                    <div className="relative group">
                        {/* Dynamic Ambient Background */}
                        <div className="absolute inset-x-[-100px] inset-y-[-100px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse transition-all duration-1000" />

                        <div className="relative">
                            {/* Outer Ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200/50 animate-[spin_10s_linear_infinite]" />

                            <Card variant="glass" className="relative w-32 h-32 flex items-center justify-center rounded-[2.5rem] shadow-2xl border-indigo-100/50 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CurrentIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-in zoom-in-50 fade-in duration-500" key={parsingMessageIndex} />
                            </Card>

                            {/* Orbiting particles/indicator */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-bounce" />
                        </div>
                    </div>

                    <div className="text-center space-y-6 max-w-md mx-auto relative px-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight animate-in slide-in-from-bottom-4 duration-700" key={`title-${parsingMessageIndex}`}>
                                {PARSING_MESSAGES[parsingMessageIndex].title}
                            </h2>
                            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed animate-in slide-in-from-bottom-2 duration-700 delay-100" key={`subtitle-${parsingMessageIndex}`}>
                                {PARSING_MESSAGES[parsingMessageIndex].subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                                Intelligence Engine Active
                            </span>
                        </div>

                        {/* Progress dots */}
                        <div className="flex gap-2">
                            {PARSING_MESSAGES.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === parsingMessageIndex ? 'w-8 bg-indigo-500' : 'w-1.5 bg-neutral-200 dark:bg-neutral-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </SharedPageLayout>
        );
    }

    return (
        <SharedPageLayout className="theme-resume" spacing="compact" maxWidth="6xl">
            <style>
                {`
                    @media print {
                        body { 
                            background: white !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .print-only {
                            display: block !important;
                        }
                        /* Reset layout for print */
                        .print-container {
                            display: block !important;
                            max-width: 100% !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        #resume-preview {
                            display: block !important;
                            visibility: visible !important;
                            position: static !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .page-layout-root {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <div id="resume-preview" className="hidden print-only bg-white">
                <ResumePreview blocks={blocks} />
            </div>
            <GlobalDragOverlay onDrop={(files) => onImport(files[0])} />

            {/* Contextual Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-500/5 blur-[150px] rounded-full" />
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="application/pdf,image/png,image/jpeg"
                className="hidden"
            />

            <PageHeader
                title="Resume"
                subtitle="Manage your professional history and accomplishments"
                variant="simple"
                className="mb-8 no-print"
                actions={(
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isParsing}
                            variant="secondary"
                            size="sm"
                            className="font-black"
                            icon={isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        >
                            {isParsing ? 'Processing' : 'Import'}
                        </Button>
                        <Button
                            onClick={() => setIsPreviewOpen(true)}
                            variant="secondary"
                            size="sm"
                            className="font-black"
                            icon={<FileText className="w-3.5 h-3.5" />}
                        >
                            Preview
                        </Button>
                        <Button
                            onClick={handlePrint}
                            variant="secondary"
                            size="sm"
                            className="font-black"
                            icon={<Download className="w-3.5 h-3.5" />}
                        >
                            <span className="hidden sm:inline">Download</span>
                            <span className="sm:hidden">PDF</span>
                        </Button>
                    </div>
                )}
            />

            {showEmptyState ? (
                <div className="animate-in zoom-in-95 duration-700 relative no-print pt-4">
                    <div className="relative z-10 w-full">
                        {importError && (
                            <div className="mb-8 max-w-2xl mx-auto">
                                <Alert
                                    variant="error"
                                    title="Import Status"
                                    message={importError}
                                    onClose={clearImportError}
                                />
                            </div>
                        )}

                        {/* Unified Upload Hero */}
                        <UnifiedUploadHero
                            title="Upload"
                            description="Drop your resume to begin analysis"
                            onUpload={(files) => onImport(files[0])}
                            onManualEntry={() => setHasStartedManually(true)}
                            themeColor="indigo"
                            cards={{
                                foundation: {
                                    title: "Foundation",
                                    description: "We need your history to build a strong foundation. Upload your current resume to provide the essential data for your profile.",
                                    icon: FileText,
                                    benefits: ['Smart File Import', 'Automatic Cleanup', 'Privacy-First Engine']
                                },
                                intelligence: {
                                    title: "Intelligence",
                                    description: "Our AI processes your data to discover your unique strengths. We analyze your past experience to highlight your true impact and potential.",
                                    icon: Zap,
                                    benefits: ['Achievement Analysis', 'Skill Discovery', 'Career Alignment']
                                }
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start relative print-container">
                    {/* Left Column: Editor Sections */}
                    <div className="flex-1 space-y-12 animate-in slide-in-from-left-4 duration-700">
                        {importError && (
                            <div className="mb-10">
                                <Alert
                                    variant="error"
                                    title="Recent Issue"
                                    message={importError}
                                    onClose={clearImportError}
                                />
                            </div>
                        )}

                        {/* Sections */}
                        <div className="space-y-12">
                            {SECTIONS.map((section) => {
                                const sectionBlocks = blocks
                                    .filter(b => b.type === section.type);
                                // Defensive sort - only sort by date if they aren't currently "moving" things, to prevent jumping
                                if (!movingBlockId) {
                                    sectionBlocks.sort((a, b) => getSortDate(b.dateRange) - getSortDate(a.dateRange));
                                }

                                return (
                                    <div key={section.type} className="scroll-mt-20 print-card">
                                        <div className="flex items-center gap-2 mb-6 border-b border-neutral-100 dark:border-neutral-800/50 pb-3 no-print">
                                            <div className="flex flex-col flex-1">
                                                <h2 className="text-lg font-black text-neutral-900 dark:text-white items-center flex gap-2">
                                                    {section.label}
                                                    {sectionBlocks.length > 0 && section.type !== 'summary' && (
                                                        <span className="text-[10px] font-black text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">
                                                            {sectionBlocks.length}
                                                        </span>
                                                    )}
                                                </h2>
                                            </div>
                                            {(section.type !== 'summary' || sectionBlocks.length === 0) && (
                                                <button
                                                    onClick={() => addBlock(section.type)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-neutral-500 hover:text-indigo-600 rounded-xl transition-all group/add shadow-sm hover:shadow-md"
                                                >
                                                    <Plus className="w-3.5 h-3.5 group-hover/add:rotate-90 transition-transform duration-300" />
                                                    <span className="text-[10px] font-black tracking-tight">Add {section.label === 'Professional Summary' ? 'Summary' : 'Entry'}</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            {sectionBlocks.map((block) => (
                                                <Card
                                                    key={block.id}
                                                    variant="premium"
                                                    overflow="visible"
                                                    className={`group relative transition-all duration-300 border-neutral-200 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 shadow-sm hover:shadow-xl print-card ${!block.isVisible ? 'opacity-50 no-print' : ''}`}
                                                >
                                                    <div className="p-6 md:p-8">
                                                        <div className="space-y-6">
                                                            {/* Title Area */}
                                                            {block.type !== 'summary' && (
                                                                <div className="pr-12">
                                                                    <textarea
                                                                        value={block.title}
                                                                        onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                                                                        className="w-full text-2xl font-black text-neutral-900 dark:text-white bg-transparent border-none placeholder:text-neutral-200 focus:ring-0 p-0 resize-none overflow-hidden leading-tight whitespace-pre-wrap break-words"
                                                                        placeholder={block.type === 'skill' ? "Technical Skills" : "Role / Title"}
                                                                        rows={1}
                                                                        ref={(el) => {
                                                                            if (el) {
                                                                                el.style.height = 'auto';
                                                                                el.style.height = el.scrollHeight + 'px';
                                                                            }
                                                                        }}
                                                                        onInput={(e) => {
                                                                            const target = e.target as HTMLTextAreaElement;
                                                                            target.style.height = 'auto';
                                                                            target.style.height = target.scrollHeight + 'px';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Organization & Date Row */}
                                                            {block.type !== 'summary' && block.type !== 'skill' && (
                                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-12">
                                                                    <div className="flex items-center gap-2 flex-1">

                                                                        <textarea
                                                                            value={block.organization}
                                                                            onChange={(e) => updateBlock(block.id, 'organization', e.target.value)}
                                                                            className="w-full text-lg font-bold text-neutral-700 dark:text-neutral-300 bg-transparent border-none placeholder:text-neutral-200 focus:ring-0 p-0 resize-none overflow-hidden whitespace-pre-wrap break-words"
                                                                            placeholder="Organization / Company"
                                                                            rows={1}
                                                                            ref={(el) => {
                                                                                if (el) {
                                                                                    el.style.height = 'auto';
                                                                                    el.style.height = el.scrollHeight + 'px';
                                                                                }
                                                                            }}
                                                                            onInput={(e) => {
                                                                                const target = e.target as HTMLTextAreaElement;
                                                                                target.style.height = 'auto';
                                                                                target.style.height = target.scrollHeight + 'px';
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-neutral-400 bg-neutral-50/50 dark:bg-neutral-800/50 px-3 py-1 rounded-full border border-neutral-100 dark:border-neutral-800 transition-all focus-within:border-indigo-200/50 focus-within:bg-white dark:focus-within:bg-neutral-800">
                                                                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                                        <input
                                                                            value={block.dateRange}
                                                                            onChange={(e) => updateBlock(block.id, 'dateRange', e.target.value)}
                                                                            className="bg-transparent text-[11px] font-bold text-neutral-500 w-32 focus:outline-none text-right"
                                                                            placeholder="Jan 2023 - Present"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Bullets */}
                                                            <div className="space-y-4">
                                                                <div className="space-y-3">
                                                                    {block.bullets.map((bullet: string, idx: number) => (
                                                                        <div key={idx} className="group/line flex items-start gap-3 relative">
                                                                            {block.type !== 'summary' && (
                                                                                <div className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${bullet.trim() ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-neutral-200 dark:bg-neutral-800'} `} />
                                                                            )}
                                                                            <textarea
                                                                                value={bullet}
                                                                                onChange={(e) => updateBullet(block.id, idx, e.target.value)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        e.preventDefault();
                                                                                        addBullet(block.id);
                                                                                    }
                                                                                    if (e.key === 'Backspace' && bullet === '' && block.bullets.length > 1) {
                                                                                        e.preventDefault();
                                                                                        removeBullet(block.id, idx);
                                                                                    }
                                                                                }}
                                                                                className={`flex-1 min-w-0 text-neutral-700 dark:text-neutral-300 leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none overflow-hidden focus:outline-none transition-all placeholder:text-neutral-300 pr-12 text-sm whitespace-pre-wrap break-words`}
                                                                                placeholder={block.type === 'summary' ? "Write a brief, high-impact professional overview..." : "Detail your accomplishments here..."}
                                                                                rows={1}
                                                                                ref={(el) => {
                                                                                    if (el) {
                                                                                        el.style.height = 'auto';
                                                                                        el.style.height = el.scrollHeight + 'px';
                                                                                    }
                                                                                }}
                                                                                onInput={(e) => {
                                                                                    const target = e.target as HTMLTextAreaElement;
                                                                                    target.style.height = 'auto';
                                                                                    target.style.height = target.scrollHeight + 'px';
                                                                                }}
                                                                            />
                                                                            <div className="opacity-0 group-hover/line:opacity-100 flex items-center gap-0.5 no-print">
                                                                                {block.bullets.length > 1 && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => moveBullet(block.id, idx, 'up')}
                                                                                            disabled={idx === 0}
                                                                                            className="p-1 text-neutral-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-all disabled:opacity-0"
                                                                                            title="Move Up"
                                                                                        >
                                                                                            <ChevronUp className="w-3 h-3" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => moveBullet(block.id, idx, 'down')}
                                                                                            disabled={idx === block.bullets.length - 1}
                                                                                            className="p-1 text-neutral-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-all disabled:opacity-0"
                                                                                            title="Move Down"
                                                                                        >
                                                                                            <ChevronDown className="w-3 h-3" />
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                                {block.type !== 'summary' && (
                                                                                    <button
                                                                                        onClick={() => removeBullet(block.id, idx)}
                                                                                        className="p-1 text-neutral-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-all"
                                                                                        title="Remove Line"
                                                                                        tabIndex={-1}
                                                                                    >
                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {block.type !== 'summary' && (
                                                                    <div className="mt-6 flex items-center gap-3 no-print h-9">
                                                                        <button
                                                                            onClick={() => addBullet(block.id)}
                                                                            className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 text-neutral-500 hover:text-indigo-600 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 group/add flex items-center gap-1.5"
                                                                        >
                                                                            <Plus className="w-3.5 h-3.5 group-hover/add:rotate-90 transition-transform duration-300" />
                                                                            <span className="text-[10px] font-black tracking-tight">Add Line</span>
                                                                        </button>

                                                                        <div className="flex items-center gap-1 group/move relative h-full">
                                                                            <button
                                                                                onClick={() => setMovingBlockId(movingBlockId === block.id ? null : block.id)}
                                                                                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 border shadow-lg relative z-20 active:scale-95 ${movingBlockId === block.id
                                                                                    ? 'bg-neutral-900 border-neutral-900 dark:bg-white dark:border-white text-white dark:text-neutral-900'
                                                                                    : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:text-indigo-600 hover:border-indigo-100 dark:hover:border-indigo-900/50'}`}
                                                                                title="Move to Section"
                                                                            >
                                                                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                                                                <span className="text-[10px] font-black tracking-tight">Move</span>
                                                                            </button>

                                                                            <AnimatePresence>
                                                                                {movingBlockId === block.id && (
                                                                                    <motion.div
                                                                                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                                                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                                                                        className="flex items-center gap-1 ml-2 p-1 px-1 bg-white/80 dark:bg-neutral-900/80 rounded-full border border-white/30 dark:border-neutral-800/50 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10 h-full"
                                                                                    >
                                                                                        {SECTIONS.filter(s => s.type !== 'summary').map(s => {
                                                                                            const isSelected = block.type === s.type;
                                                                                            const typeColorClasses = getTypeColor(s.type);
                                                                                            // Extract just the text color for the button
                                                                                            const textColor = typeColorClasses.split(' ').find(c => c.startsWith('text-')) || 'text-neutral-400';

                                                                                            return (
                                                                                                <button
                                                                                                    key={s.type}
                                                                                                    onClick={() => {
                                                                                                        updateBlock(block.id, 'type', s.type);
                                                                                                        setMovingBlockId(null);
                                                                                                    }}
                                                                                                    className={`relative px-3 py-1 rounded-full text-[10px] font-black tracking-tight transition-all flex items-center gap-2 justify-center active:scale-95 whitespace-nowrap z-10 ${isSelected
                                                                                                        ? textColor
                                                                                                        : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                                                                                        }`}
                                                                                                >
                                                                                                    {isSelected && (
                                                                                                        <motion.div
                                                                                                            layoutId={`active-pill-${block.id}`}
                                                                                                            className="absolute inset-0 bg-white shadow-sm border border-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-full -z-10"
                                                                                                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                                                                                        />
                                                                                                    )}
                                                                                                    {s.icon && <span className={`w-3.5 h-3.5 flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-70'}`}>{s.icon}</span>}
                                                                                                    {s.label}
                                                                                                </button>
                                                                                            );
                                                                                        })}
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>

                                                                        <button
                                                                            onClick={() => removeBlock(block.id)}
                                                                            className="p-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-rose-200 dark:hover:border-rose-900/50 text-neutral-300 hover:text-rose-500 rounded-xl transition-all shadow-sm hover:shadow-md ml-auto active:scale-95"
                                                                            title="Delete Block"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <aside className="hidden lg:block sticky top-32 w-80 shrink-0 space-y-6 animate-in slide-in-from-right-8 duration-1000 no-print pt-14">
                        {/* Discovery Bank / Suggestions */}
                        {initialResume.suggestedUpdates && initialResume.suggestedUpdates.length > 0 && (
                            <Card variant="premium" className="p-5 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/10 dark:bg-indigo-950/5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-[10px] font-black text-indigo-500 tracking-widest leading-none mb-1">Discovery Bank</h3>
                                        <p className="text-[9px] text-neutral-400 font-bold tracking-tight">AI Captured Suggestions</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {initialResume.suggestedUpdates.map((suggestion) => (
                                        <div key={suggestion.id} className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-indigo-100 dark:border-indigo-500/10 space-y-2 group/sug">
                                            <div className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                                {suggestion.suggestion}
                                            </div>
                                            {suggestion.impact && (
                                                <p className="text-[9px] text-neutral-500 leading-relaxed italic">{suggestion.impact}</p>
                                            )}
                                            <div className="flex items-center gap-2 pt-1 border-t border-neutral-50 dark:border-neutral-800">
                                                <button
                                                    onClick={() => handleApplySuggestion(suggestion)}
                                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black tracking-tight transition-all"
                                                >
                                                    Apply
                                                </button>
                                                <button
                                                    onClick={() => handleDismissSuggestion(suggestion.id)}
                                                    className="px-2 py-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-[9px] font-black tracking-tight transition-all"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {(() => {
                            const allText = blocks.flatMap(b => [...b.bullets, b.title, b.organization]).join(' ').toLowerCase();
                            const verifiedSkills = skills.filter(s => allText.includes(s.name.toLowerCase()));
                            const explicitSkills = blocks
                                .filter(b => b.type === 'skill')
                                .flatMap(b => b.bullets)
                                .filter(bul => bul.trim().length > 0)
                                .map(bul => bul.trim());

                            const ACTION_VERBS = new Set(['Doing', 'Working', 'Led', 'Managed', 'Developed', 'Created', 'Implemented', 'Designed', 'Built', 'Oversaw', 'Supervised', 'Coordinated', 'Monitored', 'Evaluated', 'Analyzed', 'Researched', 'Presented', 'Reported', 'Negotiated', 'Facilitated', 'Collaborated', 'Supported', 'Assisted', 'Provided', 'Handled', 'Operated', 'Maintained', 'Repaired', 'Installed', 'Performed', 'Conducted', 'Participated', 'Attended', 'Represented', 'Served', 'Acted', 'Assigned', 'Awarded', 'Earned', 'Gained', 'Obtained', 'Received', 'Recognized', 'Selected', 'Chosen', 'Nominated', 'Appointed', 'Promoted', 'Increased', 'Improved', 'Enhanced', 'Expanded', 'Reduced', 'Saved', 'Generated', 'Produced', 'Delivered', 'Completed', 'Achieved', 'Exceeded', 'Met', 'Succeeded']);
                            const GENERIC_TITLES = new Set(['Program', 'Representative', 'Student', 'Students', 'Member', 'Officer', 'Coordinator', 'Director', 'Manager', 'Lead', 'Analyst', 'Consultant', 'Specialist', 'Assistant', 'Advisor', 'Chair', 'President', 'Vice', 'Head', 'Chief', 'Intern', 'Volunteer', 'Employee', 'Staff', 'Associate', 'Participant', 'Group', 'Team', 'Unit', 'Corps', 'Candidate', 'Scholar', 'Fellow']);
                            const CONTEXT_WORDS = new Set(['University', 'College', 'School', 'Department', 'Institute', 'Academy', 'Foundation', 'Association', 'Organization', 'Company', 'Corporation', 'Agency', 'Board', 'Committee', 'Council', 'Federation', 'Society', 'Union', 'Club', 'League', 'Party', 'Major', 'Minor', 'Degree', 'Course', 'Class', 'Project', 'Experience', 'History', 'Summary', 'Profile', 'Skill', 'Skills', 'Change', 'Focused', 'Proven', 'Relevant', 'Strong', 'Excellent', 'Highly', 'Professional', 'History', 'Based', 'Context', 'Results', 'Action', 'Impact', 'Goal', 'Target', 'Status', 'Level', 'Standard', 'Quality', 'Process', 'Spring', 'Fall', 'Summer', 'Winter', 'Semester', 'Quarter', 'Session', 'Year', 'Annual', 'Monthly', 'Weekly', 'Daily']);

                            const discovered = blocks
                                .filter(b => b.type !== 'skill')
                                .flatMap(b => b.bullets)
                                .join(' ')
                                .match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2}/g)
                                ?.map(s => s.trim())
                                .filter(s => {
                                    const words = s.split(/\s+/);
                                    if (words.length === 0) return false;

                                    // Filter out if it starts with an action verb (likely a sentence start)
                                    if (ACTION_VERBS.has(words[0])) return false;

                                    // Filter out if it's all generic/context/title words
                                    const allGeneric = words.every(w =>
                                        GENERIC_TITLES.has(w) ||
                                        CONTEXT_WORDS.has(w) ||
                                        ACTION_VERBS.has(w)
                                    );
                                    if (allGeneric) return false;

                                    // Filter out common person/academic suffixes
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

                            return (
                                <>
                                    {/* Verified Strengths Card */}
                                    <Card variant="premium" className="p-5 border-neutral-100 dark:border-neutral-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-[10px] font-black text-emerald-500 tracking-tight flex items-center gap-1.5">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                Verified Strengths
                                            </div>
                                            <button
                                                onClick={() => navigate(ROUTES.SKILLS)}
                                                className="text-[9px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                            >
                                                Manage
                                                <ArrowRightLeft className="w-2.5 h-2.5" />
                                            </button>
                                        </div>

                                        {verifiedSkills.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {verifiedSkills.map(s => {
                                                    const isExpert = s.proficiency === 'expert';
                                                    const isComfortable = s.proficiency === 'comfortable';
                                                    const borderColor = isExpert ? 'border-emerald-100 dark:border-emerald-500/20' :
                                                        isComfortable ? 'border-orange-100 dark:border-orange-500/20' :
                                                            'border-neutral-100 dark:border-neutral-800';
                                                    const dotColor = isExpert ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                        isComfortable ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
                                                            'bg-neutral-300';

                                                    return (
                                                        <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-neutral-900 border ${borderColor} rounded-xl shadow-sm transition-all duration-300`}>
                                                            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                                                                {s.name}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                {s.evidence ? (
                                                                    <div title={`Verified ${s.proficiency}`} className="flex items-center">
                                                                        <Check className={`w-2.5 h-2.5 stroke-[3] ${isExpert ? 'text-emerald-500' :
                                                                            isComfortable ? 'text-orange-500' :
                                                                                'text-neutral-500'
                                                                            }`} />
                                                                    </div>
                                                                ) : (
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} title={s.proficiency} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-neutral-400 italic">No verified strengths detected yet.</p>
                                        )}
                                    </Card>

                                    {/* Discovered Keywords Card */}
                                    {uniqueDiscovered.length > 0 && (
                                        <Card variant="premium" className="p-5 border-neutral-100 dark:border-neutral-800">
                                            <div className="text-[10px] font-black text-indigo-500 tracking-tight mb-4 flex items-center gap-1.5">
                                                <div className="w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                                Discovered Keywords
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {uniqueDiscovered.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={async () => {
                                                            if (onSkillsUpdated) {
                                                                const newSkill = await Storage.saveSkill({
                                                                    name: s,
                                                                    proficiency: 'learning'
                                                                });
                                                                onSkillsUpdated([...skills, newSkill]);
                                                            }
                                                        }}
                                                        className="group flex items-center gap-2 px-3 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500/20 transition-all shadow-sm"
                                                    >
                                                        <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                                            {s}
                                                        </span>
                                                        <Plus className="w-3 h-3 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        </Card>
                                    )}

                                    {verifiedSkills.length === 0 && uniqueDiscovered.length === 0 && (
                                        <Card variant="premium" className="p-5 border-neutral-100 dark:border-neutral-800">
                                            <p className="text-[10px] text-neutral-400 italic">Add more details to reveal your skill matrix.</p>
                                        </Card>
                                    )}
                                </>
                            );
                        })()}
                    </aside>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xl" onClick={() => setIsPreviewOpen(false)} />
                    <div className="relative bg-neutral-100 dark:bg-neutral-950 w-full max-w-5xl h-full rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
                        <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-xl text-neutral-900 dark:text-white">Preview</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={handlePrint} variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                                    Download PDF
                                </Button>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-none">
                            <div className="mx-auto shadow-2xl origin-top scale-[0.85] md:scale-100">
                                <ResumePreview blocks={blocks} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SharedPageLayout>
    );
};

export default ResumeEditor;
