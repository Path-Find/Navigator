import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, ArrowRight, ArrowLeft, Check, Loader2, GraduationCap, Search, Building2, Shield, Lock, Zap, PenTool } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeContext } from '../resume/context/ResumeContext';
import { TranscriptUpload } from '../grad/TranscriptUpload';
import { PlansOnboardingStep } from './PlansOnboardingStep';
import type { ExperienceBlock } from '../resume/types';
import { ROUTES, STORAGE_KEYS } from '../../constants';
import { LocalStorage } from '../../utils/localStorage';

export type JourneyStage = 'student' | 'job-hunter' | 'employed' | 'career-changer' | 'exploring';

export const JOURNEY_OPTIONS: { id: JourneyStage; icon: React.ReactNode; title: string; description: string; color: string }[] = [
    { id: 'job-hunter', icon: <Search className="w-6 h-6" />, title: "I'm searching for a job", description: "Actively applying and interviewing for new roles", color: 'indigo' },
    { id: 'employed', icon: <Building2 className="w-6 h-6" />, title: "I'm growing in my role", description: "Looking to level up, build new skills, or get promoted", color: 'emerald' },
    { id: 'career-changer', icon: <ArrowRight className="w-6 h-6 -rotate-45" />, title: "I'm changing careers", description: "Pivoting to a new industry or different field", color: 'amber' },
    { id: 'student', icon: <GraduationCap className="w-6 h-6" />, title: "I'm in school", description: "Managing studies, internships, or planning my next degree", color: 'violet' },
    { id: 'exploring', icon: <Search className="w-6 h-6" />, title: "I'm just exploring", description: "Keeping an eye on the market and my career options", color: 'indigo' },
];

export const TAILORED_CONTENT: Record<JourneyStage, { headline: string; tips: string[] }> = {
    student: {
        headline: "We'll help you build a standout profile",
        tips: ["Turn coursework into skills", "Highlight projects & internships", "Find entry-level opportunities"]
    },
    'job-hunter': {
        headline: "We'll maximize your application success",
        tips: ["Analyze job fit in seconds", "Tailor resumes automatically", "Generate cover letters instantly"]
    },
    employed: {
        headline: "We'll help you level up your career",
        tips: ["Identify skill gaps", "Build a 12-month roadmap", "Prepare for your next role"]
    },
    'career-changer': {
        headline: "We'll map your transferable skills",
        tips: ["Translate experience to new fields", "Find bridge roles", "Build relevant credentials"]
    },
    exploring: {
        headline: "We'll keep you market-ready",
        tips: ["Track industry trends", "Build your personal brand", "Benchmark your skills"]
    }
};

const detectStudentStatus = (blocks: ExperienceBlock[]) => {
    return blocks.some(block =>
        block.type === 'education' &&
        (block.dateRange.toLowerCase().includes('present') ||
            block.dateRange.toLowerCase().includes('expected') ||
            block.dateRange.toLowerCase().includes('current'))
    );
};

