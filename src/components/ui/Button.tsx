import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'premium' | 'accent' | 'secondary' | 'ghost' | 'outline' | 'subtle';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'accent',
    size = 'md',
    loading,
    icon,
    children,
    className = "",
    disabled,
    ...props
}) => {
    const baseStyles = "relative overflow-hidden transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 font-bold tracking-tight";

    const variants = {
        premium: "btn-premium",
        accent: "bg-neutral-600 text-white shadow-lg shadow-neutral-600/20 hover:shadow-neutral-600/40 hover:-translate-y-0.5",
        secondary: "bg-neutral-100/50 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:-translate-y-0.5",
        subtle: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        ghost: "bg-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800",
        outline: "bg-transparent border-2 border-accent-primary/30 text-accent-primary-hex hover:bg-accent-primary/5"
    };

    const sizes = {
        xs: "px-3 h-7 text-[10px] rounded-full font-bold",
        sm: "px-4 h-9 text-xs rounded-full font-bold",
        md: "px-6 h-11 text-sm rounded-2xl font-bold",
        lg: "px-8 h-14 text-lg rounded-2xl font-bold"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {icon && <span className="shrink-0">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};
