import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnifiedUploadHero } from './UnifiedUploadHero';

describe('UnifiedUploadHero', () => {
    it('renders the default 3-card layout', () => {
        render(
            <UnifiedUploadHero
                title="Test Upload"
                description="Drop your file here"
                onUpload={vi.fn()}
            />
        );

        expect(screen.getByText('Foundation')).toBeInTheDocument();
        expect(screen.getByText('Intelligence')).toBeInTheDocument();
        expect(screen.getByText('Test Upload')).toBeInTheDocument();
        expect(screen.getByText('Drop your file here')).toBeInTheDocument();
    });

    it('renders manual entry button if onManualEntry is provided', () => {
        const handleManualEntry = vi.fn();
        render(
            <UnifiedUploadHero
                title="Upload"
                description="Drop your file here"
                onUpload={vi.fn()}
                onManualEntry={handleManualEntry}
                manualEntryLabel="Start Fresh"
            />
        );

        const btn = screen.getByText('Start Fresh');
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(handleManualEntry).toHaveBeenCalled();
    });

    it('displays loading state properly', () => {
        render(
            <UnifiedUploadHero
                title="Upload"
                description="Drop your file here"
                onUpload={vi.fn()}
                isLoading={true}
                loadingText="Analyzing PDF..."
            />
        );

        expect(screen.getByText('Analyzing PDF...')).toBeInTheDocument();
    });

    it('displays error state properly', () => {
        render(
            <UnifiedUploadHero
                title="Upload"
                description="Drop your file here"
                onUpload={vi.fn()}
                error="Invalid file format"
            />
        );

        expect(screen.getByText('Invalid file format')).toBeInTheDocument();
    });
});
