/**
 * Dynamically loads pdf.js from CDN using ESM dynamic imports.
 * Returns the pdfjsLib instance.
 */
export const loadPdfJS = async (): Promise<PdfjsLib> => {
    if (window.pdfjsLib) {
        return window.pdfjsLib;
    }

    const version = '4.3.136';
    const urls = [
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.min.mjs`,
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.min.mjs`,
        `https://unpkg.com/pdfjs-dist@${version}/build/pdf.min.mjs`
    ];

    for (const url of urls) {
        try {
            // Using dynamic import for ESM support in modern browsers
            const pdfjsLib = await import(/* @vite-ignore */ url);
            
            if (pdfjsLib) {
                // Set the worker source to the matching version
                const workerUrl = url.replace('pdf.min.mjs', 'pdf.worker.min.mjs');
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
                
                // Also attach to window for any legacy/global checks
                window.pdfjsLib = pdfjsLib;
                return pdfjsLib;
            }
        } catch (err) {
            console.warn(`Failed to load pdf.js from ${url}, trying next...`, err);
        }
    }

    throw new Error('All PDF.js CDN locations failed to load. Please check your internet connection.');
};
