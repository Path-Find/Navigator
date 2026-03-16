import React, { useState } from 'react';
import { X, Check, Save, Trash2, Plus } from 'lucide-react';
import type { Transcript, Course } from '../../types';
import { SearchableInput } from '../ui/SearchableInput';
import { UNIVERSITIES, PROGRAMS, CREDENTIAL_TYPES } from '../../modules/grad/data/academicConstants';

interface CourseVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    transcript: Transcript;
    onSave: (updatedTranscript: Transcript) => void;
}

export const CourseVerificationModal: React.FC<CourseVerificationModalProps> = ({
    isOpen,
    onClose,
    transcript,
    onSave
}) => {
    const [editableTranscript, setEditableTranscript] = useState<Transcript>({ ...transcript });

    if (!isOpen) return null;

    const handleCourseChange = (semIndex: number, courseIndex: number, field: keyof Course, value: string | number) => {
        const newSemesters = [...editableTranscript.semesters];
        const newCourses = [...newSemesters[semIndex].courses];
        newCourses[courseIndex] = { ...newCourses[courseIndex], [field]: value };
        newSemesters[semIndex] = { ...newSemesters[semIndex], courses: newCourses };
        setEditableTranscript({ ...editableTranscript, semesters: newSemesters });
    };

    const addCourse = (semIndex: number) => {
        const newSemesters = [...editableTranscript.semesters];
        newSemesters[semIndex].courses.push({
            code: '',
            title: 'New Course',
            grade: '',
            credits: 0.5
        });
        setEditableTranscript({ ...editableTranscript, semesters: newSemesters });
    };

    const removeCourse = (semIndex: number, courseIndex: number) => {
        const newSemesters = [...editableTranscript.semesters];
        newSemesters[semIndex].courses.splice(courseIndex, 1);
        setEditableTranscript({ ...editableTranscript, semesters: newSemesters });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Check className="w-6 h-6 text-emerald-500" />
                            Verify
                        </h2>
                        <p className="text-sm text-neutral-500 mt-1">Please confirm accuracy.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-neutral-50/30 dark:bg-neutral-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all hover:shadow-md">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight block mb-2">Student Name</label>
                            <input
                                type="text"
                                value={editableTranscript.studentName || ''}
                                onChange={(e) => setEditableTranscript({ ...editableTranscript, studentName: e.target.value })}
                                className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-indigo-500 p-1 text-sm font-semibold focus:ring-0 transition-colors"
                                placeholder="Student Name"
                            />
                        </div>
                        <SearchableInput
                            label="University"
                            value={editableTranscript.university || ''}
                            onChange={(val) => setEditableTranscript({ ...editableTranscript, university: val })}
                            options={UNIVERSITIES}
                            placeholder="University Name"
                            className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all hover:shadow-md h-full"
                            accentColor="indigo"
                        />
                        <SearchableInput
                            label="Credential"
                            value={editableTranscript.credentialType || ''}
                            onChange={(val) => setEditableTranscript({ ...editableTranscript, credentialType: val })}
                            options={CREDENTIAL_TYPES}
                            placeholder="e.g. Bachelor's Degree"
                            className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all hover:shadow-md h-full"
                            accentColor="indigo"
                        />
                        <SearchableInput
                            label="Program"
                            value={editableTranscript.program || ''}
                            onChange={(val) => setEditableTranscript({ ...editableTranscript, program: val })}
                            options={PROGRAMS}
                            placeholder="Program Name"
                            className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all hover:shadow-md h-full"
                            accentColor="indigo"
                        />
                    </div>

                    {editableTranscript.semesters.map((sem, sIdx) => (
                        <div key={sIdx} className="space-y-4 bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
                                <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-lg">{sem.term} {sem.year}</h3>
                                <button
                                    onClick={() => addCourse(sIdx)}
                                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Course
                                </button>
                            </div>

                            <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-neutral-400 capitalize tracking-tight px-3">
                                <div className="col-span-2">Code</div>
                                <div className="col-span-6">Title</div>
                                <div className="col-span-2 text-center">Grade</div>
                                <div className="col-span-1 text-center">Cred</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="space-y-2">
                                {sem.courses.map((course, cIdx) => (
                                    <div key={cIdx} className="grid grid-cols-12 gap-4 items-center bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 group transition-all">
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                value={course.code}
                                                onChange={(e) => handleCourseChange(sIdx, cIdx, 'code', e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Code"
                                            />
                                        </div>
                                        <div className="col-span-6">
                                            <input
                                                type="text"
                                                value={course.title}
                                                onChange={(e) => handleCourseChange(sIdx, cIdx, 'title', e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Course Title"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                value={course.grade}
                                                onChange={(e) => handleCourseChange(sIdx, cIdx, 'grade', e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs font-bold text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                                placeholder="-"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={course.credits}
                                                onChange={(e) => handleCourseChange(sIdx, cIdx, 'credits', parseFloat(e.target.value))}
                                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                onClick={() => removeCourse(sIdx, cIdx)}
                                                className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end bg-neutral-50/50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { onSave(editableTranscript); onClose(); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
