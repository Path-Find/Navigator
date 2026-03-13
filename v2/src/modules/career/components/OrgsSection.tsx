import React, { useState, useMemo } from 'react';
import { X, Plus, Building2 } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../../constants';
import type { ProfessionalOrg } from '../../../types';

const SUGGESTED_ORGS = [
    // Planning & Urban
    'American Institute of Certified Planners (AICP)',
    'American Planning Association (APA)',
    'Canadian Institute of Planners (CIP)',
    'Ontario Professional Planners Institute (OPPI)',
    'Canadian Urban Institute (CUI)',
    'Urban Land Institute (ULI)',
    'Strong Towns',
    // Transportation
    'Institute of Transportation Engineers (ITE)',
    'Young Professionals in Transportation (YPT)',
    'Canadian Urban Transit Association (CUTA)',
    "Women's Transportation Seminar (WTS)",
    // Engineering & Tech
    'IEEE',
    'ACM',
    'Engineers Without Borders',
    // Business & Management
    'Project Management Institute (PMI)',
    'Toastmasters International',
    // Environment
    'Canadian Society for Ecological Economics',
    'Society for Ecological Restoration',
];

export const OrgsSection: React.FC = () => {
    const [orgs, setOrgs] = useLocalStorage<ProfessionalOrg[]>(STORAGE_KEYS.ORGS, []);
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        const existing = new Set(orgs.map(o => o.name.toLowerCase()));
        if (!q) return SUGGESTED_ORGS.filter(s => !existing.has(s.toLowerCase()));
        return SUGGESTED_ORGS.filter(
            s => s.toLowerCase().includes(q) && !existing.has(s.toLowerCase())
        );
    }, [query, orgs]);

    const addOrg = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (orgs.some(o => o.name.toLowerCase() === trimmed.toLowerCase())) return;
        setOrgs([...orgs, { id: crypto.randomUUID(), name: trimmed, addedAt: Date.now() }]);
        setQuery('');
        setShowDropdown(false);
    };

    const removeOrg = (id: string) => {
        setOrgs(orgs.filter(o => o.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            addOrg(query.trim());
        }
        if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    return (
        <>
            <PageHeader
                variant="hero"
                title="Professional Organizations"
                subtitle="Track the associations and communities you're part of."
            />

            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">

                {/* Add field */}
                <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={query}
                                onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search or type an organization name..."
                                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 text-sm"
                            />
                            {showDropdown && suggestions.length > 0 && (
                                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                                    {suggestions.map(s => (
                                        <button
                                            key={s}
                                            onMouseDown={() => addOrg(s)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => addOrg(query)}
                            disabled={!query.trim()}
                            className="px-4 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-2xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Org list */}
                {orgs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-sm px-8">
                        <div className="w-20 h-20 bg-accent-primary/10 rounded-3xl flex items-center justify-center text-accent-primary mx-auto mb-8">
                            <Building2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">No Organizations Yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                            Search above or type a custom name to add professional associations, networks, and communities you belong to.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orgs.map(org => (
                            <div
                                key={org.id}
                                className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-2xl px-5 py-4 border border-neutral-200 dark:border-neutral-800 shadow-sm group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold text-sm shrink-0">
                                        {org.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{org.name}</span>
                                </div>
                                <button
                                    onClick={() => removeOrg(org.id)}
                                    className="text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Remove"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
