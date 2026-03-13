
// Mock localStorage
const store = new Map<string, string>();

if (typeof (globalThis as any).localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index: number) => Array.from(store.keys())[index] || null,
  } as any;
}

// Mock Navigator
if (typeof (globalThis as any).navigator === 'undefined') {
  // @ts-expect-error -- mocking read-only global for test environment
  (globalThis as any).navigator = {
    userAgent: 'Mozilla/5.0 (Test Browser; Linux x86_64)',
    language: 'en-US',
  } as any;
}

// Mock Screen
if (typeof (globalThis as any).screen === 'undefined') {
  // @ts-expect-error -- mocking read-only global for test environment
  (globalThis as any).screen = {
    width: 1920,
    height: 1080,
    colorDepth: 24,
  } as any;
}
