import React from 'react';
import { Plus, Trash2, Calendar, ArrowRightLeft, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExperienceBlock } from '../types';
import { EDUCATION_CREDENTIAL_TYPES, type SectionType } from '../constants';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ResumeDateRangeFields } from './ResumeDateRangeFields';

interface ResumeSectionEditorProps {
    block: ExperienceBlock;
    movingBlockId: string | null;
    sections: { type: SectionType; label: string; icon: React.ReactNode }[];
    getTypeColor: (type: string) => string;
    onUpdateBlock: (id: string, field: keyof ExperienceBlock, value: string | string[] | boolean) => void;
    onUpdateBullet: (blockId: string, index: number, value: string) => void;
    onAddBullet: (blockId: string) => void;
    onRemoveBullet: (blockId: string, index: number) => void;
    onMoveBullet: (blockId: string, index: number, direction: 'up' | 'down') => void;
    onRemoveBlock: (id: string) => void;
    onSetMovingBlockId: (id: string | null) => void;
    current: boolean;
    onToggleCurrent: (blockId: string) => void;
    onStartInterview: (block: ExperienceBlock) => void;
}

const CURRENT_FLAG_TYPES: ExperienceBlock['type'][] = ['work', 'volunteer', 'education', 'project'];
const INTERVIEWABLE_TYPES: ExperienceBlock['type'][] = ['work', 'volunteer', 'project'];

