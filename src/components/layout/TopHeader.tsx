import React from 'react';
import {
    Settings,
    TrendingUp,
    Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { ROUTES } from '../../constants';
import type { ViewId } from '../../utils/navigation';

export const TopHeader: React.FC = () => {
    const { user } = useUser();
    const { currentView, setView, isFocusedMode } = useGlobalUI();
    const navigate = useNavigate();

    if (isFocusedMode) return null;

    const navItems = [
        { id: 'resumes', label: 'Resumes', path: ROUTES.RESUMES },
        { id: 'feed', label: 'Feed', path: ROUTES.FEED },
    ];

    const handleNavigate = (id: string, path: string) => {
        setView(id as ViewId);
        navigate(path);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-900 h-14">
            <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Brand */}
                <div 
                    onClick={() => handleNavigate('home', ROUTES.HOME)}
                    className="flex items-center gap-3 cursor-pointer group pr-8"
                >
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white group-hover:scale-105 transition-transform">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
                        Navigator
                    </span>
                </div>

                {/* Main Nav */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id, item.path)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    isActive 
                                    ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800/50' 
                                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="flex-1" />

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(ROUTES.JOB_MATCH)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-indigo-600 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => handleNavigate('settings', ROUTES.SETTINGS)}
                        className={`p-2 rounded-lg transition-colors ${
                            currentView === 'settings' 
                            ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800' 
                            : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-neutral-100 dark:bg-neutral-900 mx-1" />

                    <div className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-black">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
