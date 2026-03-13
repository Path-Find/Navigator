import React, { useRef } from 'react';
import { Users, Sparkles, Upload, FileText, Zap } from 'lucide-react';

interface RoleModelHeroProps {
    onUpload: (files: File[]) => Promise<void>;
    isUploading: boolean;
}

export const RoleModelHero: React.FC<RoleModelHeroProps> = ({
    onUpload,
    isUploading
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onUpload(files);
        }
    };

    return (
        <div className="animate-in zoom-in-95 duration-500 overflow-hidden relative -mt-8 -mx-4 sm:-mx-6 px-4 sm:px-6 py-20 min-h-[calc(100vh-12rem)]">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 -left-24 w-96 h-96 bg-emerald-500/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-teal-500/10 blur-[150px] rounded-full" />

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                    {/* Card 1: Foundation */}
                    <div className="group relative flex flex-col p-8 md:p-10 rounded-[3rem] bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white dark:border-neutral-800 shadow-xl shadow-neutral-200/20 dark:shadow-black/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2">
                        <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                            <FileText className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full space-y-8">
                            <div className="p-4 bg-emerald-600 text-white rounded-[1.5rem] w-fit shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Foundation</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Import LinkedIn profiles to map the exact trajectories of professionals you admire. Our engine distills their career history into actionable data.
                                </p>
                            </div>
                            <ul className="space-y-3 pt-4">
                                {['LinkedIn PDF Import', 'Career Path Mapping', 'Privacy-First Engine'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Card 2: Intelligence */}
                    <div className="group relative flex flex-col p-8 md:p-10 rounded-[3rem] bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white dark:border-neutral-800 shadow-xl shadow-neutral-200/20 dark:shadow-black/50 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2">
                        <div className="absolute top-0 right-0 p-8 text-teal-500/10 group-hover:text-teal-500/20 transition-colors">
                            <Zap className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full space-y-8">
                            <div className="p-4 bg-teal-600 text-white rounded-[1.5rem] w-fit shadow-xl shadow-teal-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Intelligence</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Understand the skills, timing, and transitions that led them to the top. We deconstruct every win to reveal the blueprint for your journey.
                                </p>
                            </div>
                            <ul className="space-y-3 pt-4">
                                {['Skill Sequence Analysis', 'Progression Patterns', 'Experience Benchmarking'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                        <div className="w-1 h-1 rounded-full bg-teal-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Card 3: Upload */}
                    <div className="group relative flex flex-col p-8 md:p-10 rounded-[3rem] bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white dark:border-neutral-800 shadow-xl shadow-neutral-200/20 dark:shadow-black/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 overflow-hidden">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/5 blur-[80px] group-hover:bg-emerald-600/20 transition-all duration-700" />

                        <div className="relative z-10 flex flex-col h-full space-y-8">
                            <div className="p-4 bg-emerald-600 text-white rounded-[1.5rem] w-fit shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-6 h-6" />
                            </div>

                            <h3 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Build Mentors</h3>

                            <div className="space-y-4 pt-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf"
                                    multiple
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full group/btn flex items-center justify-between p-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <div className="text-lg font-black leading-tight">Drop Profiles</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest mt-1 text-emerald-200">LinkedIn PDF</div>
                                    </div>
                                    <Upload className="w-6 h-6 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>

                                <div className="p-6 bg-white dark:bg-neutral-800 rounded-[2rem] border border-neutral-100 dark:border-neutral-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-black text-neutral-900 dark:text-white">Study the Best</div>
                                            <div className="text-[10px] font-bold text-neutral-400">Add unlimited role models</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800/50">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center">
                                    Private & Secure: Personal data is never stored
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
