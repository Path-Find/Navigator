import { useUser } from '../contexts/UserContext';

/**
 * Hook to check if NextGen (Modeling Engine R&D) features should be enabled.
 * This flag is gated per-user in the Supabase profiles table.
 */
export const useNextGen = () => {
    const { isNextGenEnabled } = useUser();
    return isNextGenEnabled;
};
