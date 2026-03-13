/**
 * Promise utilities for stability and timeout management.
 */

/**
 * Wraps a promise with a timeout.
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message
 */
export async function withTimeout<T>(
    promise: Promise<T> | PromiseLike<T>,
    timeoutMs: number = 10000,
    errorMessage: string = 'Operation timed out after ' + timeoutMs + 'ms'
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}
