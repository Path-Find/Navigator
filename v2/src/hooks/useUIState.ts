import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { SavedJob } from '../types';
import { ROUTES, TIME_PERIODS } from '../constants';
import type { UsageLimitResult } from '../services/usageLimits';

export const useUIState = (jobs: SavedJob[]) => {
    const location = useLocation();

    const [activeAnalysisIds, setActiveAnalysisIds] = useState<Set<string>>(new Set());
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importTrigger, setImportTrigger] = useState(0);
    const [nudgeJob, setNudgeJob] = useState<SavedJob | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [interviewSkill, setInterviewSkill] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState<UsageLimitResult | null>(null);

    const currentView = (() => {
        const path = location.pathname;
        if (path === ROUTES.HOME) return 'home';
        // if (path === ROUTES.ANALYZE) return 'job-fit'; // Removed: ROUTES.ANALYZE is undefined
        if (path === ROUTES.HISTORY) return 'history';
        if (path.startsWith('/job/')) return 'job-detail';
        if (path === ROUTES.RESUMES) return 'resumes';
        if (path === ROUTES.SKILLS) return 'skills';
        if (path === ROUTES.PRO_FEED || path === '/feed') return 'pro';
        if (path === ROUTES.ADMIN) return 'admin';
        if (path === ROUTES.COACH_ROLE_MODELS) return 'coach-role-models';
        if (path === ROUTES.COACH_GAP) return 'coach-gap-analysis';
        if (path === ROUTES.COACH_HOME) return 'coach-home';
        if (path.startsWith('/grad')) return 'grad';
        if (path === ROUTES.COVER_LETTERS) return 'cover-letters';
        return 'home';
    })();

    // Nudging logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const now = Date.now();
            const candidates = jobs.filter(job =>
                (now - job.dateAdded) > TIME_PERIODS.NUDGE_THRESHOLD_MS &&
                (job.fitScore || 0) >= 80 &&
                ['saved', 'applied'].includes(job.status || '')
            );
            if (candidates.length > 0 && !sessionStorage.getItem('nudgeSeen')) {
                setNudgeJob(candidates[Math.floor(Math.random() * candidates.length)]);
                sessionStorage.setItem('nudgeSeen', 'true');
            }
        }, TIME_PERIODS.NUDGE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [jobs]);

    return {
        currentView,
        activeAnalysisIds,
        setActiveAnalysisIds,
        isParsingResume,
        setIsParsingResume,
        importError,
        setImportError,
        importTrigger,
        setImportTrigger,
        nudgeJob,
        setNudgeJob,
        showSettings,
        setShowSettings,
        showAuth,
        setShowAuth,
        interviewSkill,
        setInterviewSkill,
        showUpgradeModal,
        setShowUpgradeModal
    };
};
