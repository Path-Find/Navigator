import { ArrowRight, Zap, Target, FileSearch } from 'lucide-react';

interface LandingContentProps {
    onShowAuth?: () => void;
}

export const LandingContent = ({ onShowAuth }: LandingContentProps) => {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 pb-32 space-y-32 mt-32">

            {/* 2. How it Works (Steps) - Unified with Bento Cards */}
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { step: 1, title: 'Copy Job Link', desc: 'Find a job on LinkedIn, Indeed, or anywhere. Just copy the URL.', icon: Target, color: 'bg-neutral-100 dark:bg-neutral-800' },
                        { step: 2, title: 'AI Analysis', desc: 'We extract keywords, required skills, and hidden criteria in seconds.', icon: Zap, color: 'bg-indigo-50/50 dark:bg-indigo-500/5' },
                        { step: 3, title: 'Get Tailored', desc: 'Get a tailored cover letter and resume advice that beats the bots.', icon: FileSearch, color: 'bg-emerald-50/50 dark:bg-emerald-500/5' }
                    ].map((s, i) => (
                        <div key={i} className={`group relative ${s.color} backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-2 text-center`}>
                            <div className="absolute top-4 right-8 text-4xl font-black text-neutral-200/50 dark:text-neutral-700/50 select-none">{s.step}</div>
                            <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                <s.icon className={`w-8 h-8 ${s.step === 2 ? 'text-indigo-500' : s.step === 3 ? 'text-emerald-500' : 'text-neutral-400'}`} />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-3">{s.title}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Final Call to Action */}
            <div className="max-w-4xl mx-auto text-center bg-neutral-900 dark:bg-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />

                <div className="relative z-10 space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white dark:text-neutral-900 tracking-tight">
                        Ready to land the interview?
                    </h2>
                    <p className="text-lg text-neutral-400 dark:text-neutral-500 max-w-xl mx-auto">
                        Join other smart candidates who stopped guessing and started getting callbacks.
                    </p>
                    <button
                        onClick={() => onShowAuth?.()}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                    >
                        Analyze Your First Job
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        No credit card required • Free for first 3 scans
                    </p>
                </div>
            </div>
        </div>
    );
};
