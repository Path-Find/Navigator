import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface AddSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string) => void;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [newSkillName, setNewSkillName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(newSkillName);
        setNewSkillName('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                        <Zap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Add New Skill</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Skill Name</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Python, GIS, Project Management..."
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 py-4 px-6 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-neutral-500 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            Add & Verify
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
