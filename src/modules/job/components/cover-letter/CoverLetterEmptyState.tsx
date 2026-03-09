import React from 'react';
import { AlertCircle } from 'lucide-react';

export const CoverLetterEmptyState: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 dark:bg-neutral-800/20 rounded-[2.5rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-neutral-300" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">Resume Required</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm text-center mb-10 font-medium leading-relaxed">
                We need your resume to analyze your experience and tailor a high-impact cover letter for this specific role.
            </p>
            <button
                onClick={() => window.location.href = '/resume'}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
                Upload My Resume
            </button>
        </div>
    );
};
