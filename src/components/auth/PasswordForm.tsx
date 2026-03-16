import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

interface PasswordFormProps {
    email: string;
    onEmailChange: () => void;
    onSubmit: (e: React.FormEvent) => void;
    password: string;
    setPassword: (pw: string) => void;
    isSignUp: boolean;
    loading: boolean;
    error: string | null;
    onForgotPassword: () => void;
    resetLoading: boolean;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({
    email,
    onEmailChange,
    onSubmit,
    password,
    setPassword,
    isSignUp,
    loading,
    error,
    onForgotPassword,
    resetLoading
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl flex items-center justify-between border border-neutral-100 dark:border-neutral-700 mb-4">
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">{email}</span>
                </div>
                <button
                    type="button"
                    onClick={onEmailChange}
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
                            onClick={onForgotPassword}
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
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </button>
            </div>
        </form>
    );
};
