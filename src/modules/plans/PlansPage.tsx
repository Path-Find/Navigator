import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, Shield } from 'lucide-react';
import { ROUTES, PLAN_LIMITS, PLAN_PRICING, USER_TIERS, HEADLINES } from '../../constants';
import { getFeaturesForPlan } from '../../featureRegistry';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { useUser } from '../../contexts/UserContext';
import { useModal } from '../../contexts/ModalContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { PlanCard } from '../../components/ui/PlanCard';
import { useToast } from '../../contexts/ToastContext';

export const PlansPage: React.FC = () => {


    const { user, userTier } = useUser();
    const { openModal } = useModal();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isAnnual, setIsAnnual] = useState(false);
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const { showError, showInfo } = useToast();

    // Cycle headline on each visit
    const headline = useMemo(() => {
        const choices = HEADLINES.plans;
        return choices[Math.floor(Math.random() * choices.length)];
    }, []);

    const plusPrice = isAnnual ? PLAN_PRICING[USER_TIERS.PLUS].ANNUAL_MONTHLY : PLAN_PRICING[USER_TIERS.PLUS].MONTHLY;
    const proPrice = isAnnual ? PLAN_PRICING[USER_TIERS.PRO].ANNUAL_MONTHLY : PLAN_PRICING[USER_TIERS.PRO].MONTHLY;

    useEffect(() => {
        if (searchParams.get('success')) {
            navigate(ROUTES.PLANS, { replace: true });
        }
    }, [searchParams, navigate]);



    const handleSelectPlan = async (tier: string) => {
        if (tier === userTier) {
            navigate(ROUTES.HOME);
            return;
        }

        if (tier === USER_TIERS.FREE) {
            navigate(ROUTES.WELCOME);
            return;
        }

        // Require authentication for paid plans
        if (!user) {
            openModal('AUTH');
            return;
        }

        setLoadingTier(tier);
        try {
            let priceId = '';
            if (tier === USER_TIERS.PLUS) {
                priceId = isAnnual ? PLAN_PRICING[USER_TIERS.PLUS].PRICE_ID_ANNUAL : PLAN_PRICING[USER_TIERS.PLUS].PRICE_ID_MONTHLY;
            } else if (tier === USER_TIERS.PRO) {
                priceId = isAnnual ? PLAN_PRICING[USER_TIERS.PRO].PRICE_ID_ANNUAL : PLAN_PRICING[USER_TIERS.PRO].PRICE_ID_MONTHLY;
            }

            if (!priceId || priceId.includes('placeholder')) {
                showError('Payment setup is not complete. Please contact support.');
                return;
            }

            // TEMP: Disable checkouts while refining NextGen - Offer Waitlist
            setWaitlistStatus('loading');
            try {
                const { WaitlistService } = await import('../../services/waitlistService');
                const result = await WaitlistService.joinWaitlist(user.email!, `upgrade_${tier}`);
                if (result.success) {
                    setWaitlistStatus('success');
                    showInfo("You're on the waitlist for " + tier.toUpperCase() + "! We'll notify you when it's ready.");
                } else {
                    showError(result.error || "Failed to join waitlist.");
                }
            } catch (err) {
                showError("Something went wrong. Please try again.");
            } finally {
                setWaitlistStatus('idle');
            }
            return;

            const { url } = await paymentService.createCheckoutSession(priceId);
            window.location.href = url;

        } catch (error: unknown) {
            console.error('Error creating checkout session:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';

            if (errorMsg === 'User not authenticated') {
                openModal('AUTH');
            } else {
                showError('Something went wrong during checkout. Please try again.');
            }
        } finally {
            setLoadingTier(null);
        }
    };


    return (
        <SharedPageLayout
            maxWidth="full"
            spacing="hero"
            className="relative overflow-hidden bg-white dark:bg-[#0a0a0a] min-h-screen pb-20"
        >
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

            <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6">
                <PageHeader
                    variant="hero"
                    title={headline.text}
                    highlight={headline.highlight}
                    subtitle="Choose the plan that fits your pace — from exploring to all-in."
                />

                <div className="flex justify-center -mt-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-indigo-600 dark:text-indigo-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                        <Zap className="w-4 h-4" />
                        We're currently invite-only while calibrating NextGen.
                    </div>
                </div>

                <div className="text-center mb-16 flex flex-col items-center -mt-8">
                    {/* Monthly / Annual Toggle */}
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex items-center justify-center gap-6"
                    >
                        <div className="flex items-center">
                            <div className="relative inline-flex p-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                                {/* Sliding highlight */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white dark:bg-neutral-800 shadow-sm transition-transform duration-200 ease-in-out ${isAnnual ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                                />
                                <button
                                    onClick={() => setIsAnnual(false)}
                                    className={`relative z-10 px-5 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${!isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setIsAnnual(true)}
                                    className={`relative z-10 px-5 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                                >
                                    Annual
                                </button>
                            </div>

                            <AnimatePresence>
                                {isAnnual && (
                                    <motion.div
                                        key="savings-badge-container"
                                        layout
                                        initial={{ width: 0, opacity: 0, x: -5 }}
                                        animate={{ width: 'auto', opacity: 1, x: 0 }}
                                        exit={{ width: 0, opacity: 0, x: -5 }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeInOut"
                                        }}
                                        className="overflow-hidden flex items-center shrink-0"
                                    >
                                        <span className="ml-3 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-full whitespace-nowrap">
                                            Save up to 21%
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.div layout transition={{ duration: 0.2, ease: "easeInOut" }} className="flex items-center shrink-0">
                            <Link
                                to={ROUTES.FEATURES}
                                className="group flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                            >
                                Explore all features
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto px-4 sm:px-6 items-stretch">
                {/* Explorer Plan */}
                <PlanCard
                    title="Explorer"
                    price="$0"
                    accentColor="slate"
                    buttonText={
                        !user ? 'Start Free Trial' :
                            (userTier === USER_TIERS.FREE || !userTier) ? 'Current Plan' :
                                (userTier === USER_TIERS.ADMIN || userTier === USER_TIERS.TESTER) ? 'Your access exceeds this' :
                                    'Trial Plan'
                    }
                    onSelect={() => handleSelectPlan(USER_TIERS.FREE)}
                    features={getFeaturesForPlan('explorer').map(f => ({ name: f.name, desc: f.description.plan, isComingSoon: f.stage === 'beta' }))}
                    limits={{
                        analyses: String(PLAN_LIMITS[USER_TIERS.FREE].TOTAL_ANALYSES),
                        analysesPeriod: 'lifetime',
                        emails: PLAN_LIMITS[USER_TIERS.FREE].DAILY_EMAILS,
                        emailPeriod: 'day',
                        mentors: PLAN_LIMITS[USER_TIERS.FREE].ROLE_MODELS,
                        mentorPeriod: 'total',
                        interviews: PLAN_LIMITS[USER_TIERS.FREE].SKILLS_INTERVIEWS
                    }}
                />

                {/* Plus Plan */}
                <PlanCard
                    title="Plus"
                    price={`$${plusPrice}`}
                    accentColor="indigo"
                    subText="Everything in Explorer, plus..."
                    buttonText={userTier === USER_TIERS.PLUS ? 'Current Plan' : 'Join Plus Waitlist'}
                    onSelect={() => handleSelectPlan(USER_TIERS.PLUS)}
                    isLoading={loadingTier === USER_TIERS.PLUS || (loadingTier === USER_TIERS.PLUS && waitlistStatus === 'loading')}
                    features={getFeaturesForPlan('plus').map(f => ({ name: f.name, desc: f.description.plan, isComingSoon: f.stage === 'beta' }))}
                    limits={{
                        analyses: String(PLAN_LIMITS[USER_TIERS.PLUS].WEEKLY_ANALYSES),
                        analysesPeriod: 'week',
                        emails: PLAN_LIMITS[USER_TIERS.PLUS].DAILY_EMAILS,
                        emailPeriod: 'day',
                        mentors: PLAN_LIMITS[USER_TIERS.PLUS].ROLE_MODELS,
                        mentorPeriod: 'total',
                        interviews: PLAN_LIMITS[USER_TIERS.PLUS].SKILLS_INTERVIEWS
                    }}
                />

                {/* Pro Plan */}
                <PlanCard
                    title="Pro"
                    price={`$${proPrice}`}
                    isPopular={true}
                    accentColor="emerald"
                    subText="Everything in Plus, plus..."
                    buttonText={userTier === USER_TIERS.PRO ? 'Current Plan' : 'Join Pro Waitlist'}
                    onSelect={() => handleSelectPlan(USER_TIERS.PRO)}
                    isLoading={loadingTier === USER_TIERS.PRO || (loadingTier === USER_TIERS.PRO && waitlistStatus === 'loading')}
                    features={getFeaturesForPlan('pro').map(f => ({ name: f.name, desc: f.description.plan, isComingSoon: f.stage === 'beta' }))}
                    limits={{
                        analyses: String(PLAN_LIMITS[USER_TIERS.PRO].DAILY_ANALYSES),
                        analysesPeriod: 'day',
                        emails: PLAN_LIMITS[USER_TIERS.PRO].DAILY_EMAILS,
                        emailPeriod: 'day',
                        mentors: PLAN_LIMITS[USER_TIERS.PRO].ROLE_MODELS,
                        mentorPeriod: 'total',
                        interviews: PLAN_LIMITS[USER_TIERS.PRO].SKILLS_INTERVIEWS
                    }}
                />
            </div>

            {/* Promo Code Link */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center mt-12"
            >
                <span className="text-[10px] text-neutral-300 dark:text-neutral-600 font-medium mt-3 block text-center">
                    Have a promo code? You can apply it at checkout.
                </span>
            </motion.div>

            {/* FAQ or Trust Badge Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-24 pt-12 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-4 sm:px-6"
            >
                <div className="flex gap-4 items-start text-left">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Instant Activation</h4>
                        <p className="text-sm text-neutral-500">Upgrade and get access to premium features immediately.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Cancel Anytime</h4>
                        <p className="text-sm text-neutral-500">No contracts or hidden fees. Cancel in one click.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">No Commitments</h4>
                        <p className="text-sm text-neutral-500">Upgrade or downgrade your plan at any time.</p>
                    </div>
                </div>
            </motion.div>
        </SharedPageLayout>
    );
};

export default PlansPage;
