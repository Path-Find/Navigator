import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants';
import { LocalStorage } from '../utils/localStorage';
import { getViewIdFromPath, type ViewId, getPathFromViewId } from '../utils/navigation';

interface GlobalUIContextType {
    currentView: ViewId;
    showSettings: boolean;
    isDark: boolean;
    isFocusedMode: boolean;

    // Actions
    setView: (view: ViewId) => void;
    setShowSettings: (show: boolean) => void;
    toggleDarkMode: () => void;
    setFocusedMode: (focused: boolean) => void;
}

const GlobalUIContext = createContext<GlobalUIContextType | undefined>(undefined);

export const useGlobalUI = () => {
    const context = useContext(GlobalUIContext);
    if (!context) {
        throw new Error('useGlobalUI must be used within a GlobalUIProvider');
    }
    return context;
};

export const GlobalUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Derive view from URL - No more redundant state!
    const currentView = getViewIdFromPath(location.pathname);

    const [showSettings, setShowSettings] = useState(false);
    const [isFocusedMode, setFocusedMode] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = LocalStorage.get(STORAGE_KEYS.THEME);
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Apply theme to document
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            LocalStorage.set(STORAGE_KEYS.THEME, 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            LocalStorage.set(STORAGE_KEYS.THEME, 'light');
        }
    }, [isDark]);

    const toggleDarkMode = () => setIsDark(prev => !prev);

    // setView now handles navigation automatically
    const setView = (viewId: ViewId) => {
        const path = getPathFromViewId(viewId);
        if (path && path !== location.pathname) {
            navigate(path);
        }
    };

    return (
        <GlobalUIContext.Provider value={{
            currentView,
            showSettings,
            isDark,
            isFocusedMode,
            setView,
            setShowSettings,
            toggleDarkMode,
            setFocusedMode
        }}>
            {children}
        </GlobalUIContext.Provider>
    );
};
