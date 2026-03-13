/**
 * Simple Browser Fingerprinting Utility
 * 
 * Generates a unique-ish ID for the device based on browser characteristics.
 * This is "Level 1" abuse prevention - easy to bypass but stops low-effort spam.
 */

import { LocalStorage } from './localStorage';
import { STORAGE_KEYS } from '../constants';

export const getDeviceFingerprint = async (): Promise<string> => {
    try {
        // Check for existing ID
        const stored = LocalStorage.get(STORAGE_KEYS.DEVICE_ID);
        if (stored) return stored;

        // Generate new simple fingerprint
        const components = [
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset(),
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            // Canvas Fingerprinting (Basic)
            getCanvasFingerprint()
        ];

        // Create hash
        const str = components.join('|');
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Store and return
        LocalStorage.set(STORAGE_KEYS.DEVICE_ID, hashHex);
        return hashHex;
    } catch {
        console.warn("Fingerprinting failed, generating random backup ID");
        // Fallback to random ID if fingerprinting fails (e.g. strict privacy settings)
        // We prefer a random ID over nothing, so we can at least track *this* session
        const randomId = crypto.randomUUID();
        LocalStorage.set(STORAGE_KEYS.DEVICE_ID, randomId);
        return randomId;
    }
};

const getCanvasFingerprint = (): string => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        canvas.width = 200;
        canvas.height = 50;

        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Navigator-FP", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Navigator-FP", 4, 17);

        return canvas.toDataURL();
    } catch {
        return 'canvas-error';
    }
}
