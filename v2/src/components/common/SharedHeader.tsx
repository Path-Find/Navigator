import React from 'react';

interface SharedHeaderProps {
    title: string;
    highlight?: string;
    subtitle?: string | React.ReactNode;
    theme?: 'job' | 'coach' | 'edu';
    className?: string;
    variant?: 'hero' | 'compact';
}

export const SharedHeader: React.FC<SharedHeaderProps> = ({
    title,
    highlight,
    subtitle,
    theme = 'job',
    className = "",
    variant = 'hero'
}) => {
    const gradients = {
        job: "from-emerald-500 via-teal-500 to-emerald-500",
        coach: "from-indigo-500 via-purple-500 to-indigo-500",
        edu: "from-amber-500 via-orange-500 to-amber-500"
    };

    const isHero = variant === 'hero';

    return (
        <div className={`text-center ${isHero ? 'mb-20' : 'mb-12'} ${className}`}>
            <h1 className={`${isHero ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'} font-black text-neutral-900 dark:text-white tracking-tight ${isHero ? 'mb-6' : 'mb-4'} leading-tight`}>
                {title} {highlight && (
                    <span className={`text-transparent bg-clip-text animate-gradient-x bg-gradient-to-r ${gradients[theme]}`} style={{ backgroundSize: '200% auto' }}>
                        {highlight}
                    </span>
                )}
            </h1>
            {subtitle && (
                <div className={`${isHero ? 'text-xl' : 'text-lg'} text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-3xl mx-auto px-4`}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};
