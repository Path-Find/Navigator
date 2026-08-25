import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Lock, Loader2, ArrowRight, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { authClient } from '../../lib/auth-client';
import { getUserFriendlyError } from '../../utils/errorMessages';
import { useModal } from '../../contexts/ModalContext';
import { ROUTES } from '../../constants';

// Renders at ROUTES.RESET_PASSWORD ("/reset-password"), intentionally OUTSIDE
// ProtectedRoute — the visitor here has no logged-in session yet, only a
// one-time recovery token in the URL (?token=...) that Neon Auth's
// requestPasswordReset() appended when it redirected them from the email link.
// That token is exchanged directly for a new password via Better Auth's
// resetPassword() endpoint (authClient.getBetterAuthInstance().resetPassword),
// which is intentionally NOT part of the Supabase-shaped authClient surface.
export const ResetPasswordScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { openModal } = useModal();

    const token = searchParams.get('token');
    // Better Auth's server-side reset-password callback redirects here with
    // ?error=INVALID_TOKEN itself (before this page's own resetPassword() call)
    // when the link has already expired or been used.
    const linkError = searchParams.get('error');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        linkError || !token ? 'This reset link is invalid or has expired. Please request a new one from the sign-in screen.' : null
    );
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError('This reset link is invalid or missing a token. Please request a new one.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password should be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error: resetError } = await authClient.getBetterAuthInstance().resetPassword({
                newPassword,
                token,
            });
            if (resetError) throw resetError;
            setSuccess(true);
        } catch (err: unknown) {
            setError(getUserFriendlyError(err instanceof Error ? err : new Error(String(err))));
        } finally {
            setLoading(false);
        }
    };

    const handleGoToSignIn = () => {
        navigate(ROUTES.HOME);
        openModal('AUTH', { authMode: 'sign-in' });
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#000000] flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neutral-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neutral-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-neutral-800 ring-1 ring-black/5 dark:ring-white/5">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-neutral-500 to-neutral-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-neutral-500/30 transform rotate-12 mb-8">
                            <KeyRound className="w-12 h-12 text-white -rotate-12" />
                        </div>

                        {success ? (
                            <>
                                <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">
                                    Password updated
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-8">
                                    Your password has been changed. Sign in with your new password to continue.
                                </p>
                                <div className="w-full p-4 mb-6 rounded-2xl flex items-start gap-3 border text-sm font-semibold bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>You're all set.</span>
                                </div>
                                <button
                                    onClick={handleGoToSignIn}
                                    className="w-full bg-gradient-to-r from-neutral-600 to-neutral-600 hover:from-neutral-500 hover:to-neutral-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-neutral-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                                >
                                    <span>Sign in</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">
                                    Set a new password
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-8">
                                    Choose a new password for your account.
                                </p>

                                <form onSubmit={handleSubmit} className="w-full space-y-5 text-left">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2 ml-1">New password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <div className="bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-md text-neutral-500 dark:text-neutral-400 group-focus-within:bg-neutral-800 dark:group-focus-within:bg-neutral-200 group-focus-within:text-white dark:group-focus-within:text-neutral-900 transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                autoFocus
                                                autoComplete="new-password"
                                                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:bg-white dark:focus:bg-neutral-800 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-500/10 outline-none transition-all text-neutral-900 dark:text-white"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2 ml-1">Confirm password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <div className="bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-md text-neutral-500 dark:text-neutral-400 group-focus-within:bg-neutral-800 dark:group-focus-within:bg-neutral-200 group-focus-within:text-white dark:group-focus-within:text-neutral-900 transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                autoComplete="new-password"
                                                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:bg-white dark:focus:bg-neutral-800 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-500/10 outline-none transition-all text-neutral-900 dark:text-white"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-rose-600 dark:text-rose-400 text-sm animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <span className="font-medium">{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !token}
                                        className="w-full bg-gradient-to-r from-neutral-600 to-neutral-600 hover:from-neutral-500 hover:to-neutral-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-neutral-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 group"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                        <span>Update password</span>
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
