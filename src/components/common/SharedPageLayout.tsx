import React from 'react';

interface SharedPageLayoutProps {
    children: React.ReactNode;
    maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    spacing?: 'hero' | 'compact' | 'none';
    animate?: boolean;
    className?: string;
    heroBackground?: boolean;
}

export const SharedPageLayout: React.FC<SharedPageLayoutProps> = ({
    children,
    maxWidth = '4xl',
    spacing = 'compact',
    animate = true,
    className = "",
    heroBackground = true,
}) => {
    const maxWidthClass = {
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        'full': 'max-w-full'
    }[maxWidth];

    const paddingTopClass = {
        'hero': 'pt-10 md:pt-16',
        'compact': 'pt-8 md:pt-12',
        'none': 'pt-0'
    }[spacing];

    return (
        <div className="relative overflow-hidden">
            {/* Page-wide aurora gradient — picks up current theme accent via CSS var */}
            {heroBackground && (
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
                    {/* Top-left blob */}
                    <div
                        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07] dark:opacity-[0.04] blur-[120px]"
                        style={{ background: 'radial-gradient(circle, rgba(var(--accent-primary), 1) 0%, transparent 70%)' }}
                    />
                    {/* Top-right blob */}
                    <div
                        className="absolute -top-16 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] dark:opacity-[0.03] blur-[100px]"
                        style={{ background: 'radial-gradient(circle, rgba(var(--accent-primary), 1) 0%, transparent 70%)' }}
                    />
                    {/* Subtle mesh grid overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(var(--accent-primary),1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-primary),1) 1px, transparent 1px)',
                            backgroundSize: '64px 64px'
                        }}
                    />
                </div>
            )}
            <div className={`mx-auto px-4 sm:px-6 w-full ${maxWidthClass} ${paddingTopClass} ${animate ? 'animate-in fade-in slide-in-from-bottom-2 duration-700' : ''} ${className}`}>
                {children}
            </div>
        </div>
    );
};
