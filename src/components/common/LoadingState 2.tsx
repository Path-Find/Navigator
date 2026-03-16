import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
    message?: string;
    subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading module...',
    subMessage
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
        >
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full animate-pulse" />
                <div className="relative p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800">
                    <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                    {message}
                </h3>
                {subMessage && (
                    <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 animate-pulse max-w-xs mx-auto">
                        {subMessage}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

