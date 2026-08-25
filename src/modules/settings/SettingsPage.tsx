import React from 'react';
import { Lock, Star, Puzzle, Mail, Activity, ArrowRight, User as UserIcon } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { useJobContext } from '../job/context/JobContext';
import { authClient } from '../../lib/auth-client';
import { Button } from '../../components/ui/Button';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNavigate } from 'react-router';

export const SettingsPage: React.FC = () => {
    const { user, userTier, isTester, isAdmin, simulatedTier, fullName, updateProfile } = useUser();
    const { usageStats } = useJobContext();
    const { showInfo, showError } = useToast();
    const navigate = useNavigate();

    const [nameInput, setNameInput] = React.useState(fullName || '');

    React.useEffect(() => { setNameInput(fullName || ''); }, [fullName]);

    const handleSaveName = () => {
        const trimmed = nameInput.trim();
        if (trimmed !== (fullName || '')) {
            updateProfile({ full_name: trimmed }).catch(() => showError('Failed to save name.'));
        }
    };

    const handleResetPassword = async () => {
        if (user?.email) {
            const { error } = await authClient.resetPasswordForEmail(user.email, {
                redirectTo: window.location.origin + ROUTES.RESET_PASSWORD,
            });
            if (error) {
                showError(error.message);
            } else {
                showInfo("Password reset email sent!");
            }
        }
    };

    return (
        <SharedPageLayout
            maxWidth="6xl"
            spacing="hero"
            className="pb-20"
        >
            <PageHeader
                title="Account"
                highlight="Settings"
                subtitle="Manage your account, plan, and integrations."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Column 1: Account */}
                <div className="bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm">
                    <div className="space-y-8">
                        {/* Identity */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-neutral-500/10 rounded-xl">
                                    <UserIcon className="w-5 h-5 text-neutral-500" />
                                </div>
                                <h4 className="font-bold text-neutral-900 dark:text-white tracking-tight">Account</h4>
                            </div>

                            <div className="flex flex-col gap-1 mb-6">
                                <label className="text-[10px] font-bold text-neutral-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onBlur={handleSaveName}
                                    placeholder="Used to sign your cover letters"
                                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-500/20 focus:border-neutral-500 outline-none transition-all mb-3"
                                />
                                <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                    {user?.email || 'Not Signed In'}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {isAdmin && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                                            Admin
                                        </span>
                                    )}
                                    {isTester && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                                            Early Access
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetPassword}
                                icon={<Lock className="w-3.5 h-3.5" />}
                                className="!px-0 !justify-start !text-neutral-500 hover:!text-neutral-600 dark:hover:!text-neutral-400 transition-colors"
                            >
                                Change Password
                            </Button>
                        </div>

                    </div>
                </div>

                {/* Column 2: Plan & Usage */}
                <div className="bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm">
                    <div className="space-y-8 h-full flex flex-col">
                        {/* Plan */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500/10 rounded-xl">
                                    <Star className="w-5 h-5 text-amber-500" />
                                </div>
                                <h4 className="font-bold text-neutral-900 dark:text-white tracking-tight">Plan</h4>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-neutral-900 dark:text-white capitalize">
                                    {simulatedTier ?
                                        (simulatedTier === 'free' ? 'Explorer' : (simulatedTier === 'plus' ? 'Plus' : 'Pro')) :
                                        (userTier === 'free' ? 'Explorer' : (userTier === 'plus' ? 'Plus' : 'Pro'))
                                    }
                                </span>
                                <span className="text-xs text-neutral-400 mt-1 font-medium">Your current active plan</span>
                            </div>
                        </div>

                        {/* Usage */}
                        <div className="space-y-6 flex-1">
                            <h4 className="font-bold text-xs text-neutral-400 mb-4">Usage</h4>

                            <div className="space-y-5">
                                {/* Jobs Analyzed */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                                Jobs Analyzed {usageStats?.analysisPeriod === 'weekly' ? '(this week)' : usageStats?.analysisPeriod === 'lifetime' ? '(total)' : '(today)'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                            {(usageStats?.analysisPeriod === 'weekly' ? usageStats?.weekAnalyses : usageStats?.analysisPeriod === 'lifetime' ? usageStats?.lifetimeAnalyses : usageStats?.todayAnalyses) || 0} <span className="text-neutral-300 dark:text-neutral-600 font-normal">/ {usageStats?.analysisLimit === Infinity || ((isAdmin || isTester) && !simulatedTier) ? '∞' : usageStats?.analysisLimit || 0}</span>
                                        </span>
                                    </div>

                                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                                            style={{ width: `${(isAdmin || isTester) && !simulatedTier ? 0 : Math.min(100, ((usageStats?.analysisPeriod === 'weekly' ? usageStats?.weekAnalyses : usageStats?.analysisPeriod === 'lifetime' ? usageStats?.lifetimeAnalyses : usageStats?.todayAnalyses) || 0) / (usageStats?.analysisLimit || 1) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {userTier !== 'pro' && !isAdmin && (
                            <div className="pt-8">
                                <Button
                                    variant="premium"
                                    className="w-full shadow-lg shadow-neutral-500/20"
                                    onClick={() => navigate(ROUTES.PLANS)}
                                    icon={<ArrowRight className="w-4 h-4" />}
                                >
                                    Upgrade & View Plans
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Integrations */}
                <div className="bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <Puzzle className="w-5 h-5 text-blue-500" />
                                </div>
                                <h4 className="font-bold text-neutral-900 dark:text-white tracking-tight">Integrations</h4>
                            </div>

                            {/* Row 1: Extension */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Browser Extension</span>
                                    <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-white/5 text-[8px] font-black tracking-wider text-neutral-400 dark:text-neutral-500 rounded-md border border-neutral-200/50 dark:border-white/5 ml-1">Coming soon</span>
                            </div>
                                <p className="text-xs text-neutral-400 leading-relaxed -mt-2">Save jobs from any website with one click. The extension is being updated for Navigator’s current data system.</p>
                            </div>
                        </div>

                        {/* Row 2: Alerts */}
                        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Email Alerts</span>
                                <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-white/5 text-[8px] font-black tracking-wider text-neutral-400 dark:text-neutral-500 rounded-md border border-neutral-200/50 dark:border-white/5 ml-1">
                                    Coming soon
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400 leading-relaxed -mt-2">Forward job alert emails to Navigator when this feature is ready.</p>
                        </div>
                    </div>
                </div>
            </div>

        </SharedPageLayout>
    );
};

export default SettingsPage;
