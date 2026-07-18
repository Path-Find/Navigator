import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { authClient, getAccessToken } from '../lib/auth-client';
import { Storage } from '../services/storageService';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { STORAGE_KEYS } from '../constants';
import { LocalStorage } from '../utils/localStorage';
import { invalidateUserIdCache } from '../services/storage/storageCore';
import { useUserPreferences, type UserPreferencesContextType } from './UserPreferencesContext';
import { useToast } from './ToastContext';

import type { UserTier } from '../types';

interface ProfileRow {
    subscription_tier: string | null;
    is_admin: boolean | null;
    is_tester: boolean | null;
    next_gen_enabled: boolean | null;
    journey: string | null;
    device_id: string | null;
    last_archetype_update: number | null;
    accepted_tos_version: number | null;
}

const getTestUser = (): User | null => {
    if (typeof window !== 'undefined' && LocalStorage.get('navigator_test_user')) {
        return { id: 'test-user', email: 'test@example.com' } as unknown as User;
    }
    return null;
};

// api/profile.ts replaces direct supabase.from('profiles') calls — Neon has no
// client-safe direct-Postgres access, so profile reads/writes go through this instead.
async function fetchProfile(): Promise<ProfileRow | null> {
    const token = await getAccessToken();
    if (!token) return null;
    const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const { profile } = await res.json();
    return profile;
}

async function patchProfile(updates: Record<string, unknown>): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Profile update failed' }));
        throw new Error(error);
    }
}

interface UserCoreContextType {
    user: User | null;
    userTier: UserTier;
    actualTier: UserTier;
    isTester: boolean;
    isAdmin: boolean;
    isNextGenEnabled: boolean;
    isLoading: boolean;
    isEmailVerified: boolean;
    signOut: () => Promise<void>;
    setSimulatedTier: (tier: UserTier | null) => void;
    simulatedTier: UserTier | null;
    updateProfile: (updates: Partial<{ first_name: string; last_name: string; device_id: string; journey: string; last_archetype_update: number; accepted_tos_version: number; next_gen_enabled: boolean }>) => Promise<void>;
    refreshUser: () => Promise<void>;
    resendVerificationEmail: () => Promise<{ success: boolean; error?: unknown }>;
}

// Combined type exposed to consumers — keeps useUser() API unchanged
export type UserContextType = UserCoreContextType & UserPreferencesContextType;

