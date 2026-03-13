import React, { useState, useEffect } from 'react';
import { Mail, Loader2, ArrowRight, LogOut, CheckCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

export const EmailVerificationScreen: React.FC = () => {
    const { user, signOut, resendVerificationEmail, refreshUser, isEmailVerified } = useUser();
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [cooldown, setCooldown] = useState(0);

    // Refresh user state periodically or on button click
    useEffect(() => {
        if (!user) {
            window.location.href = '/';
            return;
        }

        if (isEmailVerified) {
            window.location.href = '/';
            return;
        }

        const interval = setInterval(() => {
            refreshUser();
        }, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [refreshUser, isEmailVerified, user]);

    const handleResend = async () => {
        if (cooldown > 0) return;

        setResending(true);
        setMessage(null);

        const { success, error } = await resendVerificationEmail();

        if (success) {
            setMessage({ type: 'success', text: 'Verification email sent! Check your inbox.' });
            setCooldown(60); // 1 minute cooldown
        } else {
            const errorMsg = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Failed to send email. Please try again.');
            setMessage({ type: 'error', text: errorMsg });
        }
        setResending(false);
    };

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#000000] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-neutral-800 ring-1 ring-black/5 dark:ring-white/5">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 transform rotate-12">
                                <Mail className="w-12 h-12 text-white -rotate-12" />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-neutral-900 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                            >
                                <RefreshCw className="w-4 h-4 text-white animate-spin-slow" />
                            </motion.div>
                        </div>

                        <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">
                            Verify your email
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-8">
                            We sent a verification link to <span className="text-neutral-900 dark:text-white font-bold">{user?.email}</span>. Please click it to continue.
                        </p>

                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`w-full p-4 mb-6 rounded-2xl flex items-start gap-3 border text-sm font-semibold ${message.type === 'success'
                                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                        }`}
                                >
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />}
                                    <span>{message.text}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="w-full space-y-4">
                            <button
                                onClick={() => refreshUser()}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                            >
                                <span>I've verified my email</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={handleResend}
                                disabled={resending || cooldown > 0}
                                className="w-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}</span>
                            </button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 w-full flex items-center justify-center gap-6">
                            <button
                                onClick={signOut}
                                className="text-sm font-bold text-neutral-400 hover:text-rose-500 transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign out</span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-loose">
                    TRUSTED BY OVER 10,000+ PROFESSIONALS<br />
                    NAVIGATOR SECURE VERIFICATION
                </p>
            </motion.div>
        </div>
    );
};
