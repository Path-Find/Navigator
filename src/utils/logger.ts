/**
 * Logger — production-safe console wrapper.
 *
 * Logger.log and Logger.debug are no-ops in production builds.
 * Logger.warn and Logger.error always pass through — they signal real issues.
 *
 * Usage: replace console.log / console.debug with Logger.log / Logger.debug
 * in service and module files. console.warn / console.error can be replaced
 * with Logger.warn / Logger.error for consistency, but are not required to be.
 */
const isDev = import.meta.env.DEV;

export const Logger = {
    log: (...args: unknown[]): void => {
        if (isDev) console.log(...args);
    },
    debug: (...args: unknown[]): void => {
        if (isDev) console.debug(...args);
    },
    warn: (...args: unknown[]): void => {
        console.warn(...args);
    },
    error: (...args: unknown[]): void => {
        console.error(...args);
    },
};
