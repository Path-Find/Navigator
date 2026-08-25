/**
 * Feature Preview Components
 * Shared mini-illustrations used inside BentoCards across all pages.
 *
 * Each preview is a small visual that represents its feature.
 * Both the homepage and features page use the same previews.
 *
 * Optimization: All previews are now lazy-loaded to reduce initial bundle size.
 */
import React, { Suspense, lazy } from 'react';
import type { FeatureColor } from '../../featureRegistry';

// Create a generic Loading placeholder for previews
const PreviewLoading = () => (
    <div className="w-full h-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-100 dark:border-neutral-800 border-t-neutral-500 animate-spin" />
    </div>
);

// Lazy Load Definitions
const JobfitPreview = lazy(() => import('./previews/JobfitPreview'));
const AiSafetyPreview = lazy(() => import('./previews/AiSafetyPreview'));
const ResumeTailoringPreview = lazy(() => import('./previews/ResumeTailoringPreview'));
const KeywordsPreview = lazy(() => import('./previews/KeywordsPreview'));
const ResumesPreview = lazy(() => import('./previews/ResumesPreview'));
const CoverLettersPreview = lazy(() => import('./previews/CoverLettersPreview'));
const QualityLoopPreview = lazy(() => import('./previews/QualityLoopPreview'));
const HistoryPreview = lazy(() => import('./previews/HistoryPreview'));
const FeedPreview = lazy(() => import('./previews/FeedPreview'));
const MailInPreview = lazy(() => import('./previews/MailInPreview'));
const CoachPreview = lazy(() => import('./previews/CoachPreview'));
const RoleModelsPreview = lazy(() => import('./previews/RoleModelsPreview'));
const SkillsInterviewPreview = lazy(() => import('./previews/SkillsInterviewPreview'));
const InterviewAdvisorPreview = lazy(() => import('./previews/InterviewAdvisorPreview'));
const EduPreview = lazy(() => import('./previews/EduPreview'));
const EduTranscriptPreview = lazy(() => import('./previews/EduTranscriptPreview'));
const EduExplorerPreview = lazy(() => import('./previews/EduExplorerPreview'));
const EduGpaPreview = lazy(() => import('./previews/EduGpaPreview'));
const ExtensionPreview = lazy(() => import('./previews/ExtensionPreview'));
const ArchetypeUpdatePreview = lazy(() => import('./previews/ArchetypeUpdatePreview'));
const PolicyUpdatePreview = lazy(() => import('./previews/PolicyUpdatePreview'));
const ResumeInterviewPreview = lazy(() => import('./previews/ResumeInterviewPreview'));
const OrgsPreview = lazy(() => import('./previews/OrgsPreview'));

// ─── Preview Map ───────────────────────────────────────────────────────

const PREVIEW_MAP: Record<string, React.LazyExoticComponent<React.ComponentType<{ color: FeatureColor }>>> = {
    'jobfit': JobfitPreview,
    'ai-safety': AiSafetyPreview,
    'resume-tailoring': ResumeTailoringPreview,
    'keywords': KeywordsPreview,
    'resumes': ResumesPreview,
    'cover_letters': CoverLettersPreview,
    'quality-loop': QualityLoopPreview,
    'history': HistoryPreview,
    'feed': FeedPreview,
    'mail-in': MailInPreview,
    'coach': CoachPreview,
    'role-modeling': RoleModelsPreview,
    'skills-verify': SkillsInterviewPreview,
    'interview-advisor': InterviewAdvisorPreview,
    'edu': EduPreview,
    'edu-transcript': EduTranscriptPreview,
    'edu-explorer': EduExplorerPreview,
    'edu-gpa': EduGpaPreview,
    'extension': ExtensionPreview,
    'resume-interview': ResumeInterviewPreview,
    'orgs': OrgsPreview,
    '_notice_archetype': ArchetypeUpdatePreview,
    '_notice_tos': PolicyUpdatePreview,
};

/**
 * Get the preview component for a feature.
 * Returns null if no preview is defined for the given feature ID.
 */
export const getPreviewComponent = (featureId: string, color: FeatureColor): React.ReactNode => {
    const PreviewComponent = PREVIEW_MAP[featureId];
    if (!PreviewComponent) return null;
    
    return (
        <Suspense fallback={<PreviewLoading />}>
            <PreviewComponent color={color} />
        </Suspense>
    );
};
