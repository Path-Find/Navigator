import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
    it('initializes with default value', () => {
        const { result } = renderHook(() => useLocalStorage('test-key-init', 'default'));
        expect(result.current[0]).toBe('default');
    });

    it('updates local storage when value changes', () => {
        const { result } = renderHook(() => useLocalStorage('test-key-update', 'default'));

        act(() => {
            result.current[1]('new-value');
        });

        expect(result.current[0]).toBe('new-value');
        expect(window.localStorage.getItem('test-key-update')).toBe(JSON.stringify('new-value'));
    });

    it('should maintain stable identity of setValue function across re-renders', () => {
        const { result, rerender } = renderHook(
            ({ key }) => useLocalStorage(key, 'default'),
            {
                initialProps: { key: 'test-key-stable' }
            }
        );

        const initialSetValue = result.current[1];

        // Re-render with same props
        rerender({ key: 'test-key-stable' });

        const nextSetValue = result.current[1];

        expect(nextSetValue).toBe(initialSetValue);
    });

    it('should update identity if key changes', () => {
        const { result, rerender } = renderHook(
            ({ key }) => useLocalStorage(key, 'default'),
            {
                initialProps: { key: 'test-key-1' }
            }
        );

        const initialSetValue = result.current[1];

        // Re-render with different key
        rerender({ key: 'test-key-2' });

        const nextSetValue = result.current[1];

        expect(nextSetValue).not.toBe(initialSetValue);
    });
});
