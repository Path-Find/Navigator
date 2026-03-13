import { motion } from 'framer-motion';

interface FilterOption<T extends string> {
    id: T;
    label: string;
    count?: number;
    icon?: React.ReactNode;
}

interface StandardFilterGroupProps<T extends string> {
    options: readonly FilterOption<T>[];
    activeFilter: T;
    onSelect: (filter: T) => void;
    themeColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
    className?: string;
}

export function StandardFilterGroup<T extends string>({
    options,
    activeFilter,
    onSelect,
    themeColor = 'indigo',
    className = ""
}: StandardFilterGroupProps<T>) {
    const themes = {
        indigo: {
            active: 'text-white',
            inactive: 'text-neutral-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400',
            pill: 'bg-indigo-600 shadow-lg shadow-indigo-600/20',
            countActive: 'bg-white/20 text-white',
            countInactive: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
        },
        emerald: {
            active: 'text-white',
            inactive: 'text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400',
            pill: 'bg-emerald-600 shadow-lg shadow-emerald-600/20',
            countActive: 'bg-white/20 text-white',
            countInactive: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
        },
        amber: {
            active: 'text-white',
            inactive: 'text-neutral-500 hover:text-amber-600 dark:text-neutral-400 dark:hover:text-amber-400',
            pill: 'bg-amber-600 shadow-lg shadow-amber-600/20',
            countActive: 'bg-white/20 text-white',
            countInactive: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
        },
        rose: {
            active: 'text-white',
            inactive: 'text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400',
            pill: 'bg-rose-600 shadow-lg shadow-rose-600/20',
            countActive: 'bg-white/20 text-white',
            countInactive: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
        },
        slate: {
            active: 'text-neutral-900 dark:text-white',
            inactive: 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
            pill: 'bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700',
            countActive: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
            countInactive: 'bg-neutral-100/50 text-neutral-400'
        }
    };

    const currentTheme = themes[themeColor];

    return (
        <div className={`flex items-center gap-0 p-0 bg-neutral-100/50 dark:bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800 h-10 overflow-x-auto scrollbar-hide no-scrollbar flex-nowrap ${className}`}>
            {options.map((option) => {
                const isActive = activeFilter === option.id;
                return (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`group relative flex items-center justify-center gap-1 px-2.5 h-full rounded-2xl text-xs font-black transition-all duration-300 whitespace-nowrap active:scale-95 leading-none shrink-0 border-none ${isActive ? currentTheme.active : currentTheme.inactive}`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="filter-pill"
                                className={`absolute inset-x-0 inset-y-0 rounded-2xl z-0 ${currentTheme.pill}`}
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1">
                            {option.icon && <span className="shrink-0">{option.icon}</span>}
                            {option.label}
                            {typeof option.count === 'number' && option.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-tighter transition-colors ${isActive ? currentTheme.countActive : currentTheme.countInactive}`}>
                                    {option.count}
                                </span>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
