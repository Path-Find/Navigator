import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalDragOverlayProps {
    onDrop: (files: File[]) => void;
}

export const GlobalDragOverlay: React.FC<GlobalDragOverlayProps> = ({
    onDrop
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            setDragCounter(prev => prev + 1);
            if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            setDragCounter(prev => prev - 1);
            if (dragCounter <= 1) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            setDragCounter(0);

            const files = Array.from(e.dataTransfer?.files || []);
            if (files.length > 0) {
                onDrop(files);
            }
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [dragCounter, onDrop]);

    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-indigo-600/90 dark:bg-indigo-900/95 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="max-w-xl w-full aspect-video rounded-[3rem] border-4 border-dashed border-white/40 flex flex-col items-center justify-center text-white space-y-8"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-white/20"
                            >
                                <Upload className="w-12 h-12 text-indigo-600" />
                            </motion.div>
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-4 -right-4"
                            >
                                <Sparkles className="w-8 h-8 text-amber-300" />
                            </motion.div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tight">Drop to Analyze</h2>
                            <p className="text-indigo-100 font-bold tracking-wide flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" />
                                Support for PDF Resume & Transcripts
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
