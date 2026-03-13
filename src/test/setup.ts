import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      return Object.keys(store)[index] || null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.matchMedia (JSDOM doesn't implement it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Web Crypto API for tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => {
      const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
      return `${s4()}${s4()}-${s4()}-4${s4().slice(1)}-${s4()}-${s4()}${s4()}${s4()}`;
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: vi.fn(async () => new ArrayBuffer(32)),
      importKey: vi.fn(async () => ({} as CryptoKey)),
      generateKey: vi.fn(async () => ({} as CryptoKey)),
      deriveKey: vi.fn(async () => ({} as CryptoKey)),
      encrypt: vi.fn(async (_algo, _key, data) => {
        // Simple mock: just return the data with a prefix
        const prefix = new TextEncoder().encode('encrypted:');
        const combined = new Uint8Array(prefix.length + (data as ArrayBuffer).byteLength);
        combined.set(prefix);
        combined.set(new Uint8Array(data as ArrayBuffer), prefix.length);
        return combined.buffer;
      }),
      decrypt: vi.fn(async (_algo, _key, data) => {
        // Simple mock: remove the prefix
        const prefix = new TextEncoder().encode('encrypted:');
        return (data as ArrayBuffer).slice(prefix.length);
      }),
    },
  },
});

// Mock IndexedDB for tests
const idbMock = {
  open: vi.fn().mockImplementation(() => {
    const request: any = {
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
      result: {
        objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
        createObjectStore: vi.fn().mockReturnValue({}),
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue({
            get: vi.fn().mockReturnValue({ onsuccess: null }),
            put: vi.fn().mockReturnValue({ onsuccess: null }),
            delete: vi.fn().mockReturnValue({ onsuccess: null }),
          }),
          oncomplete: null,
          onerror: null,
        }),
        close: vi.fn(),
      },
    };
    // Simulate async success
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess();
    }, 0);
    return request;
  }),
};

Object.defineProperty(window as any, 'indexedDB', {
  value: idbMock,
  configurable: true,
  writable: true
});
