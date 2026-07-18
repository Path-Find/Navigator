import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { UserProvider } from './UserContext';
import { ToastProvider } from './ToastContext';
import { authClient } from '../lib/auth-client';

// Mock UserPreferencesContext — UserProvider calls useUserPreferences() at the top level
vi.mock('./UserPreferencesContext', () => ({
    useUserPreferences: vi.fn(() => ({
        journey: 'job-hunter',
        lastArchetypeUpdate: 0,
        acceptedTosVersion: 0,
        dismissedNotices: {},
        dismissNotice: vi.fn(),
        setJourney: vi.fn(),
        setLastArchetypeUpdate: vi.fn(),
        setAcceptedTosVersion: vi.fn(),
        applyFromProfile: vi.fn(),
    })),
    UserPreferencesProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fingerprint — called non-blockingly on sign-in
vi.mock('../utils/fingerprint', () => ({
    getDeviceFingerprint: vi.fn(() => Promise.resolve('test-fingerprint')),
}));

// Mock Neon Auth client
vi.mock('../lib/auth-client', () => ({
    authClient: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    getAccessToken: vi.fn(() => Promise.resolve('test-token')),
}));

// Mock the api/profile.ts fetch call
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('UserContext Security Check', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.clearAllMocks();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it('should NOT log sensitive profile data to the console (Security Regression Test)', async () => {
        const mockUser = { id: 'test-user-id', email: 'test@example.com' };
        const mockProfileData = {
            subscription_tier: 'pro',
            is_admin: true,
            is_tester: false,
            sensitive_info: 'SUPER_SECRET',
        };

        // Mock getSession to return a user
        vi.mocked(authClient.getSession).mockResolvedValue({
            data: { session: { user: mockUser, access_token: 'test-token' } },
            error: null,
        } as any);

        // Mock api/profile.ts GET to return profile data
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ profile: mockProfileData }),
        });

        render(
            <ToastProvider>
                <UserProvider>
                    <div>Test Child</div>
                </UserProvider>
            </ToastProvider>
        );

        // Wait for the async processUser to complete
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/profile', expect.anything());
        });

        // Check if sensitive data was logged
        // The vulnerable code does: console.log('[Auth Debug] SUCCESS - Profile Data:', data);
        const sensitiveLogCall = consoleLogSpy.mock.calls.find((call: any[]) => {
            // Check for specific debug message
            if (call[0] && typeof call[0] === 'string' && call[0].includes('[Auth Debug] SUCCESS - Profile Data:')) {
                return true;
            }
            // Check if the sensitive object itself was logged as any argument
            return call.some((arg: any) => {
                // Direct object match
                if (typeof arg === 'object' && arg !== null) {
                    try {
                        if (JSON.stringify(arg) === JSON.stringify(mockProfileData)) return true;
                        // Check if sensitive info is contained in the stringified object
                        if (JSON.stringify(arg).includes(mockProfileData.sensitive_info)) return true;
                    } catch {
                        // circular reference or other error
                    }
                }
                // String match
                if (typeof arg === 'string' && arg.includes(mockProfileData.sensitive_info)) {
                    return true;
                }
                return false;
            });
        });

        // We expect the sensitive data NOT to be logged
        expect(sensitiveLogCall).toBeUndefined();
    });
});
