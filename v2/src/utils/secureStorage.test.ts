import './test-setup-bun';
import { setSecureItem, getSecureItem, migrateToSecureStorage, getMasterKey } from './secureStorage';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('secureStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    const store = new Map();
    const mockDB = {
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          get: vi.fn().mockImplementation((key) => {
            const req: any = { onsuccess: null, result: store.get(key) };
            setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
            return req;
          }),
          put: vi.fn().mockImplementation((val, key) => {
            store.set(key, val);
            const req: any = { onsuccess: null };
            setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
            return req;
          }),
        })
      }),
      close: vi.fn()
    };

    // Cast window.indexedDB to any to avoid type errors on mocks
    const idb = window.indexedDB as any;
    idb.open.mockImplementation(() => {
      const req: any = {
        onupgradeneeded: null,
        onsuccess: null,
        result: mockDB
      };
      setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
      return req;
    });
  });

  describe('setSecureItem and getSecureItem', () => {
    it('should encrypt and store a value using IndexedDB master key', async () => {
      const key = 'test_key';
      const value = 'secret_value';

      await setSecureItem(key, value);

      const retrieved = await getSecureItem(key);
      expect(retrieved).toBe(value);

      expect(localStorage.getItem('jobfit_secure_test_key')).toBeTruthy();
      expect(localStorage.getItem('jobfit_secure_test_key')).not.toBe(value);
    });

    it('should migrate legacy key and re-encrypt data', async () => {
      // 1. Setup legacy key
      const legacyKeyBytes = new Uint8Array(32).fill(1); // Simple key
      const legacyKeyBase64 = btoa(String.fromCharCode(...legacyKeyBytes));
      localStorage.setItem('jobfit_master_key_v1', legacyKeyBase64);

      const legacyKey = await crypto.subtle.importKey(
        'raw',
        legacyKeyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // 2. Encrypt data with legacy key
      const plaintext = 'legacy_secret';
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        legacyKey,
        new TextEncoder().encode(plaintext)
      );
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);
      const encryptedBase64 = btoa(String.fromCharCode(...combined));

      localStorage.setItem('jobfit_secure_test_legacy', encryptedBase64);

      // 3. Trigger migration
      await getMasterKey();

      // 4. Verify legacy key is gone
      expect(localStorage.getItem('jobfit_master_key_v1')).toBeNull();

      // 5. Verify data is re-encrypted and accessible
      const retrieved = await getSecureItem('test_legacy');
      expect(retrieved).toBe(plaintext);

      // Verify that the stored value is DIFFERENT (re-encrypted with new key)
      const newEncrypted = localStorage.getItem('jobfit_secure_test_legacy');
      expect(newEncrypted).not.toBe(encryptedBase64);

      // Should have opened IndexedDB
      expect(window.indexedDB.open).toHaveBeenCalled();
    });

    it('should migrate data encrypted with legacy fingerprint key', async () => {
      // Mock the browser characteristics to match the test env
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset().toString(),
        screen.colorDepth.toString(),
        screen.width.toString() + 'x' + screen.height.toString()
      ].join('|');

      const encoder = new TextEncoder();
      const hash = await crypto.subtle.digest('SHA-256', encoder.encode(fingerprint));
      const fingerprintKey = await crypto.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // Encrypt data with fingerprint key
      const plaintext = 'fingerprint_secret';
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        fingerprintKey,
        new TextEncoder().encode(plaintext)
      );
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);
      const encryptedBase64 = btoa(String.fromCharCode(...combined));

      // ONLY set the data, no jobfit_master_key_v1 to simulate purely derived key users
      localStorage.setItem('jobfit_secure_test_fingerprint', encryptedBase64);

      // Trigger migration
      await getMasterKey();

      // Verify data is re-encrypted and accessible
      const retrieved = await getSecureItem('test_fingerprint');
      expect(retrieved).toBe(plaintext);

      // Verify that the stored value is DIFFERENT (re-encrypted with new key)
      const newEncrypted = localStorage.getItem('jobfit_secure_test_fingerprint');
      expect(newEncrypted).not.toBe(encryptedBase64);
    });
  });

  describe('security', () => {
    it('should generate non-extractable keys', async () => {
      const spy = vi.spyOn(crypto.subtle, 'generateKey');

      await getMasterKey();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'AES-GCM' }),
        false, // extractable
        ['encrypt', 'decrypt']
      );
    });

    it('should not store master key in localStorage anymore', async () => {
      await setSecureItem('test', 'data');
      expect(localStorage.getItem('jobfit_master_key_v1')).toBeNull();
    });
  });

  describe('migration', () => {
    it('should migrate unencrypted items', async () => {
      localStorage.setItem('old_data', 'plain_text');
      await migrateToSecureStorage('old_data', 'new_secure_data');

      expect(localStorage.getItem('old_data')).toBeNull();
      const retrieved = await getSecureItem('new_secure_data');
      expect(retrieved).toBe('plain_text');
    });
  });
});
