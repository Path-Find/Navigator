import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Upload, Loader2, Shield, Lock, Zap, Sparkles, PenTool, GraduationCap } from 'lucide-react';
import type { JourneyStage } from '../OnboardingPage';
import { JOURNEY_OPTIONS, TAILORED_CONTENT } from '../OnboardingPage';
import { TranscriptUpload } from '../../grad/TranscriptUpload';
import { LocalStorage } from '../../../utils/localStorage';
import { STORAGE_KEYS } from '../../../constants';


export const TranscriptOcrStep = ({ setTranscriptUploaded, setStep }: any) => {
    return (
        <motion.div
                                key="step-5.5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-xl"
                            >
                                <div className="card-premium p-10 shadow-2xl">
                                    <div className="text-center mb-10">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-3xl mb-6 shadow-xl ring-8 ring-violet-500/5">
                                            <GraduationCap className="w-10 h-10" />
                                        </div>
                                        <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-3">
                                            Sync Academic Plan
                                        </h1>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium">
                                            Track your GPA and credits automatically.
                                        </p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center mb-10">
                                        <TranscriptUpload
                                            onUploadComplete={(parsed) => {
                                                LocalStorage.set(STORAGE_KEYS.TRANSCRIPT_CACHE, JSON.stringify(parsed));
                                                setTranscriptUploaded(true);
                                                setStep(6);
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={() => setStep(6)}
                                        className="w-full btn-premium py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 group"
                                    >
                                        <span>Continue to Setup</span>
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </motion.div>
    );
};
