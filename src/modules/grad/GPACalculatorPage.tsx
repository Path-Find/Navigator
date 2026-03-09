import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { ROUTES } from '../../constants';
import { PageHeader } from '../../components/ui/PageHeader';
import { GPACalculator } from './GPACalculator';
import { useCoachContext } from '../career/context/CoachContext';

export const GPACalculatorPage: React.FC = () => {
    const navigate = useNavigate();
    const { transcript } = useCoachContext();

    return (
        <SharedPageLayout maxWidth="full" className="relative theme-edu" spacing="compact">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <PageHeader
                    variant="hero"
                    title="GPA Calculator"
                    subtitle="Calculate your current GPA and forecast future performance scenarios."
                    onBack={() => navigate(ROUTES.EDUCATION_HOME)}
                    className="mb-8"
                />

                {transcript ? (
                    <GPACalculator transcript={transcript} />
                ) : (
                    <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No Transcript Found</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-6">Please upload your transcript to use the GPA Calculator.</p>
                        <Link
                            to={ROUTES.TRANSCRIPT}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Upload Transcript
                        </Link>
                    </div>
                )}
            </div>
        </SharedPageLayout>
    );
};
