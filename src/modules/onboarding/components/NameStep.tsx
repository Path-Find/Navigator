import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Upload, Loader2, Shield, Lock, Zap, Sparkles, PenTool, GraduationCap } from 'lucide-react';
import type { JourneyStage } from '../OnboardingPage';
import { JOURNEY_OPTIONS, TAILORED_CONTENT } from '../OnboardingPage';
import { TranscriptUpload } from '../../grad/TranscriptUpload';
import { LocalStorage } from '../../../utils/localStorage';
import { STORAGE_KEYS } from '../../../constants';


export const NameStep = ({ firstName, setFirstName, lastName, setLastName, setStep, handleNext }: any) => {
    return (
        <motion.div
                                key="step-1.5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-xl"
                            >
                                <div className="card-premium p-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                                    <div className="relative text-center mb-10">
                                        <h1 className="text-4xl font-black mb-3 text-neutral-900 dark:text-white">Nice to meet you</h1>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium">What should we call you?</p>
                                    </div>

                                    <div className="space-y-6 mb-10">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400 pl-1">First Name</label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-bold"
                                                placeholder="Jane"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400 pl-1">Last Name</label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-bold"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(3)}
                                            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:-translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!firstName}
                                            className="flex-1 btn-premium py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 group"
                                        >
                                            <span>Continue</span>
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
    );
};
