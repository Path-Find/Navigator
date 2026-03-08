import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { X, Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle, Sparkles, TrendingUp, Zap, FileText, GraduationCap, Bookmark, PenTool, RefreshCw, Shield, Users, Globe, Search, Calculator, MessageSquare, Rss } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getUserFriendlyError } from '../utils/errorMessages';
import { FEATURE_COLORS, type FeatureDefinition } from '../featureRegistry';

const ICON_MAP: Record<string, LucideIcon> = {
    Sparkles, TrendingUp, Zap, FileText, GraduationCap, Bookmark,
    PenTool, Mail, RefreshCw, Shield, Users, Globe, Search, Calculator,
    MessageSquare, Rss,
};

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureContext?: FeatureDefinition;
    authMode?: 'sign-in' | 'sign-up';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, featureContext, authMode }) => {
    const [step, setStep] = useState(0); // 0: Email, 1: Password/Invite
    const [isSignUp, setIsSignUp] = useState(false);

    const getHeading = () => {
        if (successMessage) return 'Success';
        if (step === 0) {
            if (authMode === 'sign-in') return 'Sign In';
            if (authMode === 'sign-up') return 'Create Account';
            return 'Get Started';
        }
        return isSignUp ? 'Create Account' : 'Welcome Back';
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            // Reset state on close
            setStep(0);
            setEmail('');
            setPassword('');
            setSuccessMessage(null);
            setError(null);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check if user exists via RPC
            // This allows us to seamlessly route to Login vs Create Account
            const { data: exists, error: checkError } = await supabase.rpc('check_user_exists', {
                email_input: email.toLowerCase().trim()
            });

            if (!checkError) {
                if (!exists) {
                    setError('We are not currently accepting new users.');
                    setLoading(false);
                    return;
                }
                setIsSignUp(false);
            } else {
                // Background fallback: If RPC fails, we'll default to login
                // but keep a way to switch if needed.
                console.warn('check_user_exists RPC failed or not found. Defaulting to Sign In.');
                setIsSignUp(false);
            }

            setStep(1);
        } catch (err: unknown) {
            setError(getUserFriendlyError(err instanceof Error ? err : new Error(String(err))));
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isSignUp) {


                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setSuccessMessage("Account created! Please check your email to confirm.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Sync data after successful login
                await import('../services/storageService').then(m => m.Storage.syncLocalToCloud());
                onClose(); // Close on successful login
            }
        } catch (err: unknown) {
            setError(getUserFriendlyError(err instanceof Error ? err : new Error(String(err))));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please go back and enter your email first.');
            return;
        }
        setResetLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/settings`,
            });
            if (resetError) throw resetError;
            setSuccessMessage('Password reset link sent! Check your inbox.');
        } catch (err: unknown) {
            setError(getUserFriendlyError(err instanceof Error ? err : new Error(String(err))));
        } finally {
            setResetLoading(false);
        }
    };

    // Feature sidebar component
    const FeatureSidebar = () => {
        if (!featureContext) return null;

        const Icon = ICON_MAP[featureContext.iconName] || Sparkles;
        const colors = FEATURE_COLORS[featureContext.colorKey] || FEATURE_COLORS.indigo;

        return (
            <div className={`hidden md:flex flex-col p-8 rounded-l-3xl h-full ${colors.bg} border-r border-neutral-200/50 dark:border-neutral-800/50 relative overflow-hidden`}>
                {/* Decorative glow */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${colors.glow} blur-3xl opacity-60`} />
                <div className={`absolute -bottom-20 -left-20 w-48 h-48 rounded-full ${colors.glow} blur-3xl opacity-40`} />

                <div className="relative z-10 flex-1 flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-2xl ${colors.iconBg} flex items-center justify-center shadow-lg mb-6`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="mb-6">
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                            Unlock {featureContext.name}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                            Join Navigator to access {featureContext.name} and our complete suite of AI-powered career tools designed to help you land your next role.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const authForm = (
        <div className="p-8">
            {successMessage ? (
                <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Check your inbox</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-xs mx-auto leading-relaxed">{successMessage}</p>
                    <button
                        onClick={onClose}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 w-full py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                    >
                        Close
                    </button>
                </div>
            ) : step === 0 ? (
                <form onSubmit={handleEmailSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 ml-1">Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div className="bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-md text-neutral-500 dark:text-neutral-400 group-focus-within:bg-neutral-800 dark:group-focus-within:bg-neutral-200 group-focus-within:text-white dark:group-focus-within:text-neutral-900 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-14 pr-16 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:bg-white dark:focus:bg-neutral-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-neutral-900 dark:text-white"
                                placeholder="you@email.com"
                            />
                            <div className="absolute inset-y-0 right-1.5 flex items-center">
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="p-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {featureContext && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span>Free to get started</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span>Set up in under 60 seconds</span>
                            </div>
                        </div>
                    )}
                </form>
            ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl flex items-center justify-between border border-neutral-100 dark:border-neutral-700 mb-4">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">{email}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(0)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Change
                        </button>
                    </div>



                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Password</label>
                            {!isSignUp && (
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={resetLoading}
                                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                                >
                                    {resetLoading ? 'Sending...' : 'Forgot?'}
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div className="bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-md text-neutral-500 dark:text-neutral-400 group-focus-within:bg-neutral-800 dark:group-focus-within:bg-neutral-200 group-focus-within:text-white dark:group-focus-within:text-neutral-900 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:bg-white dark:focus:bg-neutral-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-neutral-900 dark:text-white"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-rose-600 dark:text-rose-400 text-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        </button>
                    </div>

                </form>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className={`bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-neutral-900/5 dark:ring-white/10 ${featureContext ? 'max-w-3xl' : 'max-w-md'}`}>
                {featureContext ? (
                    /* Two-column layout: Feature preview + Auth form */
                    <div className="flex items-stretch">
                        <div className="w-[45%]">
                            <FeatureSidebar />
                        </div>
                        <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-900/50">
                            <div className="px-8 py-6 border-b border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-900/20 dark:to-violet-900/20">
                                <h3 className="font-bold text-xl text-neutral-900 dark:text-white tracking-tight">
                                    {getHeading()}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                {authForm}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Standard single-column layout */
                    <>
                        <div className="px-8 py-6 border-b border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-900/20 dark:to-violet-900/20">
                            <h3 className="font-bold text-xl text-neutral-900 dark:text-white tracking-tight">
                                {successMessage ? 'Success' : step === 0 ? 'Get Started' : isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {authForm}
                    </>
                )}
            </div>
        </div>
    );
};
