import React from 'react';
import { X, Laptop, Monitor } from 'lucide-react';

interface LinkedInExportStepsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LinkedInExportSteps: React.FC<LinkedInExportStepsProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
                <div className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-neutral-900 dark:text-white leading-tight">Export Guide</h3>
                            <p className="text-[10px] font-black tracking-widest text-neutral-400">Desktop Instructions</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Visual Walkthrough */}
                        <div className="relative aspect-square md:aspect-auto bg-neutral-100 dark:bg-neutral-950 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800">
                            <img
                                src="/Users/ryan/.gemini/antigravity/brain/33e1f844-cafb-4529-a912-f69b0f807d3e/linkedin_save_to_pdf_guide_1771446453075.png"
                                alt="LinkedIn Save to PDF Guide"
                                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                            />
                            {/* Overlay Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-[10px] font-black text-white rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                Quick Tip

                            </div>
                        </div>

                        {/* Step Details */}
                        <div className="p-8 space-y-8 flex flex-col justify-center">
                            <div className="space-y-6">
                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-black text-neutral-500 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">1</div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Visit Profile</h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Open the profile of the person you want to analyze.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-black text-neutral-500 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">2</div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Click "More"</h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Found in the header section next to the "Message" button.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-black text-neutral-500 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">3</div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Save to PDF</h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Select "Save to PDF" to download the structured career journey.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                <div className="flex gap-3">
                                    <Laptop className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                            Desktop version required. LinkedIn's mobile app currently does not support "Save to PDF" functionality.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
