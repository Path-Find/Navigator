import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Upload, Loader2, Shield, Lock, Zap, Sparkles, PenTool, GraduationCap } from 'lucide-react';
import type { JourneyStage } from '../OnboardingPage';
import { JOURNEY_OPTIONS, TAILORED_CONTENT } from '../OnboardingPage';
import { TranscriptUpload } from '../../grad/TranscriptUpload';
import { LocalStorage } from '../../../utils/localStorage';
import { STORAGE_KEYS } from '../../../constants';


export const PrivacyStep = ({ privacyAccepted, setPrivacyAccepted, setStep, handleNext }: any) => {
    return (
        <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-xl"
                            >
                                <div className="card-premium p-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

                                    <div className="relative flex flex-col items-center text-center mb-10">
                                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 ring-8 ring-emerald-500/5">
                                            <Shield className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <h1 className="text-4xl font-black mb-3 text-neutral-900 dark:text-white">Privacy First</h1>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium">Before we start, our promise to you.</p>
                                    </div>

                                    <div className="space-y-3 mb-10">
                                        {[
                                            { icon: <Lock className="w-5 h-5 text-emerald-500" />, title: 'Local Vault', desc: 'Your resumes never leave your device storage unless you say so.', bg: 'bg-emerald-500/5' },
                                            { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'AI Processing', desc: 'We send anonymous text to Google Gemini for analysis. It is not used for training.', bg: 'bg-amber-500/5' },
                                            { icon: <span className="font-black text-rose-500">X</span>, title: 'Zero Tracking', desc: 'No analytics. No cookies. No creepiness.', bg: 'bg-rose-500/5' }
                                        ].map((item, i) => (
                                            <div key={i} className={`flex items-start gap-5 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 ${item.bg}`}>
                                                <div className="mt-1">{item.icon}</div>
                                                <div>
                                                    <h3 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-sm">{item.title}</h3>
                                                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-10 flex flex-col items-center">
                                        <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={privacyAccepted}
                                                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-neutral-200 dark:border-neutral-700 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                                                />
                                                <Check className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity stroke-[3px]" />
                                            </div>
                                            <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 select-none">
                                                I agree to the{' '}
                                                <a href="/terms" target="_blank" className="text-indigo-600 hover:text-indigo-700 font-black underline underline-offset-4">Terms</a>
                                                {' '}and{' '}
                                                <a href="/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-700 font-black underline underline-offset-4">Privacy Policy</a>
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(1.5)}
                                            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:-translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!privacyAccepted}
                                            className="flex-1 btn-premium py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 group"
                                        >
                                            <Shield className="w-5 h-5" />
                                            <span>Accept & Continue</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
    );
};
