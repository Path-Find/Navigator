import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle, Calendar } from 'lucide-react';
import type { Course } from '../../types';

interface CourseEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    currentSemIndex: number;
    availableSemesters: { term: string; year: number }[];
    onSave: (updatedCourse: Course, targetSemIndex: number) => void;
    onDelete: () => void;
}

export const CourseEditModal: React.FC<CourseEditModalProps> = ({
    isOpen,
    onClose,
    course,
    currentSemIndex,
    availableSemesters,
    onSave,
    onDelete
}) => {
    const [editedCourse, setEditedCourse] = useState<Course>(course);
    const [targetSemIndex, setTargetSemIndex] = useState<number>(currentSemIndex);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setEditedCourse(course);
                setTargetSemIndex(currentSemIndex);
                setConfirmDelete(false);
            }, 0);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [course, isOpen, onClose, currentSemIndex]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSave = () => {
        onSave(editedCourse, targetSemIndex);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/50">
                    <h3 className="font-black text-lg text-neutral-900 dark:text-white">Edit Course</h3>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Course Code & Title */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 space-y-1">
                            <label className="text-[10px] font-black capitalize tracking-wider text-neutral-500 pl-1">Code</label>
                            <input
                                type="text"
                                value={editedCourse.code}
                                onChange={(e) => setEditedCourse({ ...editedCourse, code: e.target.value })}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-black capitalize tracking-wider text-neutral-500 pl-1">Title</label>
                            <input
                                type="text"
                                value={editedCourse.title}
                                onChange={(e) => setEditedCourse({ ...editedCourse, title: e.target.value })}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Numeric Grade, Credits & Course Term */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black capitalize tracking-wider text-neutral-500 pl-1">Grade</label>
                            <input
                                type="text"
                                value={editedCourse.grade}
                                onChange={(e) => setEditedCourse({ ...editedCourse, grade: e.target.value })}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black capitalize tracking-wider text-neutral-500 pl-1">Credits</label>
                            <input
                                type="number"
                                step="0.5"
                                value={editedCourse.credits || 0.5}
                                onChange={(e) => setEditedCourse({ ...editedCourse, credits: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black capitalize tracking-wider text-neutral-500 pl-1">Course Term</label>
                            <select
                                value={editedCourse.term || ''}
                                onChange={(e) => setEditedCourse({ ...editedCourse, term: e.target.value })}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Default</option>
                                <option value="Fall">Fall</option>
                                <option value="Winter">Winter</option>
                                <option value="Summer">Summer</option>
                                <option value="Spring">Spring</option>
                            </select>
                        </div>
                    </div>

                    {/* Move to Term */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black capitalize tracking-wider text-neutral-500 pl-1">Academic Term</label>
                        <div className="relative">
                            <select
                                value={targetSemIndex}
                                onChange={(e) => setTargetSemIndex(parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                {availableSemesters.map((sem, idx) => (
                                    <option key={idx} value={idx}>
                                        {sem.term} {sem.year}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Delete Warning */}
                    {confirmDelete ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span className="text-xs font-bold text-red-700 dark:text-red-300">Confirm deletion?</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:bg-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-start pt-2">
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="text-xs font-bold text-red-500 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Remove Course
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
