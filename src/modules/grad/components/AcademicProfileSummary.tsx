import React from 'react';
import type { Transcript } from '../../../types';
import { SearchableInput } from '../../../components/ui/SearchableInput';
import { UNIVERSITIES, PROGRAMS, CREDENTIAL_TYPES } from '../data/academicConstants';

interface AcademicProfileSummaryProps {
    transcript: Transcript;
    targetCredits: number;
    setTargetCredits: (credits: number) => void;
    totalCredits: number;
    progressPercentage: number;
    gpa?: string;
    onUpdateTranscript?: (updates: Partial<Transcript>) => void;
}

export const AcademicProfileSummary: React.FC<AcademicProfileSummaryProps> = ({
    transcript,
    targetCredits,
    setTargetCredits,
    totalCredits,
    progressPercentage,
    gpa,
    onUpdateTranscript
}) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editedUniversity, setEditedUniversity] = React.useState(transcript.university || '');
    const [editedProgram, setEditedProgram] = React.useState(transcript.program || '');
    const [editedCredential, setEditedCredential] = React.useState(transcript.credentialType || '');

    const handleSave = () => {
        onUpdateTranscript?.({
            university: editedUniversity,
            program: editedProgram,
            credentialType: editedCredential
        });
        setIsEditing(false);
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            {/* Profile Card */}
            <div className="md:col-span-12 lg:col-span-5 bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-200 dark:border-white/5 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:border-amber-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-colors duration-1000" />

                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 transform group-hover:scale-110 transition-transform duration-500">
                            <span className="text-2xl font-black">{transcript.studentName?.charAt(0) || transcript.university?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Academic Profile</div>
                            <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                                {transcript.studentName || 'Student Name'}
                            </h2>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 bg-neutral-50 dark:bg-white/5 p-6 rounded-2xl border border-neutral-200 dark:border-white/5">
                            <SearchableInput
                                label="University"
                                value={editedUniversity}
                                onChange={setEditedUniversity}
                                options={UNIVERSITIES}
                                placeholder="University Name"
                                accentColor="amber"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SearchableInput
                                    label="Credential"
                                    value={editedCredential}
                                    onChange={setEditedCredential}
                                    options={CREDENTIAL_TYPES}
                                    placeholder="e.g. Bachelor's Degree"
                                    accentColor="amber"
                                />
                                <SearchableInput
                                    label="Program"
                                    value={editedProgram}
                                    onChange={setEditedProgram}
                                    options={PROGRAMS}
                                    placeholder="Program Name"
                                    accentColor="amber"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]"
                                >
                                    Save Profile
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-300 dark:hover:bg-neutral-750 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="group/edit relative flex flex-col gap-1 cursor-pointer"
                            onClick={() => {
                                setEditedUniversity(transcript.university || '');
                                setEditedProgram(transcript.program || '');
                                setEditedCredential(transcript.credentialType || '');
                                setIsEditing(true);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-neutral-900 dark:text-white text-lg font-bold">{transcript.university || 'Add University'}</span>
                                <div className="opacity-0 group-hover/edit:opacity-100 transition-opacity">
                                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Edit</div>
                                </div>
                            </div>
                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                                {transcript.credentialType ? `${transcript.credentialType} in ` : ''}
                                {transcript.program || 'Add Program'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* GPA Card */}
            <div className="md:col-span-6 lg:col-span-3 bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-xl hover:border-amber-500/20 transition-all duration-500">
                <div className="text-[10px] font-black capitalize tracking-wider text-neutral-400 mb-6">Calculated GPA</div>

                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-100 dark:text-neutral-800" />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-amber-500 transition-all duration-1000 ease-out"
                            strokeDasharray={351.86}
                            strokeDashoffset={351.86 - (351.86 * (parseFloat(String(gpa || transcript.cgpa || '0')) / 4.0))}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl font-black text-neutral-900 dark:text-white font-mono leading-none tracking-tighter">
                            {gpa || transcript.cgpa || '0.00'}
                        </div>
                        <div className="text-[10px] font-bold text-neutral-400 mt-1 capitalize tracking-wider">/ 4.00</div>
                    </div>
                </div>
            </div>

            {/* Progress Card */}
            <div className="md:col-span-6 lg:col-span-4 bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-200 dark:border-white/5 shadow-sm flex flex-col group hover:shadow-xl hover:border-amber-500/20 transition-all duration-500">
                <div className="text-[10px] font-black capitalize tracking-wider text-neutral-400 mb-8">Degree Completion</div>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-5xl font-black text-neutral-900 dark:text-white font-mono tracking-tighter tabular-nums">
                            {Math.round(totalCredits * 10) / 10}
                        </span>
                        <span className="text-xl font-bold text-neutral-300">/</span>
                        <div className="flex flex-col">
                            <input
                                type="number"
                                value={targetCredits === 0 ? '' : targetCredits}
                                onChange={(e) => setTargetCredits(e.target.value ? parseFloat(e.target.value) : 0)}
                                placeholder="Edit"
                                className="w-20 bg-neutral-50 dark:bg-neutral-800/50 text-xl text-neutral-900 dark:text-white font-black border-none focus:ring-0 outline-none p-0 transition-colors font-mono leading-none"
                            />
                            <span className="text-[8px] font-black capitalize tracking-wider text-neutral-400 mt-1 ml-0.5">Target Credits</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-200/50 dark:border-white/5 p-1 flex items-center">
                            <div
                                className="h-2 bg-amber-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${progressPercentage >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {progressPercentage >= 100 ? 'Degree Completed' : 'Coursework In Progress'}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-neutral-400 font-mono italic">{Math.round(progressPercentage)}% Complete</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
