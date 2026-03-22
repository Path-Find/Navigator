import { describe, it, expect } from 'vitest';
import { getViewIdFromPath, getPathFromViewId, getModeFromViewId } from './navigation';
import { ROUTES } from '../constants';

describe('getViewIdFromPath', () => {
    it('maps known static routes to their view IDs', () => {
        expect(getViewIdFromPath(ROUTES.HOME)).toBe('home');
        expect(getViewIdFromPath(ROUTES.HISTORY)).toBe('history');
        expect(getViewIdFromPath(ROUTES.RESUMES)).toBe('resumes');
        expect(getViewIdFromPath(ROUTES.CAREER_HOME)).toBe('coach-home');
        expect(getViewIdFromPath(ROUTES.EDUCATION_HOME)).toBe('edu-home');
        expect(getViewIdFromPath(ROUTES.PLANS)).toBe('plans');
        expect(getViewIdFromPath(ROUTES.SETTINGS)).toBe('settings');
    });

    it('maps dynamic job detail routes', () => {
        expect(getViewIdFromPath('/jobs/match/abc-123')).toBe('job-detail');
        expect(getViewIdFromPath('/jobs/match/some-other-id')).toBe('job-detail');
    });

    it('maps /resume-for/ prefix to home', () => {
        expect(getViewIdFromPath('/resume-for/software-engineer')).toBe('home');
    });

    it('returns home for unknown paths', () => {
        expect(getViewIdFromPath('/does-not-exist')).toBe('home');
        expect(getViewIdFromPath('')).toBe('home');
    });
});

describe('getPathFromViewId', () => {
    it('maps view IDs back to their paths', () => {
        expect(getPathFromViewId('history')).toBe(ROUTES.HISTORY);
        expect(getPathFromViewId('resumes')).toBe(ROUTES.RESUMES);
        expect(getPathFromViewId('coach-home')).toBe(ROUTES.CAREER_HOME);
        expect(getPathFromViewId('edu-home')).toBe(ROUTES.EDUCATION_HOME);
        expect(getPathFromViewId('plans')).toBe(ROUTES.PLANS);
    });

    it('returns home path for unknown view IDs', () => {
        expect(getPathFromViewId('nonexistent' as any)).toBe(ROUTES.HOME);
    });
});

describe('getModeFromViewId', () => {
    it('identifies coach mode views', () => {
        expect(getModeFromViewId('coach-home')).toMatchObject({ isCoachMode: true, isEduMode: false, isJobMode: false });
        expect(getModeFromViewId('career-growth')).toMatchObject({ isCoachMode: true, isEduMode: false, isJobMode: false });
        expect(getModeFromViewId('skills')).toMatchObject({ isCoachMode: true, isEduMode: false, isJobMode: false });
        expect(getModeFromViewId('skills-interview')).toMatchObject({ isCoachMode: true, isEduMode: false, isJobMode: false });
    });

    it('identifies edu mode views', () => {
        expect(getModeFromViewId('edu-home')).toMatchObject({ isCoachMode: false, isEduMode: true, isJobMode: false });
        expect(getModeFromViewId('edu-gpa')).toMatchObject({ isCoachMode: false, isEduMode: true, isJobMode: false });
    });

    it('identifies job mode views', () => {
        expect(getModeFromViewId('history')).toMatchObject({ isCoachMode: false, isEduMode: false, isJobMode: true });
        expect(getModeFromViewId('job-detail')).toMatchObject({ isCoachMode: false, isEduMode: false, isJobMode: true });
        expect(getModeFromViewId('cover-letters')).toMatchObject({ isCoachMode: false, isEduMode: false, isJobMode: true });
    });

    it('excludes system pages from job mode', () => {
        expect(getModeFromViewId('privacy')).toMatchObject({ isJobMode: false });
        expect(getModeFromViewId('plans')).toMatchObject({ isJobMode: false });
        expect(getModeFromViewId('settings')).toMatchObject({ isJobMode: false });
        expect(getModeFromViewId('admin')).toMatchObject({ isJobMode: false });
    });
});
