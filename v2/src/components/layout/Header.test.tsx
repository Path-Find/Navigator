import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';

// Mock Contexts
vi.mock('../../contexts/UserContext', () => ({
    useUser: () => ({
        user: { id: 'test-user' },
        isLoading: false,
        isAdmin: false,
        signOut: vi.fn(),
    }),
}));

vi.mock('../../contexts/ModalContext', () => ({
    useModal: () => ({
        openModal: vi.fn(),
    }),
}));

vi.mock('../../contexts/GlobalUIContext', () => ({
    useGlobalUI: () => ({
        currentView: 'home',
        setView: vi.fn(),
        isDark: false,
        toggleDarkMode: vi.fn(),
        isFocusedMode: false,
        setFocusedMode: vi.fn(),
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

describe('Header Layout', () => {
    it('should have the navigation pill correctly centered vertically', () => {
        render(<Header />);

        // The navigation pill is a motion.nav element
        const nav = screen.getByRole('navigation');

        // Check for the critical centering classes
        expect(nav.className).toContain('absolute');
        expect(nav.className).toContain('top-1/2');
        expect(nav.className).toContain('-translate-y-1/2');
    });

    it('should render the Navigator logo', () => {
        render(<Header />);
        expect(screen.getByText('Navigator')).toBeInTheDocument();
    });

    it('should render the Sign Out button when user is logged in', () => {
        render(<Header />);
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('should render the dark mode toggle button', () => {
        render(<Header />);
        // The title for light mode is "Switch to Dark Mode" because isDark is false in mock
        expect(screen.getByTitle('Switch to Dark Mode')).toBeInTheDocument();
    });
});
