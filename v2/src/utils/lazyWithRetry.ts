import { lazy } from 'react';
import type { ComponentType } from 'react';

/**
 * A wrapper around React.lazy that retries the import if it fails.
 * This is particularly useful for handling "chunk load errors" which
 * happen when a new version of the app is deployed and old chunks are removed.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
    componentImport: () => Promise<{ default: T } | T>,
) {
    return lazy(async () => {
        const REFRESH_GUARD_KEY = 'page-has-been-force-refreshed';
        const REFRESH_TTL_MS = 30_000; // Guard expires after 30s so later chunk failures can still retry
        const refreshedAt = parseInt(window.sessionStorage.getItem(REFRESH_GUARD_KEY) || '0', 10);
        const pageHasBeenForceRefreshed = refreshedAt > 0 && Date.now() - refreshedAt < REFRESH_TTL_MS;

        try {
            const component = await componentImport();
            return 'default' in component ? component : { default: component };
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            const isChunkLoadError =
                err.message.includes('Failed to fetch dynamically imported module') ||
                err.message.includes('Loading chunk') ||
                err.message.includes('Load chunk');

            if (isChunkLoadError) {
                if (!pageHasBeenForceRefreshed) {
                    // If we haven't refreshed yet, try to refresh the page to get the latest assets
                    window.sessionStorage.setItem(REFRESH_GUARD_KEY, String(Date.now()));
                    window.location.reload();
                    return new Promise(() => { }); // Never resolve to prevent further rendering while reloading
                }
            }

            // If it's not a chunk load error or we've already tried reloading, bubble up the error
            throw error;
        }
    });
}
