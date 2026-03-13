import React from 'react';
import type { UsageLimitResult } from '../services/usageLimits';
import { X, Sparkles, Zap, Check, Shield, Cpu, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { paymentService } from '../services/paymentService';
import { PLAN_PRICING } from '../constants';
import { supabase } from '../services/supabase';

interface UpgradeModalProps {
    limitInfo?: UsageLimitResult | null;
    onClose: () => void;
    initialView?: 'upgrade' | 'compare';
    userTier?: string;
    averageScore?: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ limitInfo, onClose, initialView = 'compare', userTier = 'free', averageScore }) => {
    const [view, setView] = React.useState<'upgrade' | 'compare'>(limitInfo ? 'upgrade' : initialView);
    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
    const { showError } = useToast();

    const handleUpgrade = async (plan: string) => {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showError('Please sign in first to upgrade.');
            return;
        }

        const tierKey = plan.toLowerCase() as keyof typeof PLAN_PRICING;
        const pricing = PLAN_PRICING[tierKey];
        if (!pricing) return;

        setLoadingPlan(plan);
        try {
            const priceId = pricing.PRICE_ID_MONTHLY;
            if (!priceId || priceId.includes('placeholder')) {
                showError('Payment setup is not complete. Please contact support.');
                return;
            }

            const { url } = await paymentService.createCheckoutSession(priceId);
            window.location.href = url;
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error('Checkout error:', err);
            showError(err.message || 'Something went wrong during checkout. Please try again.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const PLAN_FEATURES = [
        {
            name: 'Explorer',
            price: '$0',
            description: 'Try Navigator for free',
            features: [
                '3 Job Analyses (lifetime)',
                'Basic AI Model (Gemini Flash)',
                'Cover Letter Generation',
                'Application Tracker',
                'Match Quality Ratings'
            ],
            cta: userTier === 'free' ? 'Current Plan' : 'Explorer Plan',
            disabled: userTier === 'free',
            premium: false
        },
        {
            name: 'Plus',
            price: '$19',
            period: '/mo',
            description: 'For the active searcher',
            features: [
                '200 Job Analyses / week',
                '5 Email Job Alerts / day',
                '5 Career Mentors',
                'Interview Mission Control',
                'Pro AI Model (Gemini 2.5 Pro)',
                'Detailed Match Scores'
            ],
            cta: userTier === 'plus' ? 'Current Plan' : 'Upgrade to Plus',
            disabled: userTier === 'plus',
            premium: true,
            highlight: false
        },
        {
            name: 'Pro',
            price: '$29',
            period: '/mo',
            description: 'For the career pivoter',
            features: [
                'Unlimited Job Analyses',
                '25 Email Job Alerts / day',
                'Unlimited Career Mentors',
                'Interview Mission Control (Pro)',
                'Best AI Model (Gemini 3 Pro)',
                'Cover Letter Quality Loop'
            ],
            cta: (userTier === 'pro' || userTier === 'admin' || userTier === 'tester') ? 'Current Plan' : 'Upgrade to Pro',
            disabled: (userTier === 'pro' || userTier === 'admin' || userTier === 'tester'),
            premium: true,
            highlight: true
        }
    ];

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 sm:p-6">
            <div className={`bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl ${view === 'compare' ? 'max-w-5xl' : 'max-w-md'} w-full relative animate-in zoom-in-95 fade-in duration-300 border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="overflow-y-auto p-8 sm:p-12 custom-scrollbar">
                    {view === 'upgrade' ? (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-8 shadow-xl shadow-indigo-500/20 rotate-3">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>

                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">
                                Trial Complete
                            </h2>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-8">
                                You've seen what Navigator can do. Here's where you landed.
                            </p>

                            {averageScore != null && (
                                <div className="flex items-center justify-center gap-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl px-8 py-5 mb-8">
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{limitInfo?.used ?? 3}</div>
                                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Jobs Analyzed</div>
                                    </div>
                                    <div className="w-px h-10 bg-neutral-200 dark:bg-neutral-700" />
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-indigo-500 tracking-tight">{averageScore}%</div>
                                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Avg Match Score</div>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
                                Keep the momentum going. Upgrade to run unlimited analyses, close your skills gaps, and generate cover letters built from your actual experience.
                            </p>

                            <div className="grid grid-cols-1 gap-4 mb-10">
                                <button
                                    onClick={() => setView('compare')}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                                >
                                    View All Plans
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-4 tracking-tighter">Choose Your Velocity</h1>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-lg mx-auto leading-relaxed">
                                    From casual exploring to high-stakes career pivoting, there's a Navigator plan built for your path.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {PLAN_FEATURES.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`relative group flex flex-col p-8 rounded-[2rem] border transition-all duration-300 ${plan.highlight
                                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent shadow-2xl scale-105 z-10'
                                            : 'bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-100 dark:border-neutral-800 hover:border-indigo-500/30'
                                            }`}
                                    >
                                        {plan.highlight && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                                Recommended
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <h3 className="text-xl font-black tracking-tight">{plan.name}</h3>
                                            <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60`}>{plan.description}</p>
                                        </div>

                                        <div className="flex items-baseline gap-1 mb-8">
                                            <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                                            {plan.period && <span className="text-lg opacity-40 font-bold">{plan.period}</span>}
                                        </div>

                                        <div className="space-y-4 mb-10 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className={`mt-0.5 p-0.5 rounded-full ${plan.highlight ? 'bg-white/20 dark:bg-neutral-900/10' : 'bg-indigo-500/10'}`}>
                                                        <Check className={`w-3 h-3 ${plan.highlight ? 'text-white dark:text-neutral-900' : 'text-indigo-500'}`} />
                                                    </div>
                                                    <span className="text-xs font-semibold opacity-80 leading-relaxed">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => !plan.disabled && handleUpgrade(plan.name)}
                                            disabled={plan.disabled || loadingPlan === plan.name}
                                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${plan.highlight
                                                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:scale-[1.02] active:scale-95 shadow-xl'
                                                : plan.disabled
                                                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20'
                                                }`}
                                        >
                                            {loadingPlan === plan.name ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                            ) : (
                                                plan.cta
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap justify-center gap-x-12 gap-y-6">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Secure Stripe Payment</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Instant Activation</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Cpu className="w-5 h-5 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Cancel Anytime</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