import { JourneyStep } from './components/JourneyStep';
import { NameStep } from './components/NameStep';
import { PrivacyStep } from './components/PrivacyStep';
import { ResumeUploadStep } from './components/ResumeUploadStep';
import { ProfileProcessingStep } from './components/ProfileProcessingStep';
import { TranscriptOcrStep } from './components/TranscriptOcrStep';
import { FinalLaunchStep } from './components/FinalLaunchStep';
export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resumes, handleImportResume, isParsingResume } = useResumeContext();
    const [lastKnownResumeCount, setLastKnownResumeCount] = useState(resumes.length);
    const [isStudent, setIsStudent] = useState(false);

    const [parsingSnapshot, setParsingSnapshot] = useState<{ skills: number, roles: number, education: boolean } | null>(null);

    // Flow: Journey (Step 3) -> Privacy (Step 1) -> Name (Step 1.5) -> Upload (Step 4) ...
    // Verify: Journey depends on user selection.

    // Initial State: Start at Step 3 (Journey)
    const [step, setStep] = useState<1 | 1.5 | 3 | 4 | 5 | 5.5 | 5.8 | 6>(3); // 5.8 is Plans
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [selectedJourneys, setSelectedJourneys] = useState<JourneyStage[]>([]);
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [transcriptUploaded, setTranscriptUploaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // New State for Names
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Auto-advance from Feature Highlight (Step 5) when parsing completes
    useEffect(() => {
        if (step === 5 && !isParsingResume && resumeUploaded) {
            const hasNewResume = resumes.length > lastKnownResumeCount;
            const lastResume = hasNewResume ? resumes[resumes.length - 1] : null;

            if (lastResume) {
                const detected = detectStudentStatus(lastResume.blocks);
                const snapshot = {
                    skills: lastResume.blocks.filter(b => b.type === 'skill').length ||
                        lastResume.blocks.filter(b => b.type === 'work').reduce((acc, b) => acc + (b.bullets?.length || 0), 0),
                    roles: lastResume.blocks.filter(b => b.type === 'work').length,
                    education: detected
                };
                setParsingSnapshot(snapshot);
                setIsStudent(detected || selectedJourneys.includes('student'));
            }

            setLastKnownResumeCount(resumes.length);

            const delay = 2500; // Give a bit more time for the delight snapshot
            const timer = setTimeout(() => {
                const latestResume = resumes[resumes.length - 1];
                const detected = (hasNewResume && latestResume) ? detectStudentStatus(latestResume.blocks) : false;
                if (detected || selectedJourneys.includes('student')) {
                    setStep(5.5);
                } else {
                    setStep(6);
                }
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [step, isParsingResume, resumeUploaded, resumes, lastKnownResumeCount, selectedJourneys]);

    // Save state to localStorage to persist across redirects and tabs (e.g. Stripe)
    useEffect(() => {
        if (firstName || lastName || selectedJourneys.length > 0) {
            const state = {
                firstName,
                lastName,
                selectedJourneys,
                step,
                resumeUploaded,
                transcriptUploaded
            };
            LocalStorage.set(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(state));
        }
    }, [firstName, lastName, selectedJourneys, step, resumeUploaded, transcriptUploaded]);

    // Restore state and handle Stripe success
    useEffect(() => {
        const savedState = LocalStorage.get(STORAGE_KEYS.ONBOARDING_STATE);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.firstName) setFirstName(parsed.firstName);
                if (parsed.lastName) setLastName(parsed.lastName);
                if (parsed.selectedJourneys) setSelectedJourneys(parsed.selectedJourneys);
                if (parsed.resumeUploaded) setResumeUploaded(parsed.resumeUploaded);
                if (parsed.transcriptUploaded) setTranscriptUploaded(parsed.transcriptUploaded);

                // If returning from success, go to final step
                if (searchParams.get('success') === 'true') {
                    setStep(6);
                } else if (searchParams.get('step') === 'plans') {
                    // If we were on plans step but failed/returned, stay there
                    setStep(5.8);
                }
            } catch (e) {
                console.error('Failed to restore state', e);
            }
        }
    }, [searchParams]);

    const toggleJourney = (journey: JourneyStage) => {
        setSelectedJourneys((prev: JourneyStage[]) =>
            prev.includes(journey)
                ? prev.filter((j: JourneyStage) => j !== journey)
                : [...prev, journey]
        );
    };

    const handleFileUpload = (file: File) => {
        if (file && (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.docx'))) {
            handleImportResume(file);
            setResumeUploaded(true);
            setTimeout(() => setStep(5), 500);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };
    const primaryJourney = (selectedJourneys[0] || 'job-hunter') as JourneyStage;
    const tailoredContent = TAILORED_CONTENT[primaryJourney];

    const handleComplete = async () => {
        let intent: 'navigator' | 'coach' | 'grad' = 'navigator';
        if (selectedJourneys.includes('student')) intent = 'grad';
        else if (selectedJourneys.includes('employed')) intent = 'coach';

        const primaryJourney = selectedJourneys[0] || 'job-hunter';

        // Save profile data
        const userData = { firstName, lastName, journey: primaryJourney, intent };

        // Store in localStorage/Session
        LocalStorage.set(STORAGE_KEYS.PRIVACY_ACCEPTED, 'true');
        LocalStorage.set(STORAGE_KEYS.USER_JOURNEY, primaryJourney);
        sessionStorage.setItem('pending_user_meta', JSON.stringify(userData));

        // Try to update Supabase if user exists (though they likely don't yet)
        try {
            const { supabase } = await import('../../services/supabase');
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({
                    first_name: firstName,
                    last_name: lastName,
                    journey: primaryJourney
                }).eq('id', user.id);
            }
        } catch (e) {
            // Ignore auth errors here
        }

        // Navigate to Home (clear saved onboarding state so it won't restore on next visit)
        LocalStorage.remove(STORAGE_KEYS.ONBOARDING_STATE);
        navigate(ROUTES.HOME);
    };

    const handleNext = () => {
        if (step === 3 && selectedJourneys.length > 0) {
            // Journey -> Name
            setStep(1.5);
        } else if (step === 1.5) {
            // Name -> Privacy
            setStep(1);
        } else if (step === 1) {
            // Privacy -> Upload (Step 4)
            setStep(4);
        } else if (step === 4) {
            setStep(5.8);
        } else if (step === 5) {
            setStep(5.8);
        } else if (step === 5.5) {
            setStep(5.8);
        } else if (step === 5.8) {
            setStep(6);
        } else if (step === 6) {
            handleComplete();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
            {/* Simple Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
            </div>

            <div className="w-full max-w-2xl bg-white dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 ring-1 ring-neutral-900/5 dark:ring-white/10 overflow-hidden relative z-10 min-h-[600px] flex flex-col">

                {/* Header / Progress */}
                <div className="px-8 pt-8 flex justify-between items-center">
                    <div className="flex gap-2">
                        {[3, 1.5, 1, 4, 5, 5.5, 5.8, 6].map((s, idx) => {
                            // Only show 5.5 if it's the current step or we are a student
                            if (s === 5.5 && step < 5.5 && !isStudent) return null;

                            // Determine if "active" or "completed" based on index in this specific array
                            // We need to find the index of the CURRENT step in this array
                            const currentStepIndex = [3, 1.5, 1, 4, 5, 5.5, 5.8, 6].indexOf(step);
                            const thisStepIndex = idx;

                            return (
                                <div
                                    key={s}
                                    className={`h - 1.5 rounded - full transition - all duration - 500 ${s === step
                                        ? 'w-8 bg-gradient-to-r from-indigo-600 to-violet-600'
                                        : thisStepIndex < currentStepIndex
                                            ? 'w-2 bg-indigo-200 dark:bg-indigo-900'
                                            : 'w-2 bg-neutral-100 dark:bg-neutral-800'
                                        } `}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {/* Step 3: Journey Selection */}
                        {step === 3 && <JourneyStep selectedJourneys={selectedJourneys} toggleJourney={toggleJourney} handleNext={handleNext} />}

                        {/* Step 1.5: Name */}
                        {step === 1.5 && <NameStep firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} setStep={setStep} handleNext={handleNext} />}

                        {/* Step 1: Privacy First */}
                        {step === 1 && <PrivacyStep privacyAccepted={privacyAccepted} setPrivacyAccepted={setPrivacyAccepted} setStep={setStep} handleNext={handleNext} />}

                        {/* Step 4: Resume Upload */}
                        {step === 4 && <ResumeUploadStep tailoredContent={tailoredContent} handleDrop={handleDrop} isDragging={isDragging} setIsDragging={setIsDragging} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} isParsingResume={isParsingResume} setStep={setStep} handleNext={handleNext} />}

                        {/* Step 5: Feature Highlights (While Parsing) */}
                        {step === 5 && <ProfileProcessingStep parsingSnapshot={parsingSnapshot} />}

                        {/* Step 5.5: Smart Transcript Prompt */}
                        {step === 5.5 && <TranscriptOcrStep setTranscriptUploaded={setTranscriptUploaded} setStep={setStep} />}

                        {/* Step 5.8: Plans Selection */}
                        {step === 5.8 && (
                            <motion.div
                                key="step-5.8"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-4xl"
                            >
                                <div className="card-premium p-4 md:p-10 shadow-2xl">
                                    <PlansOnboardingStep
                                        onNext={() => setStep(6)}
                                        firstName={firstName}
                                        lastName={lastName}
                                        selectedJourneys={selectedJourneys}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: Ready */}
                        {step === 6 && <FinalLaunchStep selectedJourneys={selectedJourneys} handleComplete={handleComplete} />}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
};
