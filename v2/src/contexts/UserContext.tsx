import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Storage } from '../services/storageService';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { STORAGE_KEYS } from '../constants';
import { LocalStorage } from '../utils/localStorage';
import { invalidateUserIdCache } from '../services/storage/storageCore';
import { useUserPreferences, type UserPreferencesContextType } from './UserPreferencesContext';

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
        getDeviceFingerprint().then(fingerprint => {
            if (currentUser) {
                supabase.from('profiles').select('device_id').eq('id', currentUser.id).single().then(({ data }) => {
                    const profile = data as Pick<ProfileRow, 'device_id'> | null;
                    if (profile && profile.device_id !== fingerprint) {
                        supabase.from('profiles').update({ device_id: fingerprint }).eq('id', currentUser.id).then(({ error }) => {
                            if (error) console.warn("Fingerprint update failed:", error);
                        }).catch((err: unknown) => console.warn("Fingerprint update failed:", err));
                    }
                }).catch((err: unknown) => console.warn("Fingerprint profile fetch failed:", err));
            }
        }).catch((err: unknown) => console.warn("Device fingerprint failed:", err));

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('subscription_tier, is_admin, is_tester, next_gen_enabled, journey, device_id, last_archetype_update, accepted_tos_version')
                .eq('id', currentUser.id)
                .single();

            let profileData = data as ProfileRow | null;

            if (error && error.code === 'PGRST204') {
                // Fallback to absolute basics if schema mismatch
                const basic = await supabase
                    .from('profiles')
                    .select('subscription_tier, is_admin, is_tester')
                    .eq('id', currentUser.id)
                    .single();
                profileData = basic.data as ProfileRow | null;
            }

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
        supabase.auth.getSession().then(({ data: { session } }) => {
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            invalidateUserIdCache();
            processUser(session?.user ?? getTestUser());
        });

        return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signOut = async () => {
        await Storage.clearAllData();
        await supabase.auth.signOut();
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

        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

        if (error) {
            const isGraceful = error.code === 'PGRST204' || error.message?.includes('device_id') || error.message?.includes('journey') || error.message?.includes('last_archetype_update') || error.message?.includes('accepted_tos_version');

            if (isGraceful) {
                console.warn("Profile update partially skipped: some columns might be missing in DB.");
            } else {
                console.error("Failed to update profile context. Rolling back.", error);

                // Rollback
                prefs.setJourney(oldJourney);
                prefs.setLastArchetypeUpdate(oldLastArchetypeUpdate);
                prefs.setAcceptedTosVersion(oldAcceptedTosVersion);
                setIsNextGenEnabled(oldNextGenEnabled);

                throw error;
            }
        }
    };

    const resendVerificationEmail = async () => {
        if (!user?.email) return { success: false, error: 'No email found' };
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: user.email,
        });
        return { success: !error, error };
    };

    const refreshUser = async () => {
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
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
