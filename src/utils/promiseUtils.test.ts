import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withTimeout, OperationQueue } from './promiseUtils';

describe('withTimeout', () => {
    it('resolves with the value when the promise completes in time', async () => {
        const result = await withTimeout(Promise.resolve(42), 1000);
        expect(result).toBe(42);
    });

    it('rejects with the default message when the promise times out', async () => {
        vi.useFakeTimers();

        const slow = new Promise<never>(() => {});
        const promise = withTimeout(slow, 5000);

        vi.advanceTimersByTime(5001);

        await expect(promise).rejects.toThrow('Operation timed out after 5000ms');

        vi.useRealTimers();
    });

    it('rejects with a custom message when provided', async () => {
        vi.useFakeTimers();

        const slow = new Promise<never>(() => {});
        const promise = withTimeout(slow, 100, 'Cloud request took too long');

        vi.advanceTimersByTime(101);

        await expect(promise).rejects.toThrow('Cloud request took too long');

        vi.useRealTimers();
    });

    it('propagates a rejection from the wrapped promise', async () => {
        const failed = Promise.reject(new Error('original error'));
        await expect(withTimeout(failed, 1000)).rejects.toThrow('original error');
    });

    it('uses 10000ms as the default timeout', async () => {
        vi.useFakeTimers();

        const slow = new Promise<never>(() => {});
        const promise = withTimeout(slow);

        vi.advanceTimersByTime(9999);
        // Not yet timed out
        vi.advanceTimersByTime(2);

        await expect(promise).rejects.toThrow('Operation timed out after 10000ms');

        vi.useRealTimers();
    });
});

describe('OperationQueue', () => {
    beforeEach(() => {
        vi.useRealTimers();
    });

    it('executes a single task and returns its result', async () => {
        const queue = new OperationQueue();
        const result = await queue.enqueue(() => Promise.resolve('hello'));
        expect(result).toBe('hello');
    });

    it('executes tasks sequentially, not concurrently', async () => {
        const queue = new OperationQueue();
        const order: number[] = [];

        const t1 = queue.enqueue(async () => {
            await new Promise(r => setTimeout(r, 20));
            order.push(1);
        });

        const t2 = queue.enqueue(async () => {
            order.push(2);
        });

        await Promise.all([t1, t2]);

        expect(order).toEqual([1, 2]);
    });

    it('continues processing after a task throws', async () => {
        const queue = new OperationQueue();
        const results: string[] = [];

        const t1 = queue.enqueue(async () => {
            throw new Error('task 1 failed');
        });

        const t2 = queue.enqueue(async () => {
            results.push('task 2 ran');
        });

        await expect(t1).rejects.toThrow('task 1 failed');
        await t2;

        expect(results).toEqual(['task 2 ran']);
    });

    it('propagates errors to the specific caller that threw', async () => {
        const queue = new OperationQueue();

        await expect(
            queue.enqueue(() => Promise.reject(new Error('boom')))
        ).rejects.toThrow('boom');
    });

    it('handles multiple queued tasks in order', async () => {
        const queue = new OperationQueue();
        const order: number[] = [];

        await Promise.all([
            queue.enqueue(async () => { order.push(1); }),
            queue.enqueue(async () => { order.push(2); }),
            queue.enqueue(async () => { order.push(3); }),
        ]);

        expect(order).toEqual([1, 2, 3]);
    });
});
