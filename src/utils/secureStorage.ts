/**
 * Secure Storage Utility using Web Crypto API
 * Encrypts sensitive data before storing in localStorage.
 * Master key is stored securely in IndexedDB and is non-extractable.
 */

const STORAGE_PREFIX = 'jobfit_secure_';
const ENCRYPTION_ALGORITHM = 'AES-GCM';

// IndexedDB Constants
const DB_NAME = 'JobFitSecureStorage';
const STORE_NAME = 'Keys';
const KEY_PATH = 'masterKey';
const DB_VERSION = 1;

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets the master key from IndexedDB
 */
async function getStoredKey(db: IDBDatabase): Promise<CryptoKey | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY_PATH);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores the master key in IndexedDB
 */
async function storeKey(db: IDBDatabase, key: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(key, KEY_PATH);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets or creates the master encryption key.
 * 
 * Primary storage is IndexedDB (non-extractable).
 * Migration: If a key exists in localStorage, it's imported and moved to IndexedDB.
 */
async function getLegacyFingerprintKey(): Promise<CryptoKey> {
  // Create a stable fingerprint from browser/device characteristics
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.colorDepth.toString(),
    screen.width.toString() + 'x' + screen.height.toString()
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hash = await crypto.subtle.digest('SHA-256', data);

  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: ENCRYPTION_ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function getMasterKey(): Promise<CryptoKey> {
  const db = await openDB();
  let key = await getStoredKey(db);

  if (key) return key;

  // Check for legacy key in localStorage
  const legacyKeyBase64 = localStorage.getItem('jobfit_master_key_v1');
  if (legacyKeyBase64) {
    try {
      const binaryKey = Uint8Array.from(atob(legacyKeyBase64), c => c.charCodeAt(0));
      const legacyKey = await crypto.subtle.importKey(
        'raw',
        binaryKey,
        { name: ENCRYPTION_ALGORITHM },
        false,
        ['encrypt', 'decrypt']
      );

      // Generate new secure key
      key = await crypto.subtle.generateKey(
        {
          name: ENCRYPTION_ALGORITHM,
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );

      // Re-encrypt existing data with new key
      await migrateLegacyData(legacyKey, key);

      // Store new key in IndexedDB
      await storeKey(db, key);

      // Remove legacy key from localStorage
      localStorage.removeItem('jobfit_master_key_v1');

      return key;
    } catch (e) {
      console.error('Failed to migrate legacy key:', e);
    }
  }

  // Check for data encrypted with the vulnerable fingerprint-derived key
  let hasLegacyData = false;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      hasLegacyData = true;
      break;
    }
  }

  if (hasLegacyData) {
    try {
      const fingerprintKey = await getLegacyFingerprintKey();

      key = await crypto.subtle.generateKey(
        {
          name: ENCRYPTION_ALGORITHM,
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );

      await migrateLegacyData(fingerprintKey, key);
      await storeKey(db, key);

      return key;
    } catch (e) {
      console.error('Failed to migrate fingerprint-derived key:', e);
    }
  }

  // Generate new random non-extractable key
  key = await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: 256
    },
    false, // extractable: false (CRITICAL)
    ['encrypt', 'decrypt']
  );

  await storeKey(db, key);
  return key;
}

/**
 * Encrypts a string value using AES-GCM
 */
async function encrypt(plaintext: string, key?: CryptoKey): Promise<string> {
  try {
    const encryptionKey = key || await getMasterKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      encryptionKey,
      data
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data', { cause: error });
  }
}

/**
 * Decrypts an encrypted string value
 */
async function decrypt(encryptedData: string, key?: CryptoKey): Promise<string> {
  try {
    const decryptionKey = key || await getMasterKey();
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      decryptionKey,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Failed to decrypt data', { cause: error });
  }
}

/**
 * Re-encrypts all data with a new key
 */
async function migrateLegacyData(oldKey: CryptoKey, newKey: CryptoKey): Promise<void> {
  // Use standard loop for better compatibility (especially with mocks)
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      keys.push(k);
    }
  }

  for (const k of keys) {
    const value = localStorage.getItem(k);
    if (value) {
      try {
        const decrypted = await decrypt(value, oldKey);
        const encrypted = await encrypt(decrypted, newKey);
        localStorage.setItem(k, encrypted);
      } catch (e) {
        console.error(`Failed to migrate item ${k}:`, e);
      }
    }
  }
}

/**
 * Securely stores a value in localStorage with encryption
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  const encrypted = await encrypt(value);
  localStorage.setItem(STORAGE_PREFIX + key, encrypted);
}

/**
 * Retrieves and decrypts a value from localStorage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  const encrypted = localStorage.getItem(STORAGE_PREFIX + key);
  if (!encrypted) return null;

  try {
    return await decrypt(encrypted);
  } catch (error) {
    console.error('Failed to decrypt stored data:', error);
    localStorage.removeItem(STORAGE_PREFIX + key);
    return null;
  }
}

/**
 * Removes a secure item from storage
 */
export function removeSecureItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Migrates an existing unencrypted item to encrypted storage
 */
export async function migrateToSecureStorage(oldKey: string, newKey: string): Promise<void> {
  const value = localStorage.getItem(oldKey);
  if (value) {
    await setSecureItem(newKey, value);
    localStorage.removeItem(oldKey);
  }
}
