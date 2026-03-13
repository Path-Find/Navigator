import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureGrid } from './FeatureGrid';
import { EventService } from '../../services/eventService';
import { FEATURE_REGISTRY } from '../../featureRegistry';
import type { User } from '@supabase/supabase-js';

// Mock UserContext
vi.mock('../../contexts/UserContext', () => ({
    useUser: () => ({
        lastArchetypeUpdate: null,
        acceptedTosVersion: null,
        user: null,
        dismissedNotices: [],
        dismissNotice: vi.fn(),
    }),
}));

// Mock EventService
vi.mock('../../services/eventService', () => ({
    EventService: {
        trackInterest: vi.fn(),
    },
}));

// Mock BentoCard since we only care about the interaction, not the rendering details
vi.mock('../../components/ui/BentoCard', () => ({
    BentoCard: ({ title, onAction }: { title: string; onAction: () => void }) => (
        <div data-testid="bento-card" onClick={onAction}>
            {title}
        </div>
    ),
}));

describe('FeatureGrid', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call onShowAuth with config when logged out user clicks a card', () => {
        const onShowAuthMock = vi.fn();
        const config = FEATURE_REGISTRY['JOBFIT']; // Using a known feature

        render(
            <FeatureGrid
                user={null}
                onShowAuth={onShowAuthMock}
            />
        );

        // Find the card by title (shortName)
        const card = screen.getByText(config.shortName);
        fireEvent.click(card);

        // Verify tracking
        expect(EventService.trackInterest).toHaveBeenCalledWith(config.id);

        // Verify onShowAuth called with config
        expect(onShowAuthMock).toHaveBeenCalledWith(config);
    });

    it('should call onNavigate with targetView when logged in user clicks a card', () => {
        const onNavigateMock = vi.fn();
        const config = FEATURE_REGISTRY['JOBFIT'];
        const mockUser = { id: 'user-123' } as User;

        render(
            <FeatureGrid
                user={mockUser}
                onNavigate={onNavigateMock}
                userTier="plus" // Ensure user is treated as logged in/plus
            />
        );

        const card = screen.getByText(config.shortName);
        fireEvent.click(card);

        // Verify tracking
        expect(EventService.trackInterest).toHaveBeenCalledWith(config.id);

        // Verify onNavigate called with targetView
        expect(onNavigateMock).toHaveBeenCalledWith(config.targetView);
    });

    it('should filter cards based on user tier/admin status', () => {
        // Education requires Admin/Tester
        const eduConfig = FEATURE_REGISTRY['EDU'];

        // Render as normal user
        const { unmount } = render(
            <FeatureGrid user={null} />
        );

        // Should NOT see Education card
        expect(screen.queryByText(eduConfig.shortName)).not.toBeInTheDocument();
        unmount();

        // Render as admin
        render(
            <FeatureGrid user={null} isAdmin={true} />
        );

        // Should see Education card
        expect(screen.getByText(eduConfig.shortName)).toBeInTheDocument();
    });
});
