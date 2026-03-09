import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResumeEditor from './ResumeEditor';
import { TRACKING_EVENTS } from '../../constants';
import { EventService } from '../../services/eventService';
import { useResumeContext } from './context/ResumeContext';

// Mock dependencies
vi.mock('../../services/eventService', () => ({
    EventService: {
        trackUsage: vi.fn(),
    },
}));

vi.mock('./context/ResumeContext', () => ({
    useResumeContext: vi.fn(),
}));

vi.mock('../skills/context/SkillContext', () => ({
    useSkillContext: () => ({
        skills: [],
        updateSkills: vi.fn(),
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

// Mock SharedPageLayout to simplify DOM
vi.mock('../../components/common/SharedPageLayout', () => ({
    SharedPageLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="shared-page-layout">{children}</div>,
}));

describe('ResumeEditor', () => {
    const mockOnSave = vi.fn();
    const mockOnImport = vi.fn();

    const makeContext = (overrides = {}) => ({
        resumes: [],
        handleUpdateResumes: mockOnSave,
        handleImportResume: mockOnImport,
        isParsingResume: false,
        importError: null as string | null,
        clearImportError: vi.fn(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useResumeContext).mockReturnValue(makeContext() as any);
    });

    it('renders the 3-card empty state when no resumes exist', () => {
        render(<ResumeEditor />);

        // Verify 3-card layout headers
        expect(screen.getByText('Foundation')).toBeInTheDocument();
        expect(screen.getByText('Intelligence')).toBeInTheDocument();
        expect(screen.getByText('Upload')).toBeInTheDocument();

        // Verify value prop text
        expect(screen.getByText(/We need your history/i)).toBeInTheDocument();
        expect(screen.getByText(/Our AI processes your data/i)).toBeInTheDocument();
    });

    it('triggers file import when "Upload" zone is clicked', () => {
        render(<ResumeEditor />);

        // Find the DropZone container by its title
        const dropZoneTitle = screen.getByText('Upload');
        const dropZone = dropZoneTitle.closest('.group');
        expect(dropZone).not.toBeNull();

        // Scope input selection to the DropZone container to avoid finding the top-level input
        const fileInput = dropZone!.querySelector('input[type="file"]') as HTMLInputElement;
        const clickSpy = vi.spyOn(fileInput, 'click');

        fireEvent.click(dropZone!);
        expect(clickSpy).toHaveBeenCalled();
    });

    it('triggers file import when input changes', () => {
        render(<ResumeEditor />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockOnImport).toHaveBeenCalledWith(file);
    });

    it('switches to manual entry when "Start Fresh" is clicked', () => {
        render(<ResumeEditor />);

        const startFreshBtn = screen.getByText('Start Fresh');
        fireEvent.click(startFreshBtn);

        expect(screen.getByText('Professional Summary')).toBeInTheDocument();
        expect(screen.queryByText('Foundation')).not.toBeInTheDocument();
    });

    it('displays loading state when isParsing is true', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({ isParsingResume: true }) as any);
        render(<ResumeEditor />);

        // When parsing, logic switches to full-page loading view
        expect(screen.getByText('Summoning achievement hunters...')).toBeInTheDocument();
        expect(screen.getByText(/Intelligence Engine Active/i)).toBeInTheDocument();

        // 3-card empty state should be gone
        expect(screen.queryByText('Foundation')).not.toBeInTheDocument();
    });

    it('displays import error when provided in empty state', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({ importError: 'Failed to parse file' }) as any);
        render(<ResumeEditor />);

        expect(screen.getByText('Failed to parse file')).toBeInTheDocument();

        // Should still show 3 cards as we are in empty state
        expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    it('tracks usage when saving', async () => {
        vi.useFakeTimers();
        vi.mocked(useResumeContext).mockReturnValue(makeContext({
            resumes: [{ id: '1', name: 'Test Resume', blocks: [] }]
        }) as any);

        render(<ResumeEditor />);

        vi.runAllTimers();

        expect(mockOnSave).toHaveBeenCalled();
        expect(EventService.trackUsage).toHaveBeenCalledWith(TRACKING_EVENTS.RESUMES);

        vi.useRealTimers();
    });

    it('does not render redundant section type badges on entry blocks', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({
            resumes: [{
                id: '1',
                name: 'Test Resume',
                blocks: [{
                    id: 'b1',
                    type: 'work' as const,
                    title: 'Software Engineer',
                    organization: 'Tech Corp',
                    dateRange: '2020-2022',
                    bullets: ['Did stuff'],
                    isVisible: true
                }]
            }]
        }) as any);

        render(<ResumeEditor />);

        // The section header "Work" should be there
        expect(screen.getByText('Work')).toBeInTheDocument();

        // The block title should be rendered
        expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();

        // No redundant section type badge should appear alongside the block
        expect(screen.queryByText('work')).not.toBeInTheDocument();
    });
});
