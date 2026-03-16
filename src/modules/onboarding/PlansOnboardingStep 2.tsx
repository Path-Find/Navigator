import { PLAN_PRICING, USER_TIERS } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Mail, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { PlanCard } from '../../components/ui/PlanCard';
import { paymentService } from '../../services/paymentService';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../services/supabase';

interface PlansOnboardingStepProps {
    onNext: () => void;
    firstName?: string;
    lastName?: string;
    selectedJourneys?: string[];
}

export const PlansOnboardingStep: React.FC<PlansOnboardingStepProps> = ({
    onNext,
    firstName,
    lastName,
    selectedJourneys
}) => {
    const { user } = useUser();
    const [isAnnual, setIsAnnual] = useState(false);
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const { showSuccess } = useToast();

    // Auth State for Guest Users
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
    const [authError, setAuthError] = useState<string | null>(null);
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const plusPrice = isAnnual ? PLAN_PRICING.plus.ANNUAL_MONTHLY : PLAN_PRICING.plus.MONTHLY;
    const proPrice = isAnnual ? PLAN_PRICING.pro.ANNUAL_MONTHLY : PLAN_PRICING.pro.MONTHLY;

    const handleSelectPlan = async (tier: string) => {
        setLoadingTier(tier);
        setAuthError(null);

        // Password Validation Logic
        const validatePassword = (pass: string) => {
            if (pass.length < 8) return "Password must be at least 8 characters.";
            if (!/\d/.test(pass)) return "Password must contain at least one number.";
            return null;
        };

        try {
            // 1. Handle Auth for Guest Users
            if (!user) {
                if (!email.trim()) {
                    setAuthError('Please enter your email.');
                    setLoadingTier(null);
                    return;
                }

                if (authMode === 'magic-link') {
                    const { error: magicError } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            data: {
                                first_name: firstName,
                                last_name: lastName,
                                journey: selectedJourneys?.[0] || 'job-hunter',
                            },
                            emailRedirectTo: window.location.origin + '/welcome?success=true'
                        }
                    });
                    if (magicError) throw magicError;
                    setMagicLinkSent(true);
                    setLoadingTier(null);
                    return; // Wait for user to click link
                }

                if (!password.trim()) {
                    setAuthError('Please enter a password.');
                    setLoadingTier(null);
                    return;
                }

                const passError = validatePassword(password);
                if (passError) {
                    setAuthError(passError);
                    setLoadingTier(null);
                    return;
                }

                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            journey: selectedJourneys?.[0] || 'job-hunter',
                        }
                    }
                });

                if (signUpError) throw signUpError;
            }

            // 2. Handle Free Tier (Direct Success)
            if (tier === USER_TIERS.FREE) {
                showSuccess("Welcome to Navigator!");
                onNext();
                return;
            }

            // 3. Handle Paid Tiers (Stripe)
            const activeTierKey = tier.toLowerCase() as 'plus' | 'pro';
            const priceId = isAnnual ? PLAN_PRICING[activeTierKey].PRICE_ID_ANNUAL : PLAN_PRICING[activeTierKey].PRICE_ID_MONTHLY;

            if (!priceId || priceId.includes('placeholder')) {
                setAuthError('Payment setup is not complete. Please contact support.');
                setLoadingTier(null);
                return;
            }

            const baseUrl = window.location.origin + window.location.pathname;
            const returnUrl = `${baseUrl}?success=true&step=plans&session_id={CHECKOUT_SESSION_ID}`;

            const { url } = await paymentService.createCheckoutSession(priceId, returnUrl);
            window.location.href = url;

        } catch (error: unknown) {
            console.error('Checkout error:', error);
            const message = error instanceof Error ? error.message : 'Failed to initiate checkout.';
            setAuthError(message);
        } finally {
            setLoadingTier(null);
        }
    };


    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1 flex flex-col absolute inset-0 p-8 overflow-hidden">
            {/* Immersive Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>



            <div className="relative z-10 flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100 dark:border-indigo-800/50">
                        <Zap className="w-3 h-3 fill-current" />
                        Premium Experience
                    </div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">
                        Power Up Your Journey
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto text-sm leading-relaxed">
                        Scale your application efforts with smarter tools and personalized career roadmaps.
                    </p>

                    {/* Guest Account Info */}
                    {!user && (
                        <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-neutral-800/40 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-xl animate-in slide-in-from-top-4 duration-500">
                            <div className="text-left mb-6">
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">Create your account</h3>
                                <p className="text-xs text-neutral-500">Enter your details to save your progress and sync your resume.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                {authMode === 'password' && (
                                    <div className="relative group animate-in slide-in-from-top-2 duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create password"
                                            className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setAuthMode(authMode === 'password' ? 'magic-link' : 'password')}
                                        className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
                                    >
                                        {authMode === 'password' ? 'Use Magic Link instead' : 'Use Password instead'}
                                    </button>
                                </div>

                                {magicLinkSent && (
                                    <p className="text-[10px] font-bold text-emerald-500 mt-2 text-center animate-in fade-in slide-in-from-top-1">
                                        Magic link sent! Check your inbox to continue.
                                    </p>
                                )}

                                {authError && (
                                    <p className="text-[10px] font-bold text-rose-500 mt-2 animate-in fade-in slide-in-from-top-1">
                                        {authError}
                                    </p>
                                )}
                                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-4 text-center">
                                    By signing up, you agree to Navigator's {' '}
                                    <a href="/terms" target="_blank" className="font-bold underline hover:text-neutral-600 dark:hover:text-neutral-300">Terms</a>
                                    {' '} and {' '}
                                    <a href="/privacy" target="_blank" className="font-bold underline hover:text-neutral-600 dark:hover:text-neutral-300">Privacy Policy</a>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Monthly / Annual Toggle */}
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <div className="relative inline-flex p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-md">
                            <div
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white dark:bg-neutral-700 shadow-sm transition-transform duration-300 ease-out ${isAnnual ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                            />
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`relative z-10 px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-200 ${!isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`relative z-10 px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-200 ${isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Yearly
                            </button>
                        </div>
                        {isAnnual && (
                            <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-top-1 duration-300">
                                <Sparkles className="w-3 h-3" />
                                Save 21% with Annual
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-center max-w-4xl mx-auto w-full mb-8">
                    {/* Explorer Plan */}
                    <PlanCard
                        variant="compact"
                        title="Explorer"
                        price="$0"
                        accentColor="slate"
                        buttonText="Select Free"
                        onSelect={() => handleSelectPlan(USER_TIERS.FREE)}
                        isLoading={loadingTier === USER_TIERS.FREE}
                        features={[
                            { name: 'Application Tracker', desc: '' },
                            { name: 'Basic Match Scores', desc: '' },
                            { name: 'Job Board Alerts', desc: '' },
                        ]}
                    />

                    {/* Plus Plan */}
                    <PlanCard
                        variant="compact"
                        title="Plus"
                        price={`$${plusPrice}`}
                        accentColor="violet"
                        subText="Pro Analysis & Tailoring"
                        buttonText="Get Plus"
                        onSelect={() => handleSelectPlan(USER_TIERS.PLUS)}
                        isLoading={loadingTier === USER_TIERS.PLUS}
                        features={[
                            { name: 'Detailed Match Scores', desc: '' },
                            { name: 'Skills Audit', desc: '' },
                            { name: 'Resume Tailoring', desc: '' },
                        ]}
                    />

                    {/* Pro Plan */}
                    <PlanCard
                        variant="compact"
                        title="Pro"
                        price={`$${proPrice}`}
                        isPopular={true}
                        accentColor="emerald"
                        subText="Complete Career Engine"
                        buttonText="Get Pro"
                        onSelect={() => handleSelectPlan(USER_TIERS.PRO)}
                        isLoading={loadingTier === USER_TIERS.PRO}
                        features={[
                            { name: 'Personalized Roadmaps', desc: '' },
                            { name: 'Role Modeling', desc: '' },
                            { name: 'Interview Coaching', desc: '' },
                        ]}
                    />
                </div>

                <div className="flex flex-col items-center gap-4 mt-auto pb-8">
                    <div className="flex items-center gap-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secure Stripe Payment
                        </div>
                        <div className="w-1 h-1 rounded-full bg-neutral-300" />
                        <div className="flex items-center gap-1.5 opacity-50 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => handleSelectPlan(USER_TIERS.FREE)}>
                            Skip for now
                            <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
