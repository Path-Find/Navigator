import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';

interface SearchableInputProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    label?: string;
    className?: string;
    accentColor?: 'amber' | 'indigo' | 'emerald' | 'blue' | 'rose';
}

export const SearchableInput: React.FC<SearchableInputProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Search...',
    label,
    className = '',
    accentColor = 'amber'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    const themeClasses = {
        amber: {
            focus: 'focus:border-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/30'
        },
        indigo: {
            focus: 'focus:border-indigo-500',
            text: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-100 dark:bg-indigo-900/30'
        },
        emerald: {
            focus: 'focus:border-emerald-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        blue: {
            focus: 'focus:border-blue-500',
            text: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        rose: {
            focus: 'focus:border-rose-500',
            text: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-100 dark:bg-rose-900/30'
        }
    };

    const theme = themeClasses[accentColor];

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset search term to current value if we click outside
                setSearchTerm(value);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    // Update search term when value changes externally
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setSearchTerm(newVal);
        onChange(newVal);
        setIsOpen(true);
    };

    const handleSelectOption = (option: string) => {
        onChange(option);
        setSearchTerm(option);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold text-neutral-400 capitalize tracking-wider ml-1 mb-1 block">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className={`w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold px-4 py-2.5 rounded-xl outline-none transition-colors pr-10 ${theme.focus}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    {isOpen ? <Search size={14} className="animate-pulse" /> : <ChevronDown size={14} />}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (filteredOptions.length > 0 || searchTerm.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto py-2">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectOption(option)}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group"
                                    >
                                        <span className={option === value ? `${theme.text} font-bold` : 'text-neutral-700 dark:text-neutral-300'}>
                                            {option}
                                        </span>
                                        {option === value && <Check size={14} className={theme.text} />}
                                    </button>
                                ))
                            ) : searchTerm.length > 0 ? (
                                <div className="px-4 py-3 text-xs text-neutral-400 italic">
                                    No exact matches found. Press enter to use "{searchTerm}"
                                </div>
                            ) : null}
                        </div>

                        {searchTerm.length > 0 && !options.includes(searchTerm) && (
                            <div className="border-t border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5 px-4 py-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Custom Entry</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