const UserContext = createContext<UserCoreContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const prefs = useUserPreferences();
    const { showError } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [actualTier, setActualTier] = useState<UserTier>('free');
    const [simulatedTier, setSimulatedTier] = useState<UserTier | null>(null);
    const [isTester, setIsTester] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isNextGenEnabled, setIsNextGenEnabled] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const userTier = simulatedTier ?? actualTier;

    const processUser = async (currentUser: User | null) => {
        setUser(currentUser);
        setIsEmailVerified(!!currentUser?.email_confirmed_at);

        if (!currentUser) {
            setActualTier('free');
            setIsTester(false);
            setIsAdmin(false);
            setIsNextGenEnabled(false);
            setSimulatedTier(null);
            setIsLoading(false);
            return;
        }

        // Start non-blocking fingerprinting immediately
        (getDeviceFingerprint() as Promise<string>).then(fingerprint => {
            if (currentUser) {
                fetchProfile().then(profile => {
                    if (profile && profile.device_id !== fingerprint) {
                        patchProfile({ device_id: fingerprint }).catch((err: unknown) => console.warn("Fingerprint update failed:", err));
                    }
                }).catch(() => console.warn("Fingerprint profile fetch failed"));
            }
        }).catch((err: unknown) => console.warn("Device fingerprint failed:", err));

        try {
            const profileData = await fetchProfile();

            if (profileData) {
                const tier = (profileData.subscription_tier as UserTier) || 'free';
                setActualTier(profileData.is_admin ? 'admin' : tier);
                setIsAdmin(profileData.is_admin || false);
                setIsTester(profileData.is_tester || false);
                setIsNextGenEnabled(profileData.next_gen_enabled || false);

                // If they have an account, they've implicitly accepted privacy/terms
                LocalStorage.set(STORAGE_KEYS.PRIVACY_ACCEPTED, 'true');

                prefs.applyFromProfile(profileData);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial Session Check
        authClient.getSession().then(({ data: { session } }) => {
            const testUser = getTestUser();
            const targetUser = session?.user ?? testUser;

            if (!targetUser) {
                setIsLoading(false);
                return;
            }

            processUser(targetUser);

            if (!session?.user && testUser) {
                setActualTier((LocalStorage.get('navigator_user_tier') as UserTier) || 'free');
            }
        }).catch(() => {
            setIsLoading(false);
            processUser(null);
        });

        // Auth Change Listener
        const { data: { subscription } } = authClient.onAuthStateChange((_event, session) => {
            invalidateUserIdCache();
            processUser(session?.user ?? getTestUser());
        });

        return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signOut = async () => {
        await Storage.clearAllData();
        const { error } = await authClient.signOut({ scope: 'local' });
        if (error && !error.message?.includes('Auth session missing')) {
            console.error('Sign out failed:', error);
            showError('Sign out failed. Please try again.');
            return;
        }
        window.location.href = '/';
    };

    const updateProfile = async (updates: Partial<{ first_name: string; last_name: string; device_id: string; journey: string; last_archetype_update: number; accepted_tos_version: number; next_gen_enabled: boolean }>) => {
        if (!user) {
            if (updates.journey) prefs.setJourney(updates.journey);
            if (updates.last_archetype_update) prefs.setLastArchetypeUpdate(updates.last_archetype_update);
            if (updates.accepted_tos_version) prefs.setAcceptedTosVersion(updates.accepted_tos_version);
            return;
        }

        // Store current state for rollback
        const oldJourney = prefs.journey;
        const oldLastArchetypeUpdate = prefs.lastArchetypeUpdate;
        const oldAcceptedTosVersion = prefs.acceptedTosVersion;
        const oldNextGenEnabled = isNextGenEnabled;

        // Optimistically update local state
        if (updates.journey) {
            prefs.setJourney(updates.journey);
            // Auto-update archetype timestamp when journey changes
            prefs.setLastArchetypeUpdate(Date.now());
        }
        if (updates.last_archetype_update) prefs.setLastArchetypeUpdate(updates.last_archetype_update);
        if (updates.accepted_tos_version) prefs.setAcceptedTosVersion(updates.accepted_tos_version);
        if (updates.next_gen_enabled !== undefined) setIsNextGenEnabled(updates.next_gen_enabled);

        try {
            await patchProfile(updates);
        } catch (error) {
            console.error("Failed to update profile context. Rolling back.", error);

            // Rollback
            prefs.setJourney(oldJourney);
            prefs.setLastArchetypeUpdate(oldLastArchetypeUpdate);
            prefs.setAcceptedTosVersion(oldAcceptedTosVersion);
            setIsNextGenEnabled(oldNextGenEnabled);

            throw error;
        }
    };

    const resendVerificationEmail = async () => {
        if (!user?.email) return { success: false, error: 'No email found' };
        const { error } = await authClient.resend({
            type: 'signup',
            email: user.email,
        });
        return { success: !error, error };
    };

    const refreshUser = async () => {
        const { data: { user: updatedUser } } = await authClient.getUser();
        if (updatedUser) {
            processUser(updatedUser);
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            userTier,
            actualTier,
            isTester,
            isAdmin,
            isNextGenEnabled,
            isLoading,
            isEmailVerified,
            signOut,
            simulatedTier,
            setSimulatedTier,
            updateProfile,
            refreshUser,
            resendVerificationEmail,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    const prefs = useUserPreferences();
    return { ...context, ...prefs };
};
