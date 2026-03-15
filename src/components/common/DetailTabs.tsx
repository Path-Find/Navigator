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
                <div className="flex p-1 bg-white/80 dark:bg-neutral-900/80 rounded-[2rem] border border-neutral-200/40 dark:border-neutral-800/50 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                px-3 py-1.5 rounded-[1.5rem] text-xs font-bold tracking-wide transition-all flex items-center gap-1.5
                                ${activeTab === tab.id
                                    ? `bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm`
                                    : `text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50`
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {actions && (
                    <div className="flex items-center gap-3 p-1 bg-white/80 dark:bg-neutral-900/80 rounded-[2rem] border border-neutral-200/40 dark:border-neutral-800/50 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};
