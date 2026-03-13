import React from 'react';

interface HeroHeaderProps {
    title: string;
    highlight: string;
    highlightGradient?: string;
    subtitle: string | React.ReactNode;
    className?: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
    title,
    highlight,
    highlightGradient = "from-indigo-500 via-purple-500 to-indigo-500",
    subtitle,
    className = ""
}) => {
    return (
        <div className={`text-center mb-10 ${className}`}>
            <h2 className="text-6xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tight mb-12 leading-tight">
                {title} <span className={`text-transparent bg-clip-text animate-gradient-x transition-colors duration-1000 bg-gradient-to-r ${highlightGradient}`} style={{ backgroundSize: '200% auto' }}>{highlight}</span>
            </h2>
            <div className="text-2xl text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-4xl mx-auto mb-16 px-4">
                {subtitle}
            </div>
        </div>
    );
};
