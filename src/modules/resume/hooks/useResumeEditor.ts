import { useState, useCallback, useEffect, useRef } from 'react';
import type { ExperienceBlock, ResumeProfile, ResumeSuggestion } from '../types';
import { EventService } from '../../../services/eventService';
import { TRACKING_EVENTS } from '../../../constants';

type SectionType = ExperienceBlock['type'];

export function useResumeEditor(
    initialResume: ResumeProfile | null,
    resumes: ResumeProfile[],
    onSave: (resumes: ResumeProfile[]) => void
) {
    const [blocks, setBlocks] = useState<ExperienceBlock[]>(initialResume?.blocks || []);
    const [movingBlockId, setMovingBlockId] = useState<string | null>(null);
    const onSaveRef = useRef(onSave);
    useEffect(() => { onSaveRef.current = onSave; });

    // Always-fresh ref so the debounce effect doesn't capture a stale initialResume
    const initialResumeRef = useRef(initialResume);
    useEffect(() => { initialResumeRef.current = initialResume; });

    // Sync blocks when the active resume changes (new profile ID) OR after a PDF import
    // (same ID but bumped importRevision). Keeps the editor in sync with external writes
    // without triggering on every normal save (which would cause a perpetual-save loop).
    const syncKey = `${resumes[0]?.id}:${resumes[0]?.importRevision ?? 0}`;
    const lastSyncKeyRef = useRef<string | undefined>(undefined);
    // eslint-disable-next-line react-hooks/refs
    if (resumes.length > 0 && syncKey !== lastSyncKeyRef.current) {
        // eslint-disable-next-line react-hooks/refs
        lastSyncKeyRef.current = syncKey;
        setBlocks(resumes[0].blocks || []);
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            const resume = initialResumeRef.current;
            if (!resume) return;
            const updatedProfile = { ...resume, blocks };
            onSaveRef.current([updatedProfile]);
            EventService.trackUsage(TRACKING_EVENTS.RESUMES);
        }, 800);
        return () => clearTimeout(handler);
    // initialResume?.id covers profile switches; blocks covers user edits.
    // The full initialResume object is intentionally excluded — it changes after
    // every save and would cause an infinite save loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks, initialResume?.id]);

    const addBlock = useCallback((type: SectionType, initial?: { title?: string; organization?: string; dateRange?: string }) => {
        if (type === 'summary' && blocks.some(b => b.type === 'summary')) return;
        const newBlock: ExperienceBlock = {
            id: crypto.randomUUID(),
            type,
            title: initial?.title ?? (type === 'summary' ? 'Professional Summary' : ''),
            organization: initial?.organization ?? '',
            dateRange: initial?.dateRange ?? '',
            bullets: [''],
            isVisible: true
        };
        setBlocks(prev => [...prev, newBlock]);
    }, [blocks]);

    const removeBlock = useCallback((id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
    }, []);

    const updateBlock = useCallback((id: string, field: keyof ExperienceBlock, value: string | string[] | boolean) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    }, []);

    const updateBullet = useCallback((blockId: string, index: number, value: string) => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== blockId) return b;
            const newBullets = [...b.bullets];
            newBullets[index] = value;
            return { ...b, bullets: newBullets };
        }));
    }, []);

    const addBullet = useCallback((blockId: string, text: string = '') => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== blockId) return b;
            const newBullets = [...b.bullets];
            if (text !== '' && newBullets.length > 0 && newBullets[newBullets.length - 1] === '') {
                newBullets[newBullets.length - 1] = text;
            } else {
                newBullets.push(text);
            }
            return { ...b, bullets: newBullets };
        }));
    }, []);

    const removeBullet = useCallback((blockId: string, index: number) => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== blockId) return b;
            return { ...b, bullets: b.bullets.filter((_: string, i: number) => i !== index) };
        }));
    }, []);

    const moveBullet = useCallback((blockId: string, index: number, direction: 'up' | 'down') => {
        setBlocks(prev => prev.map(b => {
            if (b.id !== blockId) return b;
            const newBullets = [...b.bullets];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex >= 0 && targetIndex < newBullets.length) {
                [newBullets[index], newBullets[targetIndex]] = [newBullets[targetIndex], newBullets[index]];
            }
            return { ...b, bullets: newBullets };
        }));
    }, []);

    const handleDismissSuggestion = useCallback((suggestionId: string) => {
        if (!initialResume) return;
        const updatedProfile = {
            ...initialResume,
            suggestedUpdates: (initialResume.suggestedUpdates || []).filter((s: ResumeSuggestion) => s.id !== suggestionId)
        };
        onSave([updatedProfile]);
    }, [initialResume, onSave]);

    const handleApplySuggestion = useCallback((suggestion: ResumeSuggestion) => {
        if (suggestion.type === 'add' || suggestion.type === 'update') {
            const summaryBlock = blocks.find(b => b.type === 'summary');
            if (summaryBlock) {
                addBullet(summaryBlock.id, suggestion.suggestion);
            } else {
                const newBlock: ExperienceBlock = {
                    id: crypto.randomUUID(),
                    type: 'summary',
                    title: 'Professional Summary',
                    organization: '',
                    dateRange: '',
                    bullets: [suggestion.suggestion],
                    isVisible: true
                };
                setBlocks(prev => [newBlock, ...prev]);
            }
        }
        handleDismissSuggestion(suggestion.id);
    }, [blocks, addBullet, handleDismissSuggestion]);

    const toggleProfilePriority = useCallback((blockId: string) => {
        const resume = initialResumeRef.current;
        if (!resume) return;

        const context = resume.candidateProfile;
        const existingIds = context?.currentBlockIds || [];
        const nextIds = existingIds.includes(blockId)
            ? existingIds.filter(id => id !== blockId)
            : [...existingIds, blockId];

        onSaveRef.current([{
            ...resume,
            blocks,
            candidateProfile: {
                signals: context?.signals || [],
                stories: context?.stories || [],
                facts: context?.facts || [],
                education: context?.education,
                availability: context?.availability,
                currentBlockIds: nextIds,
                insights: context?.insights || [],
                completedAt: context?.completedAt,
            },
        }]);
    }, [blocks]);

    return {
        blocks,
        movingBlockId,
        setMovingBlockId,
        addBlock,
        removeBlock,
        updateBlock,
        updateBullet,
        addBullet,
        removeBullet,
        moveBullet,
        handleApplySuggestion,
        handleDismissSuggestion,
        toggleProfilePriority,
    };
}
