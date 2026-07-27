import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import History from './History';
import type { SavedJob } from '../../types';
import { JobContext } from './context/JobContext';

describe('History', () => {
  const mockJobs: SavedJob[] = [
    {
      id: '1',
      company: 'Google',
      position: 'Software Engineer',
      description: 'Build amazing things',
      resumeId: 'resume-1',
      dateAdded: Date.now(),
      status: 'saved',
      analysis: {
        distilledJob: {
          companyName: 'Google',
          roleTitle: 'Software Engineer',
          keySkills: ['React', 'TypeScript'],
          coreResponsibilities: ['Build features'],
          applicationDeadline: null,
        },
        compatibilityScore: 85,
        bestResumeProfileId: 'resume-1',
        reasoning: 'Good fit',
        strengths: ['Strong React skills'],
        weaknesses: ['Needs more backend'],
        tailoringInstructions: ['Highlight React'],
        recommendedBlockIds: ['block-1'],
      },
      fitScore: 85,
    },
    {
      id: '2',
      company: 'Meta',
      position: 'Frontend Developer',
      description: 'Work on UI',
      resumeId: 'resume-1',
      dateAdded: Date.now() - 1000,
      status: 'applied',
      analysis: {
        distilledJob: {
          companyName: 'Meta',
          roleTitle: 'Frontend Developer',
          keySkills: ['JavaScript', 'CSS'],
          coreResponsibilities: ['UI development'],
          applicationDeadline: null,
        },
        compatibilityScore: 70,
        bestResumeProfileId: 'resume-1',
        reasoning: 'Decent fit',
        strengths: ['Good CSS knowledge'],
        weaknesses: ['Limited experience'],
        tailoringInstructions: ['Emphasize frontend work'],
        recommendedBlockIds: ['block-2'],
      },
      fitScore: 70,
    },
  ];

  const mockOnSelectJob = vi.fn();
  const mockOnDeleteJob = vi.fn();

  const renderHistory = (jobs: SavedJob[]) => {
    return render(
      <MemoryRouter>
        <JobContext.Provider value={{
          jobs,
          activeJobId: null,
          activeJob: undefined,
          isLoading: false,
          usageStats: { jobAnalyses: { used: 0, limit: 3, remaining: 3, isAtLimit: false }, coverLetters: { used: 0, limit: 3, remaining: 3, isAtLimit: false }, interviewSessions: { used: 0, limit: 3, remaining: 3, isAtLimit: false } },
          showUpgradeModal: false,
          upgradeModalData: null,
          nudgeJob: null,
          dismissNudge: vi.fn(),
          setActiveJobId: mockOnSelectJob,
          handleUpdateJob: vi.fn(),
          handleJobCreated: vi.fn(),
          handleDraftApplication: vi.fn(),
          handleDeleteJob: mockOnDeleteJob,
          handleAnalyzeJob: vi.fn(),
          handlePromoteFromFeed: vi.fn(),
          handleSaveFromFeed: vi.fn(),
          closeUpgradeModal: vi.fn(),
        }}>
          <History />
        </JobContext.Provider>
      </MemoryRouter>
    );
  };

  it('should render empty state when no jobs', () => {
    renderHistory([]);

    expect(screen.getByText('No history yet')).toBeInTheDocument();
  });

  it('should render job list', () => {
    renderHistory(mockJobs);

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should filter jobs by search query', () => {
    renderHistory(mockJobs);

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Type 'Google' in search
    fireEvent.change(searchInput, { target: { value: 'Google' } });

    // Should show Google job
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();

    // Should not show Meta job
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
  });

  it('should filter by company name', () => {
    renderHistory(mockJobs);

    const searchInput = screen.getByPlaceholderText(/search/i);

    fireEvent.change(searchInput, { target: { value: 'Meta' } });

    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should be case insensitive', () => {
    renderHistory(mockJobs);

    const searchInput = screen.getByPlaceholderText(/search/i);

    fireEvent.change(searchInput, { target: { value: 'GOOGLE' } });

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('should show all jobs when search is cleared', () => {
    renderHistory(mockJobs);

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Filter
    fireEvent.change(searchInput, { target: { value: 'Google' } });
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();

    // Clear filter
    fireEvent.change(searchInput, { target: { value: '' } });

    // Both should show
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should call onSelectJob when job is clicked', () => {
    renderHistory(mockJobs);

    const jobCard = screen.getByText('Software Engineer').closest('div');
    if (jobCard) {
      fireEvent.click(jobCard);
    }

    expect(mockOnSelectJob).toHaveBeenCalledWith('1');
  });

  it('should display fit scores', () => {
    renderHistory(mockJobs);

    // Score 85 → "Strong" label + "85%" shown in separate spans
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    // Score 70 → "Good" label (right at the Good threshold) + "70%"
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('should show analyzing and error states in saved filter', () => {
    const statusJobs: SavedJob[] = [
      { id: '3', status: 'analyzing', position: 'Analyzing Role', company: 'Startup', dateAdded: Date.now(), description: '...', resumeId: 'r1' },
      { id: '4', status: 'error', position: 'Failed Role', company: 'Startup', dateAdded: Date.now(), description: '...', resumeId: 'r1' },
    ];

    renderHistory(statusJobs);

    // When status is 'analyzing' with no analysis, component renders 'Analyzing New Job...' not the position
    expect(screen.getByText('Analyzing New Job...')).toBeInTheDocument();
    // Progress bar shows default message and 0%
    expect(screen.getByText('Finding your fit...')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    // Error state shows the error message and the job's position
    expect(screen.getByText('Failed Role')).toBeInTheDocument();
    expect(screen.getByText('Analysis could not be completed')).toBeInTheDocument();
  });

  it('should display progress bar with custom message', () => {
    const progressJob: SavedJob = {
      id: '5',
      company: 'Startup',
      position: 'Analyzing Role',
      description: '...',
      resumeId: 'r1',
      dateAdded: Date.now(),
      status: 'analyzing',
      progress: 45,
      progressMessage: 'Extracting skills...'
    };

    renderHistory([progressJob]);

    expect(screen.getByText('Extracting skills...')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should filter jobs by Applied status when the Applied tab is clicked', () => {
    renderHistory(mockJobs);

    // "Applied" appears in both the filter tab and the status badge — click the button
    const appliedTab = screen.getAllByRole('button', { name: /Applied/i })[0];
    fireEvent.click(appliedTab);

    // Only the applied job (Meta) should show
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should show all jobs when the All tab is clicked after a status filter', () => {
    renderHistory(mockJobs);

    const appliedTab = screen.getAllByRole('button', { name: /Applied/i })[0];
    fireEvent.click(appliedTab);
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();

    const allTab = screen.getAllByRole('button', { name: /^All/i })[0];
    fireEvent.click(allTab);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should call handleDeleteJob when the delete button is clicked', () => {
    renderHistory(mockJobs);

    const deleteBtn = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteBtn);

    expect(mockOnDeleteJob).toHaveBeenCalled();
  });

  it('should call setActiveJobId when View Analysis is clicked', () => {
    renderHistory(mockJobs);

    const viewBtn = screen.getAllByText('View Analysis')[0];
    fireEvent.click(viewBtn);

    expect(mockOnSelectJob).toHaveBeenCalled();
  });

  it('should restrict access when analyzing', () => {
    const analyzingJob: SavedJob = {
      id: '6',
      company: 'Analyzing Corp',
      position: 'Processing Role',
      description: '...',
      resumeId: 'r1',
      dateAdded: Date.now(),
      status: 'analyzing',
      progress: 50
    };

    mockOnSelectJob.mockClear();

    renderHistory([analyzingJob]);

    // When analyzing without a distilled role title, component renders 'Analyzing New Job...'
    const card = screen.getByText('Analyzing New Job...').closest('div');
    if (card) {
      fireEvent.click(card);
    }
    expect(mockOnSelectJob).not.toHaveBeenCalled();

    // View Analysis button should not be present
    expect(screen.queryByText('View Analysis')).not.toBeInTheDocument();

    // Delete button should be hidden (not disabled, as it only renders when !isAnalyzing conditionally or isn't assigned a title)
    const deleteBtn = screen.queryByTitle('Delete');
    expect(deleteBtn).not.toBeInTheDocument();
  });
});
