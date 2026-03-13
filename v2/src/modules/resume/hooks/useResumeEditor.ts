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

    const lastSyncedResumeIdRef = useRef(resumes[0]?.id);
    // Sync blocks when the active resume changes (e.g., after import or cloud load).
    // React-recommended render-time pattern avoids the cascading-render anti-pattern.
    // eslint-disable-next-line react-hooks/refs
    if (resumes.length > 0 && resumes[0].id !== lastSyncedResumeIdRef.current) {
        // eslint-disable-next-line react-hooks/refs
        lastSyncedResumeIdRef.current = resumes[0].id;
        setBlocks(resumes[0].blocks || []);
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            if (!initialResume) return;
            const updatedProfile = { ...initialResume, blocks };
            onSaveRef.current([updatedProfile]);
            EventService.trackUsage(TRACKING_EVENTS.RESUMES);
        }, 800);
        return () => clearTimeout(handler);
    }, [blocks, initialResume?.id, initialResume]);

    const addBlock = useCallback((type: SectionType) => {
        if (type === 'summary' && blocks.some(b => b.type === 'summary')) return;
        const newBlock: ExperienceBlock = {
            id: crypto.randomUUID(),
            type: type,
            title: type === 'summary' ? 'Professional Summary' : '',
            organization: '',
            dateRange: '',
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
        handleDismissSuggestion
    };
}
