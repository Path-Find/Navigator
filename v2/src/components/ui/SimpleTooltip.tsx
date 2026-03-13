import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

export const SimpleTooltip = ({ content, children }: { content: string; children: React.ReactNode }) => (
    <Tooltip.Provider>
        <Tooltip.Root delayDuration={200}>
            <Tooltip.Trigger asChild>
                <button className="inline-flex items-center justify-center cursor-help">
                    {children}
                </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    className="z-50 max-w-xs px-3 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-800 rounded-lg shadow-lg border border-white/10 select-none animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                >
                    {content}
                    <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-800" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    </Tooltip.Provider>
);
