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
        handleUpdateResume: vi.fn(),
        handleDeleteResume: vi.fn(),
        setImportError: vi.fn(),
        isParsingResume: false,
        isLoading: false,
        importError: null as string | null,
        clearImportError: vi.fn(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useResumeContext).mockReturnValue(makeContext());
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
        vi.mocked(useResumeContext).mockReturnValue(makeContext({ isParsingResume: true }));
        render(<ResumeEditor />);

        // When parsing, logic switches to full-page loading view
        expect(screen.getByText('Summoning achievement hunters...')).toBeInTheDocument();
        expect(screen.getByText(/Intelligence Engine Active/i)).toBeInTheDocument();

        // 3-card empty state should be gone
        expect(screen.queryByText('Foundation')).not.toBeInTheDocument();
    });

    it('displays import error when provided in empty state', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({ importError: 'Failed to parse file' }));
        render(<ResumeEditor />);

        expect(screen.getByText('Failed to parse file')).toBeInTheDocument();

        // Should still show 3 cards as we are in empty state
        expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    it('tracks usage when saving', async () => {
        vi.useFakeTimers();
        vi.mocked(useResumeContext).mockReturnValue(makeContext({
            resumes: [{ id: '1', name: 'Test Resume', blocks: [] }]
        }));

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
        }));

        render(<ResumeEditor />);

        // The section header "Work" should be there
        expect(screen.getByText('Work')).toBeInTheDocument();

        // The block title should be rendered
        expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();

        // No redundant section type badge should appear alongside the block
        expect(screen.queryByText('work')).not.toBeInTheDocument();
    });
});

describe('ResumeEditor — block editing', () => {
    const mockOnSave = vi.fn();
    const mockOnImport = vi.fn();

    const makeContext = (overrides = {}) => ({
        resumes: [],
        handleUpdateResumes: mockOnSave,
        handleImportResume: mockOnImport,
        handleUpdateResume: vi.fn(),
        handleDeleteResume: vi.fn(),
        setImportError: vi.fn(),
        isParsingResume: false,
        isLoading: false,
        importError: null as string | null,
        clearImportError: vi.fn(),
        ...overrides,
    });

    const withWorkBlock = {
        resumes: [{
            id: '1',
            name: 'Test Resume',
            blocks: [{
                id: 'b1',
                type: 'work' as const,
                title: 'Engineer',
                organization: 'Acme',
                dateRange: '2022-Present',
                bullets: ['Built things', 'Shipped features'],
                isVisible: true
            }]
        }]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useResumeContext).mockReturnValue(makeContext());
    });

    it('adds a new work block when "Add Entry" is clicked in the Work section', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext(withWorkBlock));
        render(<ResumeEditor />);

        const addButtons = screen.getAllByText('Add Entry');
        const workAddBtn = addButtons[0];
        fireEvent.click(workAddBtn);

        const titleInputs = screen.getAllByPlaceholderText('Role / Title');
        expect(titleInputs.length).toBeGreaterThan(1);
    });

    it('does not add a second summary block when summary already exists', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({
            resumes: [{
                id: '1',
                name: 'Test Resume',
                blocks: [{
                    id: 's1',
                    type: 'summary' as const,
                    title: 'Professional Summary',
                    organization: '',
                    dateRange: '',
                    bullets: ['I am a developer'],
                    isVisible: true
                }]
            }]
        }));
        render(<ResumeEditor />);

        // The "Add Summary" button should not be visible when a summary block exists
        expect(screen.queryByText('Add Summary')).not.toBeInTheDocument();
    });

    it('renders block title and organization inputs for a work block', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext(withWorkBlock));
        render(<ResumeEditor />);

        expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Acme')).toBeInTheDocument();
    });

    it('renders bullet text for a work block', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext(withWorkBlock));
        render(<ResumeEditor />);

        expect(screen.getByDisplayValue('Built things')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Shipped features')).toBeInTheDocument();
    });

    it('updates a bullet when its textarea changes', () => {
        vi.useFakeTimers();
        vi.mocked(useResumeContext).mockReturnValue(makeContext(withWorkBlock));
        render(<ResumeEditor />);

        const bulletInput = screen.getByDisplayValue('Built things');
        fireEvent.change(bulletInput, { target: { value: 'Built new things' } });

        expect(screen.getByDisplayValue('Built new things')).toBeInTheDocument();
        vi.useRealTimers();
    });

    it('removes a block when the Delete Block button is clicked', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext(withWorkBlock));
        render(<ResumeEditor />);

        expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument();

        // Button component has no title attr; identify by text-rose-500 as a standalone class token
        // (not hover:text-rose-500 which appears on bullet Remove-Line buttons)
        const deleteBtn = screen.getAllByRole('button').find(btn =>
            btn.className.split(' ').includes('text-rose-500')
        );
        expect(deleteBtn).toBeDefined();
        fireEvent.click(deleteBtn!);

        expect(screen.queryByDisplayValue('Engineer')).not.toBeInTheDocument();
    });
});

