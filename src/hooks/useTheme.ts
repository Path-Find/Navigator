import { useLayoutEffect } from 'react';

// This hook is now largely handled by GlobalUIProvider's internal state
// but we keep it here to ensure early theme application if needed.
export const useTheme = () => {
    useLayoutEffect(() => {
        // GlobalUIProvider handles this now, but we can keep it as a no-op 
        // or a simple check for initial load if we want to avoid flicker 
        // even before GlobalUIProvider mounts.
    }, []);
};
