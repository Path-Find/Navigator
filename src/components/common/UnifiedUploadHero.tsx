import React from 'react';
import { FileText, Zap, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BentoCard } from '../ui/BentoCard';
import { FEATURE_COLORS } from '../../featureRegistry';
import { DropZone } from './DropZone';
import { Button } from '../ui/Button';

export interface UnifiedUploadHeroProps {
    title: string;
    description: string;
    onUpload: (files: File[]) => void;
    onManualEntry?: () => void;
    isLoading?: boolean;
    loadingText?: string;
    error?: string | null;
    accept?: string;
    themeColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
    cards?: {
        foundation: {
            title: string;
            description: string;
            icon: LucideIcon;
            benefits: string[];
            actionLabel?: string;
            onAction?: () => void;
        };
        intelligence: {
            title: string;
            description: string;
            icon: LucideIcon;
            benefits: string[];
            actionLabel?: string;
            onAction?: () => void;
        };
    };
    manualEntryLabel?: string;
}

export const UnifiedUploadHero: React.FC<UnifiedUploadHeroProps> = ({
    title,
    description,
    onUpload,
    onManualEntry,
    isLoading = false,
    loadingText = 'Analyzing...',
    error,
    accept = ".pdf",
    themeColor = "indigo",
    cards,
    manualEntryLabel = "Start Fresh"
}) => {
    type CardConfig = NonNullable<UnifiedUploadHeroProps['cards']>['foundation'];

    // Default card content if not provided
    const defaultCards: { foundation: CardConfig; intelligence: CardConfig } = {
        foundation: {
            title: "Foundation",
            description: "We need your history to build a strong foundation. Upload your current file to provide the essential data.",
            icon: FileText,
            benefits: ['Smart File Import', 'Automatic Cleanup', 'Privacy-First Engine']
        },
        intelligence: {
            title: "Intelligence",
            description: "Our AI processes your data to discover your unique strengths and map your potential.",
            icon: Zap,
            benefits: ['Deep Analysis', 'Pattern Recognition', 'Growth Mapping']
        }
    };

    const activeCards = cards || defaultCards;

    return (
        <div className="animate-in zoom-in-95 duration-700 relative flex flex-col items-center justify-center py-12">
            <div className="relative z-10 w-full mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {/* Card 1: Foundation */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <BentoCard
                            id="foundation"
                            icon={activeCards.foundation.icon}
                            title={activeCards.foundation.title}
                            description={activeCards.foundation.description}
                            color={themeColor === 'amber' ? FEATURE_COLORS.amber : FEATURE_COLORS.emerald}
                            actionLabel={activeCards.foundation.actionLabel}
                            onAction={activeCards.foundation.onAction}
                            previewContent={
                                <ul className="space-y-3 pt-4">
                                    {activeCards.foundation.benefits.map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                            <div className={`w-1 h-1 rounded-full ${themeColor === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>

                    {/* Card 2: Intelligence */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
                        <BentoCard
                            id="intelligence"
                            icon={activeCards.intelligence.icon}
                            title={activeCards.intelligence.title}
                            description={activeCards.intelligence.description}
                            color={themeColor === 'amber' ? FEATURE_COLORS.sky : FEATURE_COLORS.indigo}
                            actionLabel={activeCards.intelligence.actionLabel}
                            onAction={activeCards.intelligence.onAction}
                            previewContent={
                                <ul className="space-y-3 pt-4">
                                    {activeCards.intelligence.benefits.map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                            <div className={`w-1 h-1 rounded-full ${themeColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>

                    {/* Card 3: Upload */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
                        <DropZone
                            onUpload={onUpload}
                            accept={accept}
                            title={title}
                            description={description}
                            variant="card"
                            themeColor={themeColor}
                            isLoading={isLoading}
                            loadingText={loadingText}
                            error={error}
                        >
                            {onManualEntry && (
                                <Button
                                    onClick={onManualEntry}
                                    className="w-full justify-between py-2.5 rounded-2xl"
                                    variant="secondary"
                                    icon={<Plus className="w-4 h-4" />}
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-black leading-tight">{manualEntryLabel}</div>
                                        <div className="text-[9px] font-black mt-0.5 opacity-70">Manual Entry</div>
                                    </div>
                                </Button>
                            )}
                        </DropZone>
                    </div>
                </div>
            </div>
        </div>
    );
};
