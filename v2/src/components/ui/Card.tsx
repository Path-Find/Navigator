import React from 'react';

interface CardProps {
    variant?: 'premium' | 'glass' | 'flat';
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    glow?: boolean;
    overflow?: 'hidden' | 'visible';
}

export const Card: React.FC<CardProps> = ({
    variant = 'glass',
    children,
    className = "",
    onClick,
    glow = false,
    overflow = 'hidden'
}) => {
    const baseStyles = "relative rounded-[2.5rem] transition-all duration-500 " + (overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible');

    const variants = {
        premium: "card-premium backdrop-blur-xl border border-neutral-200 dark:border-white/10 shadow-2xl shadow-accent-primary/5",
        glass: "bg-white/80 dark:bg-neutral-900/40 backdrop-blur-2xl border border-neutral-200 dark:border-white/5 shadow-xl shadow-black/5",
        flat: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
    };

    const hoverStyles = onClick ? "cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl hover:border-accent-primary/30 transition-all duration-500 active:scale-[0.98]" : "";

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {glow && (
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            )}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
