import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface DetailTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    themeColor?: 'accent' | 'neutral';
    actions?: React.ReactNode;
}

export const DetailTabs: React.FC<DetailTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    actions
}) => {
    return (
        <div className="px-6 pb-4 pt-2 border-b border-neutral-200 dark:border-neutral-800 sticky top-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md z-10">
            <div className="flex items-center justify-between">
                <div className="flex p-1 bg-neutral-100/80 dark:bg-neutral-800/80 rounded-xl w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                px-3 py-1.5 rounded-lg text-sm font-black transition-all flex items-center gap-2
                                ${activeTab === tab.id
                                    ? `bg-white dark:bg-neutral-700 text-accent-primary-hex shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-600`
                                    : `text-neutral-500 hover:text-accent-primary-hex hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50`
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {actions && (
                    <div className="flex items-center gap-3 p-1 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/5">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};
