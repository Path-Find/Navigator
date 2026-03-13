/**
 * Dynamically loads pdf.js from CDN when needed.
 * Returns the pdfjsLib instance.
 */
export const loadPdfJS = async (): Promise<PdfjsLib> => {
    if (window.pdfjsLib) {
        return window.pdfjsLib;
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.integrity = 'sha512-6WnuP6eYfC27zSAnRL2oK12L7Q79oR1jL9PajE+6N386Ino7Yp95YRE1Q1QYqGCS/zW64B9M3T1oV7E+V2N2lA==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';

        script.onload = () => {
            const pdfjsLib = window.pdfjsLib;
            if (pdfjsLib) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(pdfjsLib);
            } else {
                reject(new Error('pdf.js loaded but pdfjsLib not found on window'));
            }
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load pdf.js script'));
        };

        document.head.appendChild(script);
    });
};
