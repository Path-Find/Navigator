import { useState, useEffect } from 'react';
import { Storage } from '../services/storageService';
import { ArchetypeUtils, type CareerArchetype } from '../utils/archetypeUtils';

export const useArchetype = () => {
    const [archetypes, setArchetypes] = useState<CareerArchetype[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const jobs = await Storage.getJobs();
            const calculated = ArchetypeUtils.calculateArchetypes(jobs);
            setArchetypes(calculated);
        } catch (error) {
            console.error('Failed to calculate archetypes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return { archetypes, loading, refresh };
};
