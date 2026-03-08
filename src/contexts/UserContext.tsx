import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Storage } from '../services/storageService';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { STORAGE_KEYS } from '../constants';
import { LocalStorage } from '../utils/localStorage';
import { invalidateUserIdCache } from '../services/storage/storageCore';

import type { UserTier } from '../types';

const getTestUser = (): User | null => {
    if (typeof window !== 'undefined' && LocalStorage.get('navigator_test_user')) {
        return { id: 'test-user', email: 'test@example.com' } as unknown as User;
    }
    return null;
};

interface UserContextType {
    user: User | null;
    userTier: UserTier;
    actualTier: UserTier; // Real tier from DB
    isTester: boolean;
    isAdmin: boolean;
    isNextGenEnabled: boolean;
    isLoading: boolean;
    signOut: () => Promise<void>;
    setSimulatedTier: (tier: UserTier | null) => void; // Admin-only: simulate viewing as different tier
    simulatedTier: UserTier | null;
    updateProfile: (updates: Partial<{ first_name: string; last_name: string; device_id: string; journey: string; last_archetype_update: number; accepted_tos_version: number; next_gen_enabled: boolean }>) => Promise<void>;
    journey: string; // User's onboarding journey stage (student, job-hunter, etc.)
    lastArchetypeUpdate: number;
    acceptedTosVersion: number;
    dismissedNotices: Record<string, number>;
    dismissNotice: (id: string, snoozeDays?: number) => void;
    isEmailVerified: boolean;
    resendVerificationEmail: () => Promise<{ success: boolean; error?: unknown }>;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [actualTier, setActualTier] = useState<UserTier>('free');
    const [simulatedTier, setSimulatedTier] = useState<UserTier | null>(null);
    const [isTester, setIsTester] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isNextGenEnabled, setIsNextGenEnabled] = useState(false);
    const [journey, setJourney] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return LocalStorage.get(STORAGE_KEYS.USER_JOURNEY) || 'job-hunter';
        }
        return 'job-hunter';
    });
    const [lastArchetypeUpdate, setLastArchetypeUpdate] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            return parseInt(LocalStorage.get(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE) || '0');
        }
        return 0;
    });
    const [acceptedTosVersion, setAcceptedTosVersion] = useState<number>(() => {
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
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // The tier used by the app - simulated if set by admin, otherwise actual
    const userTier = simulatedTier ?? actualTier;

    const processUser = async (currentUser: User | null) => {
        setUser(currentUser);
        setIsEmailVerified(!!currentUser?.email_confirmed_at);
        if (currentUser) {
            try {
                // Fetch profile with resiliency. If one column fails, try fetching basic info.
                const { data, error } = await supabase
                    .from('profiles')
                    .select('subscription_tier, is_admin, is_tester, next_gen_enabled, journey, device_id, last_archetype_update, accepted_tos_version')
                    .eq('id', currentUser.id)
                    .single();

                let profileData: any = data;

                if (error && error.code === 'PGRST204') {
                    // Fallback to absolute basics if schema mismatch
                    const basic = await supabase
                        .from('profiles')
                        .select('subscription_tier, is_admin, is_tester')
                        .eq('id', currentUser.id)
                        .single();
                    profileData = basic.data;
                }

                if (profileData) {
                    const tier = (profileData.subscription_tier as UserTier) || 'free';
                    setActualTier(profileData.is_admin ? 'admin' : tier);
                    setIsAdmin(profileData.is_admin || false);
                    setIsTester(profileData.is_tester || false);
                    setIsNextGenEnabled(profileData.next_gen_enabled || false);

                    // If they have an account, they've implicitly accepted privacy/terms
                    LocalStorage.set(STORAGE_KEYS.PRIVACY_ACCEPTED, 'true');

                    const meta = profileData as any;
                    if (meta.journey) {
                        setJourney(meta.journey);
                        LocalStorage.set(STORAGE_KEYS.USER_JOURNEY, meta.journey);
                    }
                    if (meta.last_archetype_update) {
                        setLastArchetypeUpdate(meta.last_archetype_update);
                        LocalStorage.set(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE, meta.last_archetype_update.toString());
                    }
                    if (meta.accepted_tos_version) {
                        setAcceptedTosVersion(meta.accepted_tos_version);
                        LocalStorage.set(STORAGE_KEYS.ACCEPTED_TOS_VERSION, meta.accepted_tos_version.toString());
                    }

                    // Abuse Prevention: Sync device fingerprint
                    getDeviceFingerprint().then(fingerprint => {
                        if (profileData && (profileData as any).device_id !== fingerprint) {
                            supabase.from('profiles').update({ device_id: fingerprint }).eq('id', currentUser.id).then(({ error: syncError }) => {
                                if (syncError) {
                                    if (syncError.code === 'PGRST204' || syncError.message?.includes('device_id')) {
                                        console.warn("Device fingerprinting skipped: column missing.");
                                    }
                                }
                            });
                        }
                    }).catch(err => console.warn("Device fingerprint failed:", err));
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        } else {
            setActualTier('free');
            setIsTester(false);
            setIsAdmin(false);
            setIsNextGenEnabled(false);
            setSimulatedTier(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            const testUser = getTestUser();
            processUser(session?.user ?? testUser);
            if (!session?.user && testUser) {
                setActualTier((LocalStorage.get('navigator_user_tier') as UserTier) || 'free');
            }
        }).catch(() => processUser(null));

        // Auth Change Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            invalidateUserIdCache();
            processUser(session?.user ?? getTestUser());
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        // 1. Clear physical Storage
        await Storage.clearAllData();

        // 2. Sign out from Supabase
        await supabase.auth.signOut();

        // 3. Force hard reload to homepage to clear React memory
        window.location.href = '/';
    };

    const updateProfile = async (updates: Partial<{ first_name: string; last_name: string; device_id: string; journey: string; last_archetype_update: number; accepted_tos_version: number; next_gen_enabled: boolean }>) => {
        if (!user) {
            // If not logged in, just update local state/storage
            if (updates.journey) {
                setJourney(updates.journey);
                LocalStorage.set(STORAGE_KEYS.USER_JOURNEY, updates.journey);
            }
            if (updates.last_archetype_update) {
                setLastArchetypeUpdate(updates.last_archetype_update);
                LocalStorage.set(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE, updates.last_archetype_update.toString());
            }
            if (updates.accepted_tos_version) {
                setAcceptedTosVersion(updates.accepted_tos_version);
                LocalStorage.set(STORAGE_KEYS.ACCEPTED_TOS_VERSION, updates.accepted_tos_version.toString());
            }
            return;
        }

        // Store current state for rollback
        const oldJourney = journey;
        const oldLastArchetypeUpdate = lastArchetypeUpdate;
        const oldAcceptedTosVersion = acceptedTosVersion;
        const oldNextGenEnabled = isNextGenEnabled;

        // Optimistically update local state for better UX
        if (updates.journey) {
            setJourney(updates.journey);
            LocalStorage.set(STORAGE_KEYS.USER_JOURNEY, updates.journey);

            // Auto-update archetype timestamp when journey is changed
            const now = Date.now();
            setLastArchetypeUpdate(now);
            LocalStorage.set(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE, now.toString());
        }

        if (updates.last_archetype_update) {
            setLastArchetypeUpdate(updates.last_archetype_update);
            LocalStorage.set(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE, updates.last_archetype_update.toString());
        }

        if (updates.accepted_tos_version) {
            setAcceptedTosVersion(updates.accepted_tos_version);
            LocalStorage.set(STORAGE_KEYS.ACCEPTED_TOS_VERSION, updates.accepted_tos_version.toString());
        }

        if (updates.next_gen_enabled !== undefined) {
            setIsNextGenEnabled(updates.next_gen_enabled);
        }

        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

        if (error) {
            // Handle missing column gracefully
            const isGraceful = error.code === 'PGRST204' || error.message?.includes('device_id') || error.message?.includes('journey') || error.message?.includes('last_archetype_update') || error.message?.includes('accepted_tos_version');

            if (isGraceful) {
                console.warn("Profile update partially skipped: some columns might be missing in DB.");
            } else {
                console.error("Failed to update profile context. Rolling back.", error);

                // Rollback local state
                setJourney(oldJourney);
                setLastArchetypeUpdate(oldLastArchetypeUpdate);
                setAcceptedTosVersion(oldAcceptedTosVersion);
                setIsNextGenEnabled(oldNextGenEnabled);

                // Rollback storage
                LocalStorage.set(STORAGE_KEYS.USER_JOURNEY, oldJourney);
                LocalStorage.set(STORAGE_KEYS.LAST_ARCHETYPE_UPDATE, oldLastArchetypeUpdate.toString());
                LocalStorage.set(STORAGE_KEYS.ACCEPTED_TOS_VERSION, oldAcceptedTosVersion.toString());

                throw error; // Re-throw so UI can show error toast
            }
        }
    };

    const dismissNotice = (id: string, snoozeDays: number = 0) => {
        const expiration = snoozeDays > 0 ? Date.now() + snoozeDays * 24 * 60 * 60 * 1000 : Infinity;
        const updated = { ...dismissedNotices, [id]: expiration };
        setDismissedNotices(updated);
        LocalStorage.set(STORAGE_KEYS.DISMISSED_NOTICES, JSON.stringify(updated));
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
            signOut,
            simulatedTier,
            setSimulatedTier,
            updateProfile,
            journey,
            lastArchetypeUpdate,
            acceptedTosVersion,
            dismissedNotices,
            dismissNotice,
            isEmailVerified,
            resendVerificationEmail,
            refreshUser
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
