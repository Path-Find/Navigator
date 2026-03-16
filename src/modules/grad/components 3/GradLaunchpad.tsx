import React, { useState } from 'react';
import {
    Rocket,
    CheckCircle2,
    Circle,
    BookOpen,
    PenTool,
    Users,
    Calendar,
    ChevronRight
} from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    icon: React.ReactNode;
}

const INITIAL_TASKS: Task[] = [
    {
        id: 'gre',
        title: 'Academic Proof (GRE/GMAT)',
        description: 'Determine if your target programs require standardized testing and schedule an exam date.',
        status: 'pending',
        icon: <BookOpen className="w-5 h-5" />
    },
    {
        id: 'sop',
        title: 'Narrative (Statement of Purpose)',
        description: 'Draft your personal statement connecting your BA experiences to your Master\'s goals.',
        status: 'in_progress',
        icon: <PenTool className="w-5 h-5" />
    },
    {
        id: 'lor',
        title: 'Social Proof (Letters of Rec)',
        description: 'Identify and reach out to 2-3 professors or managers who can vouch for your capabilities.',
        status: 'pending',
        icon: <Users className="w-5 h-5" />
    }
];

export const GradLaunchpad: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

    const toggleTask = (taskId: string) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
                return { ...t, status: nextStatus };
            }
            return t;
        }));
    };

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const progress = (completedCount / tasks.length) * 100;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-12">

                {/* Left Column: Progress & Timeline */}
                <div className="md:w-1/3 flex flex-col gap-6">
                    <div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 mb-4 shadow-inner">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">Application Launchpad</h3>
                        <p className="text-sm font-medium text-neutral-500">
                            Track your progress toward completing your Master's applications.
                        </p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-3 text-sm font-bold">
                            <span className="text-neutral-700 dark:text-neutral-300">Readiness Score</span>
                            <span className="text-indigo-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 text-indigo-500">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1">Target Intake: Fall 2026</h4>
                                <p className="text-xs font-medium text-indigo-700/70 dark:text-indigo-300">Applications typically open in Sept 2025 and close Dec-Jan.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: The Big 3 Checklist */}
                <div className="md:w-2/3">
                    <h4 className="text-sm font-black text-neutral-400 tracking-widest mb-6">The "Big 3" Requirements</h4>

                    <div className="space-y-4">
                        {tasks.map(task => {
                            const taskClasses = `flex items-start gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${task.status === 'completed'
                                ? 'bg-neutral-50 dark:bg-neutral-800/50 border-transparent opacity-75'
                                : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-indigo-500/30 shadow-sm hover:shadow-md'
                                }`;

                            const buttonClasses = `mt-0.5 shrink-0 transition-colors ${task.status === 'completed' ? 'text-indigo-600' : 'text-neutral-300 hover:text-indigo-500'
                                }`;

                            const iconContainerClasses = `p-1.5 rounded-lg ${task.status === 'completed'
                                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                                : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                                }`;

                            const titleClasses = `font-bold ${task.status === 'completed'
                                ? 'text-neutral-500 line-through'
                                : 'text-neutral-900 dark:text-white'
                                }`;

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={taskClasses}
                                >
                                    <button className={buttonClasses}>
                                        {task.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </button>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={iconContainerClasses}>
                                                {task.icon}
                                            </div>
                                            <h5 className={titleClasses}>
                                                {task.title}
                                            </h5>
                                        </div>
                                        <p className="text-sm font-medium text-neutral-500 ml-9">
                                            {task.description}
                                        </p>
                                    </div>

                                    <div className="shrink-0 self-center text-neutral-300">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