export const ResumeSectionEditor: React.FC<ResumeSectionEditorProps> = ({
    block,
    movingBlockId,
    sections,
    getTypeColor,
    onUpdateBlock,
    onUpdateBullet,
    onAddBullet,
    onRemoveBullet,
    onMoveBullet,
    onRemoveBlock,
    onSetMovingBlockId,
    current,
    onToggleCurrent,
    onStartInterview,
}) => {
    return (
        <>
            <Card
                variant="premium"
                overflow="visible"
                className={`group relative transition-all duration-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-900/50 shadow-sm hover:shadow-xl print-card ${!block.isVisible ? 'opacity-50 no-print' : ''}`}
            >
                <div className="p-6 md:p-8">
                    {CURRENT_FLAG_TYPES.includes(block.type) && (
                        <div className="absolute right-6 top-6 flex items-center gap-2 no-print">
                            <button
                                type="button"
                                onClick={() => onToggleCurrent(block.id)}
                                aria-pressed={current}
                                className={`whitespace-nowrap rounded-xl border px-2.5 py-1.5 text-[10px] font-black transition-colors ${current ? 'text-neutral-600 bg-neutral-50 border-neutral-200 dark:text-neutral-300 dark:bg-neutral-500/10 dark:border-neutral-500/30' : 'text-neutral-400 border-neutral-200 hover:text-neutral-600 hover:border-neutral-200 dark:border-neutral-700'}`}
                            >
                                {current ? 'Current' : 'Mark as current'}
                            </button>
                        </div>
                    )}
                    <div className="space-y-6">
                        {/* Title Area */}
                        {block.type !== 'summary' && (
                            <div className="pr-52">
                                <textarea
                                    value={block.title}
                                    onChange={(e) => onUpdateBlock(block.id, 'title', e.target.value)}
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
                                {block.type === 'education' && (
                                    <select
                                        value={block.credentialType || ''}
                                        onChange={event => onUpdateBlock(block.id, 'credentialType', event.target.value)}
                                        aria-label={`Credential type for ${block.title || 'education entry'}`}
                                        className="mt-3 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-bold text-neutral-500 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                                    >
                                        <option value="">Select credential type</option>
                                        {EDUCATION_CREDENTIAL_TYPES.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Organization & Date Row */}
                        {block.type !== 'summary' && block.type !== 'skill' && (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-12">
                                <div className="flex items-center gap-2 flex-1">
                                    <textarea
                                        value={block.organization}
                                        onChange={(e) => onUpdateBlock(block.id, 'organization', e.target.value)}
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

                                <div className="flex items-center gap-2 text-neutral-400 bg-neutral-50/50 dark:bg-neutral-800/50 px-3 py-1 rounded-full border border-neutral-100 dark:border-neutral-800 transition-all focus-within:border-neutral-200/50 focus-within:bg-white dark:focus-within:bg-neutral-800">
                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                    <ResumeDateRangeFields
                                        value={block.dateRange}
                                        onChange={value => onUpdateBlock(block.id, 'dateRange', value)}
                                        hideCurrentToggle
                                        isCurrentOverride={current}
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
                                            <div className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${bullet.trim() ? 'bg-neutral-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
                                        )}
                                        <textarea
                                            value={bullet}
                                            onChange={(e) => onUpdateBullet(block.id, idx, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    onAddBullet(block.id);
                                                }
                                                if (e.key === 'Backspace' && bullet === '' && block.bullets.length > 1) {
                                                    e.preventDefault();
                                                    onRemoveBullet(block.id, idx);
                                                }
                                            }}
                                            className="flex-1 min-w-0 text-neutral-700 dark:text-neutral-300 leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none overflow-hidden focus:outline-none transition-all placeholder:text-neutral-300 pr-12 text-sm whitespace-pre-wrap break-words"
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
                                            {block.type !== 'summary' && block.bullets.length > 1 && (
                                                <>
                                                    <Button
                                                        onClick={() => onMoveBullet(block.id, idx, 'up')}
                                                        disabled={idx === 0}
                                                        variant="ghost"
                                                        size="xs"
                                                        className="w-6 h-6 p-0 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 disabled:opacity-0"
                                                        title="Move Up"
                                                        icon={<ChevronUp className="w-3 h-3" />}
                                                    />
                                                    <Button
                                                        onClick={() => onMoveBullet(block.id, idx, 'down')}
                                                        disabled={idx === block.bullets.length - 1}
                                                        variant="ghost"
                                                        size="xs"
                                                        className="w-6 h-6 p-0 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 disabled:opacity-0"
                                                        title="Move Down"
                                                        icon={<ChevronDown className="w-3 h-3" />}
                                                    />
                                                </>
                                            )}
                                            {block.type !== 'summary' && (
                                                <Button
                                                    onClick={() => onRemoveBullet(block.id, idx)}
                                                    variant="ghost"
                                                    size="xs"
                                                    className="w-6 h-6 p-0 text-neutral-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    title="Remove Line"
                                                    tabIndex={-1}
                                                    icon={<Trash2 className="w-3.5 h-3.5" />}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {block.type !== 'summary' && (
                                <div className="mt-6 flex items-center gap-3 no-print min-h-9">
                                    <Button
                                        onClick={() => onAddBullet(block.id)}
                                        variant="subtle"
                                        size="xs"
                                        className="group/add shrink-0 whitespace-nowrap"
                                        icon={<Plus className="w-3.5 h-3.5 group-hover/add:rotate-90 transition-transform duration-300" />}
                                    >
                                        Add Line
                                    </Button>

                                    {INTERVIEWABLE_TYPES.includes(block.type) && (
                                        <Button
                                            onClick={() => onStartInterview(block)}
                                            variant="subtle"
                                            size="xs"
                                            className="shrink-0 whitespace-nowrap"
                                            icon={<MessageCircle className="w-3.5 h-3.5" />}
                                            title="Interview me about this entry"
                                        >
                                            Interview
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-1 group/move relative h-full">
                                        <Button
                                            onClick={() => onSetMovingBlockId(movingBlockId === block.id ? null : block.id)}
                                            variant={movingBlockId === block.id ? "accent" : "subtle"}
                                            size="xs"
                                            className="relative z-20 shrink-0 whitespace-nowrap"
                                            icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                                        >
                                            Move
                                        </Button>

                                        <AnimatePresence>
                                            {movingBlockId === block.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                                    className="flex items-center gap-1 ml-2 p-1 px-1 bg-white/80 dark:bg-neutral-900/80 rounded-full border border-white/30 dark:border-neutral-800/50 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10 h-7"
                                                >
                                                    {sections.filter(s => s.type !== 'summary').map(s => {
                                                        const isSelected = block.type === s.type;
                                                        const typeColorClasses = getTypeColor(s.type);
                                                        const textColor = typeColorClasses.split(' ').find(c => c.startsWith('text-')) || 'text-neutral-400';

                                                        return (
                                                            <button
                                                                key={s.type}
                                                                onClick={() => {
                                                                    onUpdateBlock(block.id, 'type', s.type);
                                                                    onSetMovingBlockId(null);
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

                                    <Button
                                        onClick={() => onRemoveBlock(block.id)}
                                        variant="subtle"
                                        size="xs"
                                        className="ml-auto shrink-0 text-rose-500 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-800"
                                        icon={<Trash2 className="w-4 h-4" />}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

        </>
    );
};
