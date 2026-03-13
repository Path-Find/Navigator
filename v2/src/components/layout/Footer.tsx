import React from 'react';
import { TrendingUp, Sparkles, Zap, Bookmark, FileText, Users, Target, GraduationCap, Mail, Shield, Scale, MessageSquare } from 'lucide-react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { ROUTES, APP_VERSION } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { type ViewId } from '../../utils/navigation';
import { useUser } from '../../contexts/UserContext';
import { useModal } from '../../contexts/ModalContext';

export const Footer: React.FC = () => {
    const { setView } = useGlobalUI();
    const { user } = useUser();
    const { openModal } = useModal();
    const navigate = useNavigate();

    const handleNavigate = (path: string, viewId: string) => {
        // Public paths that don't require authentication
        const publicPaths = [
            ROUTES.HOME,
            ROUTES.PRIVACY,
            ROUTES.TERMS,
            ROUTES.CONTACT,
            ROUTES.PLANS,
            ROUTES.FEATURES,
            '/terms',
            '/contact',
            '/about'
        ];

        if (!user && !publicPaths.includes(path)) {
            openModal('AUTH');
            return;
        }

        navigate(path);
        setView(viewId as ViewId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    const footerSections = [
        {
            title: 'Jobs',
            items: [
                { label: 'Resume', path: ROUTES.RESUMES, view: 'resumes', icon: FileText },
                { label: 'Interviews', path: ROUTES.INTERVIEWS, view: 'interviews', icon: MessageSquare },
                { label: 'Feed', path: ROUTES.FEED, view: 'feed', icon: Sparkles },
                { label: 'History', path: ROUTES.HISTORY, view: 'history', icon: Bookmark },

            ]
        },
        {
            title: 'Career',
            items: [
                { label: 'Skills', path: ROUTES.SKILLS, view: 'skills', icon: Zap },
                { label: 'Roadmap', path: ROUTES.CAREER_GROWTH, view: 'career-growth', icon: Target },
                { label: 'Mentors', path: ROUTES.CAREER_MODELS, view: 'career-models', icon: Users },
            ]
        },
        {
            title: 'Education',
            items: [
                { label: 'Transcript', path: ROUTES.TRANSCRIPT, view: 'edu-transcript', icon: GraduationCap },
                { label: 'Programs', path: ROUTES.PROGRAM_EXPLORER, view: 'edu-programs', icon: Sparkles },
            ]
        },
        {
            title: 'About',
            items: [
                { label: 'Contact', path: '/contact', view: 'contact', icon: Mail },
                { label: 'Privacy', path: ROUTES.PRIVACY, view: 'privacy', icon: Shield },
                { label: 'Terms', path: '/terms', view: 'terms', icon: Scale },
            ]
        }
    ];

    return (
        <footer className="relative mt-20 pb-12 px-6 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

            <div className="max-w-6xl mx-auto pt-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 space-y-4">
                        <div
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => handleNavigate(ROUTES.HOME, 'home')}
                        >
                            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-black tracking-tight dark:text-white">Navigator</span>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {footerSections.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.items.map((item) => (
                                    <li key={item.label}>
                                        <button
                                            onClick={() => handleNavigate(item.path, item.view)}
                                            className="group flex items-center gap-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                                        >
                                            <item.icon className="w-3.5 h-3.5 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-neutral-100 dark:border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-neutral-400 dark:text-neutral-600">
                    <div className="flex items-center gap-6">
                        <span className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-default">Building For Your Career</span>
                        <div className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <span className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-default">Privacy-First AI</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <p>© {new Date().getFullYear()} Navigator. All Rights Reserved.</p>
                        <div className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <p>System v{APP_VERSION}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
