import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GapAnalysisSection } from './GapAnalysisSection';
import { ToastProvider } from '../../../contexts/ToastContext';
import type { TargetJob } from '../../../types';

const mockTargetJobs: TargetJob[] = [
    {
        id: 'tj1',
        title: 'Senior Software Engineer',
        description: 'Test job',
        dateAdded: Date.now(),
        strictMode: true
    }
];

const mockAnalysis = {
    score: 80,
    topSkillGaps: [
        { skill: 'React', importance: 5, gapDescription: 'Need more hooks knowledge', actionableEvidence: [{ task: 'Build a hook', metric: '100% test coverage' }] }
    ],
    careerTrajectoryGap: 'Strong alignment overall.',
    estimatedTimeToBridge: '3 months',
    dateGenerated: Date.now()
};

const mockRoadmap = [
    { id: 'm1', title: 'Learn Vitest', month: 1, type: 'metric', linkedSkill: 'Testing', status: 'completed' },
    { id: 'm2', title: 'Master Hooks', month: 2, type: 'project', linkedSkill: 'React', status: 'pending' }
];

describe('GapAnalysisSection', () => {
    const mockHandlers = {
        onUpdateTargetJob: vi.fn(),
        onAddTargetJob: vi.fn(),
        onRunGapAnalysis: vi.fn(),
        onGenerateRoadmap: vi.fn(),
        onToggleMilestone: vi.fn(),
        onViewChange: vi.fn(),
    };

    it('renders empty state when no jobs are present and handles goal addition', async () => {
        render(
            <ToastProvider>
                <GapAnalysisSection
                    targetJobs={[]}
                    roleModels={[]}
                    transcript={null}
                    {...mockHandlers}
                />
            </ToastProvider>
        );
        expect(screen.getByText('No Career Goals Defined')).toBeInTheDocument();

        const input = screen.getByPlaceholderText('Paste a LinkedIn Job URL or type a title...');
        const submitBtn = screen.getByText('Set Goal');

        fireEvent.change(input, { target: { value: 'https://linkedin.com/jobs/123' } });
        fireEvent.click(submitBtn);

        expect(mockHandlers.onAddTargetJob).toHaveBeenCalledWith('https://linkedin.com/jobs/123');
    });

    it('renders target job cards', () => {
        render(
            <ToastProvider>
                <GapAnalysisSection
                    targetJobs={mockTargetJobs}
                    roleModels={[]}
                    transcript={null}
                    {...mockHandlers}
                />
            </ToastProvider>
        );
        expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('Start Growth Analysis')).toBeInTheDocument();
    });

    it('triggers strict mode toggle for all jobs', () => {
        render(
            <ToastProvider>
                <GapAnalysisSection
                    targetJobs={mockTargetJobs}
                    roleModels={[]}
                    transcript={null}
                    {...mockHandlers}
                />
            </ToastProvider>
        );

        const toggle = screen.getByTitle('Toggle between Technical Skills only or Generic Skills');
        fireEvent.click(toggle);

        expect(mockHandlers.onUpdateTargetJob).toHaveBeenCalledWith(expect.objectContaining({
            id: 'tj1',
            strictMode: false
        }));
    });

    it('renders analysis results when present', () => {
        const jobsWithAnalysis = [{ ...mockTargetJobs[0], gapAnalysis: mockAnalysis }];
        render(
            <ToastProvider>
                <GapAnalysisSection
                    targetJobs={jobsWithAnalysis as any}
                    roleModels={[]}
                    transcript={null}
                    {...mockHandlers}
                />
            </ToastProvider>
        );

        expect(screen.getByText('Strong alignment overall.')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('3 months')).toBeInTheDocument();
    });

    it('renders roadmap and progress bar', () => {
        const jobsWithRoadmap = [{
            ...mockTargetJobs[0],
            gapAnalysis: mockAnalysis,
            roadmap: mockRoadmap
        }];
        render(
            <ToastProvider>
                <GapAnalysisSection
                    targetJobs={jobsWithRoadmap as any}
                    roleModels={[]}
                    transcript={null}
                    {...mockHandlers}
                />
            </ToastProvider>
        );

        expect(screen.getByText('12-Month Trajectory')).toBeInTheDocument();
        // 1 completed / 2 total = 50%
        expect(screen.getByText('50%')).toBeInTheDocument();
        expect(screen.getByText('Learn Vitest')).toBeInTheDocument();
    });

    it('triggers milestone toggle', () => {
        const jobsWithRoadmap = [{
            ...mockTargetJobs[0],
            gapAnalysis: mockAnalysis,
            roadmap: mockRoadmap
        }];
        render(
            <ToastProvider>
                <GapAnalysisSection
                    targetJobs={jobsWithRoadmap as any}
                    roleModels={[]}
                    transcript={null}
                    {...mockHandlers}
                />
            </ToastProvider>
        );

        const milestone = screen.getByText('Learn Vitest');
        fireEvent.click(milestone);

        expect(mockHandlers.onToggleMilestone).toHaveBeenCalledWith('tj1', 'm1');
    });
});
