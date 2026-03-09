import React from 'react';
import { TrendingUp, Briefcase, LogOut, Settings, Bookmark, Sparkles, FileText, Users, Target, GraduationCap, ShieldCheck, Sun, Moon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useModal } from '../../contexts/ModalContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { ROUTES } from '../../constants';
import { getModeFromViewId } from '../../utils/navigation';

export const Header: React.FC = () => {
    const { user, isLoading, isAdmin, isTester, signOut } = useUser();
    const { openModal } = useModal();
    const { currentView, setView: onViewChange, isDark, toggleDarkMode, isFocusedMode, setFocusedMode, setView } = useGlobalUI();
    const { isCoachMode, isEduMode } = getModeFromViewId(currentView);
    const [scrolled, setScrolled] = React.useState(false);
    const navigate = useNavigate();

    const handleExit = () => {
        setFocusedMode(false);
        if (currentView === 'skills-interview') {
            setView('skills');
            navigate(ROUTES.SKILLS);
        } else if (currentView === 'interviews') {
            navigate(ROUTES.INTERVIEWS);
        } else {
            navigate(-1);
        }
    };

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation Groups
    const navGroups = [
        {
            id: 'job',
            label: 'Jobs',
            icon: Briefcase,
            isActive: !isCoachMode && !isEduMode && !['privacy', 'home', 'admin', 'plans', 'plans-compare', 'settings', 'welcome', 'features', 'terms', 'contact'].includes(currentView),
            defaultView: 'job-home',
            items: [
                { id: 'resumes', label: 'Resume', icon: FileText },
                ...(isAdmin ? [{ id: 'interviews', label: 'Interviews', icon: MessageSquare }] : []),
                { id: 'feed', label: 'Feed', icon: Sparkles },
                { id: 'history', label: 'History', icon: Bookmark },

            ]
        },
        {
            id: 'career',
            label: 'Career',
            icon: TrendingUp,
            isActive: isCoachMode,
            defaultView: 'coach-home',
            items: [
                { id: 'skills', label: 'Skills', icon: Target },
                { id: 'coach-role-models', label: 'Mentors', icon: Users },
            ]
        },
        {
            id: 'edu',
            label: 'Education',
            icon: GraduationCap,
            isActive: isEduMode,
            defaultView: 'edu-home',
            items: [
                { id: 'edu-transcript', label: 'Transcript', icon: GraduationCap },
                { id: 'edu-programs', label: 'Pathfinding', icon: Sparkles }
            ]
        },
        {
            id: 'plans',
            label: 'Upgrade',
            icon: Sparkles,
            isActive: ['plans', 'plans-compare'].includes(currentView),
            defaultView: 'plans',
            items: []
        }
    ].filter(group => {
        if (group.id === 'career' || group.id === 'edu') {
            return isAdmin || isTester;
        }
        return true;
    });


    return (
        <header className={`fixed top-0 left-0 right-0 z-50 h-16 transition-[all] duration-300 ease-in-out border-b ${scrolled || isFocusedMode
            ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-100 dark:border-neutral-800'
            : 'bg-transparent border-transparent'
            }`}>
            {/* Background Background blur/border (Conditional on scroll if needed, but keeping it elegant) */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between relative pointer-events-auto">
                <div className="flex items-center gap-4">
                    <div
                        className="group flex items-center gap-2.5 cursor-pointer"
                        onClick={() => isFocusedMode ? handleExit() : onViewChange('home')}
                    >
                        <div className={`p-1.5 rounded-xl shadow-lg transition-all duration-500 group-hover:scale-105 active:scale-95 ${isCoachMode ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                            isEduMode ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                'bg-indigo-600 text-white shadow-indigo-600/20'
                            }`}>
                            {isFocusedMode ? <ShieldCheck className="w-5 h-5" /> : (isCoachMode ? <Sparkles className="w-5 h-5" /> : isEduMode ? <GraduationCap className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-800 dark:from-white dark:via-neutral-200 dark:to-neutral-400 leading-none">
                                Navigator
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center Navigation - Floating Island Aesthetic */}
                {user && !isLoading && (
                    <motion.nav
                        layout
                        transition={{ layout: { duration: 0.3, type: "spring", bounce: 0 } }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center bg-white/80 dark:bg-neutral-900/80 p-1 rounded-[2.5rem] border border-white/30 dark:border-neutral-800/50 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                    >
                        {isFocusedMode ? (
                            <div className="px-4 py-1 flex items-center gap-2">
                                <div className={`p-1.5 rounded-xl ${currentView === 'skills-interview' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
                                    {currentView === 'skills-interview' ? <Target className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-[11px] font-bold text-neutral-900 dark:text-white leading-none tracking-tight">
                                    {currentView === 'skills-interview' ? 'Skills Assessment' : 'Interview Advisor'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                {navGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="relative flex items-center px-0.5"
                                    >
                                        <AnimatePresence>
                                            {group.isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute inset-0 bg-white/90 dark:bg-neutral-800/90 shadow-sm border border-white/50 dark:border-neutral-700/50 rounded-[2rem] z-0"
                                                    style={{ borderRadius: 32 }}
                                                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                                />
                                            )}
                                        </AnimatePresence>

                                        <div className="relative z-10 flex items-center gap-1">
                                            <button
                                                onClick={() => onViewChange((group as any).defaultView || group.items[0].id as any)}
                                                className={`px-2 py-1.5 rounded-2xl text-[11px] font-bold transition-all duration-300 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${group.isActive
                                                    ? (group.id === 'career' ? 'text-emerald-600' : group.id === 'edu' ? 'text-amber-600' : group.id === 'plans' ? 'text-amber-500' : 'text-indigo-600')
                                                    : (group.id === 'plans' ? 'text-amber-500/80 hover:text-amber-600' : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200')
                                                    } ${group.id === 'plans' ? '!py-1.5 !px-2.5' : ''}`}
                                            >
                                                <group.icon className={`w-3.5 h-3.5 transition-transform duration-300 ${group.isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`} />
                                                <span className="hidden leading-none md:block tracking-wider">{group.label}</span>
                                            </button>

                                            <AnimatePresence mode="popLayout" initial={false}>
                                                {group.isActive && group.items && group.items.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10, width: 0 }}
                                                        animate={{ opacity: 1, x: 0, width: "auto" }}
                                                        exit={{ opacity: 0, x: -10, width: 0 }}
                                                        className="flex items-center gap-0.5 pr-1.5 ml-0.5 border-l border-neutral-100 dark:border-neutral-700/50 pl-2 overflow-hidden"
                                                    >
                                                        {group.items.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => onViewChange(item.id as any)}
                                                                className={`relative px-2 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap tracking-wide overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${currentView === item.id
                                                                    ? (group.id === 'career' ? 'text-emerald-600' : group.id === 'edu' ? 'text-amber-600' : 'text-indigo-600')
                                                                    : 'text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                                                    }`}
                                                            >
                                                                <span className="relative z-10">{item.label}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.nav>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                    {!isLoading && !user ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openModal('AUTH', { authMode: 'sign-in' })}
                                className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all active:scale-95 cursor-pointer"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => openModal('AUTH', { authMode: 'sign-up' })}
                                className="px-4 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                            >
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            {isFocusedMode ? (
                                <button
                                    onClick={handleExit}
                                    className="group flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-neutral-500 dark:text-neutral-400 active:scale-95 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 transition-transform group-hover:rotate-180" />
                                    <span className="tracking-wider">Exit</span>
                                </button>
                            ) : (
                                <button
                                    onClick={signOut}
                                    className="group flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-neutral-500 dark:text-neutral-400 cursor-pointer active:scale-95"
                                >
                                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                    <span className="hidden md:inline tracking-wider">Sign Out</span>
                                </button>
                            )}

                            {user && (
                                <div className={`flex items-center gap-0.5 ${isFocusedMode ? 'invisible pointer-events-none' : ''}`}>
                                    {isAdmin && (
                                        <button
                                            onClick={() => onViewChange('admin')}
                                            className="p-1.5 text-neutral-400 hover:text-indigo-600 dark:text-neutral-500 dark:hover:text-indigo-400 transition-all active:scale-90 cursor-pointer"
                                            title="Admin Console"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleDarkMode}
                                        className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100 transition-all active:scale-90 cursor-pointer"
                                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                    >
                                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => onViewChange('settings')}
                                        className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100 transition-all active:scale-90 cursor-pointer"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
