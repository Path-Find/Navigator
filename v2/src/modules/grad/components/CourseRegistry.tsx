import React from 'react';
import { BookOpen, Plus, Trash2, CalendarPlus } from 'lucide-react';
import type { Transcript, Course } from '../../../types';

interface CourseRegistryProps {
    transcript: Transcript;
    setTranscript: (transcript: Transcript | null) => void;
    setEditingCourse: (edit: { semIndex: number; courseIndex: number; course: Course } | null) => void;
    addSemester: () => void;
    addCourse: (semIndex: number) => void;
    deleteSemester: (semIndex: number) => void;
}

export const CourseRegistry: React.FC<CourseRegistryProps> = ({
    transcript,
    setTranscript,
    setEditingCourse,
    addSemester,
    addCourse,
    deleteSemester
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredSemesters = React.useMemo(() => {
        if (!searchQuery.trim()) return transcript.semesters;

        const query = searchQuery.toLowerCase();
        return transcript.semesters.map(sem => ({
            ...sem,
            courses: sem.courses.filter(c =>
                c.title.toLowerCase().includes(query) ||
                c.code.toLowerCase().includes(query) ||
                (c.grade && c.grade.toLowerCase().includes(query))
            )
        })).filter(sem => sem.courses.length > 0 || sem.term.toLowerCase().includes(query));
    }, [transcript.semesters, searchQuery]);

    return (
        <div className="space-y-6" >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-2xl text-neutral-900 dark:text-white tracking-tight leading-none">
                            Transcript
                        </h3>
                        <p className="text-[10px] font-bold text-neutral-400 capitalize tracking-wider mt-1">Official Records</p>
                    </div>
                </div>

                <div className="flex flex-1 max-w-md items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search courses, codes, or grades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={addSemester}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <CalendarPlus className="w-4 h-4" />
                        Add Term
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to reset your entire transcript? This cannot be undone.')) {
                                setTranscript(null);
                            }
                        }}
                        className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-rose-500 font-bold text-xs transition-all"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid gap-8">
                    {filteredSemesters.length > 0 ? (
                        filteredSemesters.map((sem, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-1 border border-neutral-100 dark:border-white/5 shadow-sm group/sem overflow-hidden">
                                {/* Term Header */}
                                <div className="flex justify-between items-center px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover/sem:scale-110 transition-transform duration-500">
                                            <Plus className="w-6 h-6 rotate-45" /> {/* Academic 'Cross' icon placeholder */}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                                                {sem.term === 'FW' ? 'Fall/Winter' : sem.term}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{sem.year}</span>
                                                <span className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                                <span className="text-[10px] font-black text-indigo-500 tracking-wider">{sem.courses.length} Courses</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => addCourse(i)}
                                            className="p-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black tracking-wider border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Course
                                        </button>
                                        <div className="w-px h-6 bg-neutral-100 dark:bg-neutral-800 mx-2" />
                                        <button
                                            onClick={() => deleteSemester(i)}
                                            className="p-2.5 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                                            title="Delete Term"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Courses List */}
                                <div className="px-3 pb-3">
                                    <div className="bg-neutral-50 dark:bg-neutral-950/50 rounded-[2rem] p-3 space-y-2">
                                        {sem.courses.map((c, j) => (
                                            <div
                                                key={j}
                                                onClick={() => setEditingCourse({ semIndex: i, courseIndex: j, course: c })}
                                                className="group/course flex items-center justify-between p-5 bg-white dark:bg-neutral-900 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 dark:hover:border-indigo-900 border border-transparent transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                {/* Hover indicator */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transform -translate-x-full group-hover/course:translate-x-0 transition-transform" />

                                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                                    <div className="flex flex-col items-center justify-center min-w-[80px] py-1 border-r border-neutral-100 dark:border-white/5 pr-4">
                                                        <span className="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg tracking-tight leading-none text-center">
                                                            {c.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <h5 className="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover/course:text-indigo-600 transition-colors">{c.title}</h5>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{c.credits || 3.0} Credits</span>
                                                            {c.term && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{c.term}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    {c.grade ? (
                                                        <div className={`min-w-[48px] h-12 flex items-center justify-center rounded-2xl font-black text-sm shadow-sm transition-all group-hover/course:scale-110 ${['A+', 'A', 'A-'].some(g => c.grade.includes(g))
                                                            ? 'bg-emerald-500 text-white shadow-emerald-500/10'
                                                            : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                            }`}>
                                                            {c.grade}
                                                        </div>
                                                    ) : (
                                                        <div className="min-w-[48px] h-12 flex items-center justify-center rounded-2xl font-black text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-700">
                                                            PLANNED
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {sem.courses.length === 0 && (
                                            <div
                                                onClick={() => addCourse(i)}
                                                className="flex flex-col items-center justify-center py-12 text-neutral-400 hover:text-indigo-500 cursor-pointer transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                                                    <Plus className="w-6 h-6 opacity-30" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">No courses added to this term</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-32 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-white/5 shadow-sm">
                            <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-400 shadow-inner">
                                <BookOpen className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">Your Registry is Empty</h3>
                            <p className="text-neutral-500 text-sm max-w-sm mx-auto font-medium">Search found no matches, or you haven't uploaded your records yet.</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Reset Registry Filter
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
};
