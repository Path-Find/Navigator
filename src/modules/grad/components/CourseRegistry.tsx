import React from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { Transcript, Course } from '../../../types';

interface CourseRegistryProps {
    transcript: Transcript;
    setEditingCourse: (edit: { semIndex: number; courseIndex: number; course: Course } | null) => void;
    addSemester: () => void;
    addCourse: (semIndex: number) => void;
    deleteSemester: (semIndex: number) => void;
}

export const CourseRegistry: React.FC<CourseRegistryProps> = ({
    transcript,
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
                    <div className="w-10 h-10 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-2xl text-neutral-900 dark:text-white tracking-tight leading-none">
                            Transcript
                        </h3>
                    </div>
                </div>

                <div className="flex flex-1 max-w-md items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search courses, codes, or grades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={addSemester}
                        variant="subtle"
                        size="xs"
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Add Term
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid gap-8">
                    {filteredSemesters.length > 0 ? (
                        filteredSemesters.map((sem, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-1 border border-neutral-100 dark:border-white/5 shadow-sm group/sem overflow-hidden">
                                {/* Term Header */}
                                <div className="flex justify-between items-center px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h4 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
                                                {sem.term} <span className="text-sm font-medium text-neutral-400">{sem.year}</span>
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-medium text-amber-500">{sem.courses.length} Courses</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => addCourse(i)}
                                            variant="subtle"
                                            size="sm"
                                            icon={<Plus className="w-3.5 h-3.5" />}
                                        >
                                            Add
                                        </Button>
                                        <div className="w-px h-4 bg-neutral-100 dark:bg-neutral-800 mx-1" />
                                        <Button
                                            onClick={() => deleteSemester(i)}
                                            variant="subtle"
                                            size="sm"
                                            className="text-neutral-400 hover:text-rose-500"
                                            icon={<Trash2 className="w-3.5 h-3.5" />}
                                        />
                                    </div>
                                </div>

                                {/* Courses List */}
                                <div className="px-2 pb-2">
                                    <div className="bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl p-2 space-y-1">
                                        {sem.courses.map((c, j) => (
                                            <div
                                                key={j}
                                                onClick={() => setEditingCourse({ semIndex: i, courseIndex: j, course: c })}
                                                className="group/course flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-xl hover:shadow-sm hover:border-amber-100 dark:hover:border-amber-900 border border-transparent transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                {/* Hover indicator */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 transform -translate-x-full group-hover/course:translate-x-0 transition-transform" />

                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="flex flex-col items-center justify-center min-w-[60px] py-1 border-r border-neutral-100 dark:border-white/5 pr-3">
                                                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                                                            {c.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <h5 className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover/course:text-neutral-600 transition-colors">{c.title}</h5>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-medium text-neutral-400">{c.credits || 3.0} Credits</span>
                                                            {c.term && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                                                    <span className="text-[10px] font-bold text-amber-500">{c.term}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {c.grade ? (
                                                        <div className={`min-w-[36px] h-8 flex items-center justify-center rounded-lg font-bold text-xs shadow-sm transition-all group-hover/course:scale-110 ${['A+', 'A', 'A-'].some(g => c.grade.includes(g))
                                                            ? 'bg-emerald-500 text-white shadow-emerald-500/10'
                                                            : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                            }`}>
                                                            {c.grade}
                                                        </div>
                                                    ) : (
                                                        <div className="min-w-[36px] h-8 px-2 flex items-center justify-center rounded-lg font-medium text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-700">
                                                            Planned
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {sem.courses.length === 0 && (
                                            <div
                                                onClick={() => addCourse(i)}
                                                className="flex flex-col items-center justify-center py-6 text-neutral-400 hover:text-neutral-500 cursor-pointer transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2">
                                                    <Plus className="w-4 h-4 opacity-30" />
                                                </div>
                                                <span className="text-[10px] font-medium text-neutral-400">No courses added to this term</span>
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
                                className="mt-8 px-6 py-3 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-black dark:hover:bg-neutral-700 transition-all shadow-lg"
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
