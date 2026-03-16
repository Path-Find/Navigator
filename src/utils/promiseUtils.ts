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

/**
 * Simple queue to ensure async tasks run sequentially.
 * Useful for preventing race conditions in storage operations.
 */
export class OperationQueue {
    private queue: Promise<any> = Promise.resolve();

    /**
     * Executes a task in the queue, ensuring it runs after all previous tasks.
     */
    async enqueue<T>(task: () => Promise<T>): Promise<T> {
        const nextTask = this.queue.then(async () => {
            try {
                return await task();
            } catch (err) {
                // Return failure to caller but allow queue to proceed
                throw err;
            }
        });
        
        // Update the tail of the queue
        this.queue = nextTask.catch(() => {});
        
        return nextTask;
    }
}
