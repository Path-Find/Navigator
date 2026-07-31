import React, { useState } from 'react';
import { authClient } from '../lib/auth-client';
import { X } from 'lucide-react';
import { getUserFriendlyError } from '../utils/errorMessages';
import { ROUTES } from '../constants';
import type { FeatureDefinition } from '../featureRegistry';

// Extracted components
import { FeatureSidebar } from './auth/FeatureSidebar';
import { EmailForm } from './auth/EmailForm';
import { PasswordForm } from './auth/PasswordForm';
import { WaitlistForm } from './auth/WaitlistForm';
import { SuccessState } from './auth/SuccessState';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureContext?: FeatureDefinition;
    authMode?: 'sign-in' | 'sign-up';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, featureContext, authMode }) => {
    // State management
    const [step, setStep] = useState(0); // 0: Email, 1: Password/Invite
    const [isSignUp, setIsSignUp] = useState(false);
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [waitlistSuccess, setWaitlistSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Lifecycle
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            // Reset state on close
            setStep(0);
            setEmail('');
            setPassword('');
            setSuccessMessage(null);
            setError(null);
            setShowWaitlist(false);
            setWaitlistSuccess(false);
            setWaitlistLoading(false);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Handlers
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const checkRes = await fetch('/api/check-user-exists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
            });
            const { exists } = checkRes.ok ? await checkRes.json() : { exists: true };

            if (exists === false) {
                setShowWaitlist(true);
            } else {
                setIsSignUp(false);
                setStep(1);
            }
        } catch (err: unknown) {
            setError(getUserFriendlyError(err instanceof Error ? err : new Error(String(err))));
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await authClient.signUp({ email, password });
                if (error) throw error;
                setSuccessMessage("Account created! Please check your email to confirm.");
            } else {
                const { error } = await authClient.signInWithPassword({ email, password });
                if (error) throw error;
                await import('../services/storageService').then(m => m.Storage.syncLocalToCloud());
                onClose();
            }
        } catch (err: unknown) {
            setError(getUserFriendlyError(err instanceof Error ? err : new Error(String(err))));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email first.');
            return;
        }
        setResetLoading(true);
        setError(null);

        try {
            const { error: resetError } = await authClient.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
            });
            if (resetError) throw resetError;
            setSuccessMessage('Password reset link sent! Check your inbox.');
        } catch (err: unknown) {
            setError(getUserFriendlyError(err instanceof Error ? err : new Error(String(err))));
        } finally {
            setResetLoading(false);
        }
    };

    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        setWaitlistLoading(true);
        setError(null);

        try {
            const { WaitlistService } = await import('../services/waitlistService');
            const result = await WaitlistService.joinWaitlist(email, featureContext ? `feature_${featureContext.id}` : 'auth_modal');
            if (result.success) setWaitlistSuccess(true);
            else setError(result.error || 'Failed to join waitlist.');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setWaitlistLoading(false);
        }
    };

    const getHeading = () => {
        if (successMessage) return 'Success';
        if (step === 0) return authMode === 'sign-in' ? 'Sign In' : authMode === 'sign-up' ? 'Join Waitlist' : 'Get Started';
        return isSignUp ? 'Create Account' : 'Welcome Back';
    };

    const renderFormContent = () => {
        if (successMessage) return <SuccessState message={successMessage} onClose={onClose} />;
        
        if (step === 0) {
            return (
                <EmailForm 
                    email={email} 
                    setEmail={setEmail} 
                    onSubmit={handleEmailSubmit} 
                    loading={loading} 
                    featureContext={featureContext}
                />
            );
        }

        if (showWaitlist) {
            return (
                <WaitlistForm 
                    email={email}
                    onEmailChange={() => setShowWaitlist(false)}
                    onSubmit={handleJoinWaitlist}
                    loading={waitlistLoading}
                    success={waitlistSuccess}
                    error={error}
                    onClose={onClose}
                />
            );
        }

        return (
            <PasswordForm 
                email={email}
                onEmailChange={() => setStep(0)}
                onSubmit={handleAuthSubmit}
                password={password}
                setPassword={setPassword}
                isSignUp={isSignUp}
                loading={loading}
                error={error}
                onForgotPassword={handleForgotPassword}
                resetLoading={resetLoading}
            />
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={`bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-neutral-900/5 dark:ring-white/10 ${featureContext ? 'max-w-3xl' : 'max-w-md'}`}>
                <div className="flex items-stretch">
                    {featureContext && (
                        <div className="w-[45%]">
                            <FeatureSidebar featureContext={featureContext} />
                        </div>
                    )}
                    <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="px-8 py-6 border-b border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-900/20 dark:to-violet-900/20">
                            <h3 className="font-bold text-xl text-neutral-900 dark:text-white tracking-tight">
                                {getHeading()}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col justify-center p-8">
                            {renderFormContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
