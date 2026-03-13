import { useState, useCallback } from 'react';

/**
 * Custom hook to persist state in localStorage
 * Automatically syncs with localStorage and updates on changes
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get initial value from localStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook for persisting simple string values
 */
export function usePersistedString(key: string, initialValue: string): [string, (value: string) => void] {
  return useLocalStorage<string>(key, initialValue);
}

/**
 * Hook for persisting boolean values
 */
export function usePersistedBoolean(key: string, initialValue: boolean): [boolean, (value: boolean) => void] {
  return useLocalStorage<boolean>(key, initialValue);
}
