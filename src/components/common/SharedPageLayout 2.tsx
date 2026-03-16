import React from 'react';

interface SharedPageLayoutProps {
    children: React.ReactNode;
    maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    spacing?: 'hero' | 'compact' | 'none';
    animate?: boolean;
    className?: string;
}

export const SharedPageLayout: React.FC<SharedPageLayoutProps> = ({
    children,
    maxWidth = '4xl',
    spacing = 'compact',
    animate = true,
    className = ""
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
        <div className={`mx-auto px-4 sm:px-6 w-full ${maxWidthClass} ${paddingTopClass} ${animate ? 'animate-in fade-in slide-in-from-bottom-2 duration-700' : ''} ${className}`}>
            {children}
        </div>
    );
};
