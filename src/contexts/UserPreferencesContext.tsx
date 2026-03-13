import React, { createContext, useContext, useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import { LocalStorage } from '../utils/localStorage';

interface ProfilePreferences {
    journey: string | null;
    last_archetype_update: number | null;
    accepted_tos_version: number | null;
}

export interface UserPreferencesContextType {
    journey: string;
    lastArchetypeUpdate: number;
    acceptedTosVersion: number;
    dismissedNotices: Record<string, number>;
    dismissNotice: (id: string, snoozeDays?: number) => void;
    setJourney: (journey: string) => void;
    setLastArchetypeUpdate: (ts: number) => void;
    setAcceptedTosVersion: (v: number) => void;
    applyFromProfile: (data: ProfilePreferences) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [journey, setJourneyState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return LocalStorage.get(STORAGE_KEYS.USER_JOURNEY) || 'job-hunter';
        }
        return 'job-hunter';
    });

    const [lastArchetypeUpdate, setLastArchetypeUpdateState] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            return parseInt(LocalStorage.get(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE) || '0');
        }
        return 0;
    });

    const [acceptedTosVersion, setAcceptedTosVersionState] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            return parseInt(LocalStorage.get(STORAGE_KEYS.ACCEPTED_TOS_VERSION) || '0');
        }
        return 0;
    });

    const [dismissedNotices, setDismissedNotices] = useState<Record<string, number>>(() => {
        if (typeof window !== 'undefined') {
            try {
                return JSON.parse(LocalStorage.get(STORAGE_KEYS.DISMISSED_NOTICES) || '{}');
            } catch {
                return {};
            }
        }
        return {};
    });

    const setJourney = (j: string) => {
        setJourneyState(j);
        LocalStorage.set(STORAGE_KEYS.USER_JOURNEY, j);
    };

    const setLastArchetypeUpdate = (ts: number) => {
        setLastArchetypeUpdateState(ts);
        LocalStorage.set(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE, ts.toString());
    };

    const setAcceptedTosVersion = (v: number) => {
        setAcceptedTosVersionState(v);
        LocalStorage.set(STORAGE_KEYS.ACCEPTED_TOS_VERSION, v.toString());
    };

    const applyFromProfile = (data: ProfilePreferences) => {
        if (data.journey) setJourney(data.journey);
        if (data.last_archetype_update) setLastArchetypeUpdate(data.last_archetype_update);
        if (data.accepted_tos_version) setAcceptedTosVersion(data.accepted_tos_version);
    };

    const dismissNotice = (id: string, snoozeDays: number = 0) => {
        const expiration = snoozeDays > 0 ? Date.now() + snoozeDays * 24 * 60 * 60 * 1000 : Infinity;
        const updated = { ...dismissedNotices, [id]: expiration };
        setDismissedNotices(updated);
        LocalStorage.set(STORAGE_KEYS.DISMISSED_NOTICES, JSON.stringify(updated));
    };

    return (
        <UserPreferencesContext.Provider value={{
            journey,
            lastArchetypeUpdate,
            acceptedTosVersion,
            dismissedNotices,
            dismissNotice,
            setJourney,
            setLastArchetypeUpdate,
            setAcceptedTosVersion,
            applyFromProfile,
        }}>
            {children}
        </UserPreferencesContext.Provider>
    );
};

export const useUserPreferences = () => {
    const context = useContext(UserPreferencesContext);
    if (context === undefined) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
};
