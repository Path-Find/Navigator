import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

// Components
import { Header } from './Header';
import { GlobalModals } from './GlobalModals';
import { Footer } from './Footer';
import { LoadingState } from '../common/LoadingState';
import { ToastContainer } from '../common/Toast';

// Contexts
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useToast } from '../../contexts/ToastContext';

// Utils
import { getModeFromViewId } from '../../utils/navigation';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentView, isFocusedMode } = useGlobalUI();
    const location = useLocation();
    const { clearToasts } = useToast();

    // Clear toasts on every route change
    React.useEffect(() => {
        clearToasts();
    }, [location.pathname, clearToasts]);

    const { isCoachMode, isEduMode } = getModeFromViewId(currentView);

    return (
        <div className={`min-h-screen flex flex-col bg-white dark:bg-[#000000] font-sans selection:bg-emerald-500/30 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 ${isCoachMode ? 'theme-coach' : isEduMode ? 'theme-edu' : 'theme-job'}`}>
            <ToastContainer />
            <Analytics />

            <GlobalModals />

            <Header />

            <main className={`flex-1 w-full ${isFocusedMode ? 'pt-0 pb-0' : 'pt-16 pb-16 sm:pb-8'}`}>
                <Suspense fallback={<LoadingState />}>
                    {children}
                </Suspense>
            </main>

            {!isFocusedMode && <Footer />}
        </div>
    );
};
