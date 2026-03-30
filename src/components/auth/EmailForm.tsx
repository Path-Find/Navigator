import React from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import type { FeatureDefinition } from '../../featureRegistry';

interface EmailFormProps {
    email: string;
    setEmail: (email: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    featureContext?: FeatureDefinition;
}

export const EmailForm: React.FC<EmailFormProps> = ({
    email,
    setEmail,
    onSubmit,
    loading,
    featureContext
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2 ml-1">Email</label>
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
    );
};
