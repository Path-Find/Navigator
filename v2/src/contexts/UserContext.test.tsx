import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { UserProvider } from './UserContext';
import { supabase } from '../services/supabase';

// Mock Supabase
vi.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        from: vi.fn(),
    },
}));

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
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null,
        } as any);

        // Mock database query to return profile data
        const mockFrom = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: mockProfileData,
                        error: null,
                    }),
                }),
            }),
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    then: vi.fn().mockImplementation((cb) => cb({ error: null }))
                }),
            }),
        });
        vi.mocked(supabase.from).mockImplementation(mockFrom);

        render(
            <UserProvider>
                <div>Test Child</div>
            </UserProvider>
        );

        // Wait for the async processUser to complete
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('profiles');
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