describe('ResumeEditor — sidebar', () => {
    const mockOnSave = vi.fn();
    const mockOnImport = vi.fn();

    const makeContext = (overrides = {}) => ({
        resumes: [],
        handleUpdateResumes: mockOnSave,
        handleImportResume: mockOnImport,
        handleUpdateResume: vi.fn(),
        handleDeleteResume: vi.fn(),
        setImportError: vi.fn(),
        isParsingResume: false,
        isLoading: false,
        importError: null as string | null,
        clearImportError: vi.fn(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const workBlock = {
        id: 'b1',
        type: 'work' as const,
        title: 'Engineer',
        organization: 'Acme',
        dateRange: '2022-Present',
        bullets: ['Built things'],
        isVisible: true
    };

    it('renders the Discovery Bank when suggestedUpdates are present', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({
            resumes: [{
                id: '1',
                name: 'Test Resume',
                blocks: [workBlock],
                suggestedUpdates: [{
                    id: 'sug1',
                    type: 'add' as const,
                    suggestion: 'Add TypeScript to skills',
                    impact: 'Increases match rate',
                    source: 'job-analysis',
                    dateAdded: Date.now()
                }]
            }]
        }));
        render(<ResumeEditor />);

        expect(screen.getByText('Discovery Bank')).toBeInTheDocument();
        expect(screen.getByText('Add TypeScript to skills')).toBeInTheDocument();
    });

    it('does not render the Discovery Bank when suggestedUpdates is empty', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({
            resumes: [{ id: '1', name: 'Test Resume', blocks: [workBlock], suggestedUpdates: [] }]
        }));
        render(<ResumeEditor />);

        expect(screen.queryByText('Discovery Bank')).not.toBeInTheDocument();
    });

    it('dismisses a suggestion when Dismiss is clicked', () => {
        vi.mocked(useResumeContext).mockReturnValue(makeContext({
            resumes: [{
                id: '1',
                name: 'Test Resume',
                blocks: [workBlock],
                suggestedUpdates: [{
                    id: 'sug1',
                    type: 'add' as const,
                    suggestion: 'Add TypeScript to skills',
                    impact: 'Increases match rate',
                    source: 'job-analysis',
                    dateAdded: Date.now()
                }]
            }]
        }));
        render(<ResumeEditor />);

        const dismissBtn = screen.getByText('Dismiss');
        fireEvent.click(dismissBtn);

        expect(mockOnSave).toHaveBeenCalled();
    });
});

describe('ResumeEditor — preview modal', () => {
    const mockOnSave = vi.fn();
    const mockOnImport = vi.fn();

    const makeContext = (overrides = {}) => ({
        resumes: [{ id: '1', name: 'Test Resume', blocks: [] }],
        handleUpdateResumes: mockOnSave,
        handleImportResume: mockOnImport,
        handleUpdateResume: vi.fn(),
        handleDeleteResume: vi.fn(),
        setImportError: vi.fn(),
        isParsingResume: false,
        isLoading: false,
        importError: null as string | null,
        clearImportError: vi.fn(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useResumeContext).mockReturnValue(makeContext());
    });

    it('opens the preview modal when Preview is clicked', () => {
        render(<ResumeEditor />);

        const previewBtn = screen.getByText('Preview');
        fireEvent.click(previewBtn);

        expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    it('closes the preview modal when X is clicked', () => {
        render(<ResumeEditor />);

        fireEvent.click(screen.getByText('Preview'));
        expect(screen.getByText('Download PDF')).toBeInTheDocument();

        // X close button has w-9 h-9 classes (unique to it); "Download PDF" has text content
        const closeButtons = screen.getAllByRole('button');
        const xBtn = closeButtons.find(btn => btn.className.includes('w-9') && btn.className.includes('h-9'));
        expect(xBtn).toBeDefined();
        if (xBtn) fireEvent.click(xBtn);

        expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
    });
});
