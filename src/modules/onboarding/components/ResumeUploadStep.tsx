import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Upload, Loader2 } from 'lucide-react';


export const ResumeUploadStep = ({ tailoredContent, handleDrop, isDragging, setIsDragging, fileInputRef, handleFileUpload, isParsingResume, setStep, handleNext }: any) => {
    return (
        <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xl"
        >
            <div className="card-premium p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="relative text-center mb-10">
                    <h1 className="text-4xl font-black mb-3 text-neutral-900 dark:text-white">
                        {tailoredContent.headline}
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium">
                        Upload your resume to build your profile
                    </p>
                </div>

                <motion.div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative cursor-pointer border-3 border-dashed rounded-[2rem] p-12 mb-8 text-center transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${isDragging
                        ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/20'
                        : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-indigo-300 dark:hover:border-neutral-700'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                    />
                    <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-3xl shadow-xl flex items-center justify-center mb-6 ring-8 ring-indigo-500/5">
                        <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Drop it here</p>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">PDF, DOCX, or TXT</p>

                    {isParsingResume && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                            <p className="font-bold text-neutral-900 dark:text-white">Processing profile...</p>
                        </div>
                    )}
                </motion.div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setStep(1)}
                        className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Skip for now</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
