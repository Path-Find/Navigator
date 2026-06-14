import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import type { SectionType } from '../constants';

interface AddEntryModalProps {
    type: SectionType;
    sectionLabel: string;
    onAdd: (title: string, organization: string, dateRange: string) => void;
    onClose: () => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ type, sectionLabel, onAdd, onClose }) => {
    const [title, setTitle] = useState('');
    const [organization, setOrganization] = useState('');
    const [dateRange, setDateRange] = useState('');
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(title.trim(), organization.trim(), dateRange.trim());
        onClose();
    };

    const isSkill = type === 'skill';
    const isSummary = type === 'summary';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 w-full max-w-md overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <h3 className="font-black text-neutral-900 dark:text-white text-lg">
                        Add {sectionLabel === 'Professional Summary' ? 'Summary' : 'Entry'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {!isSkill && !isSummary && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Title</label>
                            <input
                                ref={titleRef}
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={type === 'work' ? 'e.g. Product Manager' : type === 'education' ? 'e.g. B.Sc. Urban Planning' : 'e.g. Transit Dashboard'}
                                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-sm font-medium focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                            />
                        </div>
                    )}

                    {!isSkill && !isSummary && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                                {type === 'education' ? 'School' : type === 'project' ? 'Context' : 'Organization'}
                            </label>
                            <input
                                type="text"
                                value={organization}
                                onChange={e => setOrganization(e.target.value)}
                                placeholder={type === 'education' ? 'e.g. York University' : type === 'project' ? 'e.g. Personal / Course / Work' : 'e.g. Canada Life'}
                                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-sm font-medium focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                            />
                        </div>
                    )}

                    {!isSkill && !isSummary && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Dates</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={dateRange}
                                    onChange={e => setDateRange(e.target.value)}
                                    placeholder="Jan 2024 – Present"
                                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-sm font-medium focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                            <p className="text-[11px] text-neutral-400 leading-snug">
                                Use Month + Year — e.g. <span className="font-mono">Jan 2024 – Mar 2025</span> or <span className="font-mono">Sep 2022 – Present</span>
                            </p>
                        </div>
                    )}

                    {(isSkill || isSummary) && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
                            An empty entry will be created for you to fill in.
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" onClick={onClose} variant="ghost" size="sm">Cancel</Button>
                        <Button
                            type="submit"
                            variant="accent"
                            size="sm"
                            icon={<Plus className="w-3.5 h-3.5" />}
                        >
                            Add Entry
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
