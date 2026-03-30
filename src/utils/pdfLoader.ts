/**
 * Dynamically loads pdf.js from CDN when needed.
 * Returns the pdfjsLib instance.
 */
export const loadPdfJS = async (): Promise<PdfjsLib> => {
    if (window.pdfjsLib) {
        return window.pdfjsLib;
    }

    const loadScript = (src: string, integrity?: string): Promise<PdfjsLib> => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            if (integrity) {
                script.integrity = integrity;
                script.crossOrigin = 'anonymous';
            }
            script.referrerPolicy = 'no-referrer';

            script.onload = () => {
                const pdfjsLib = window.pdfjsLib;
                if (pdfjsLib) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = src.replace('pdf.min.js', 'pdf.worker.min.js');
                    resolve(pdfjsLib);
                } else {
                    reject(new Error('pdf.js loaded but pdfjsLib not found on window'));
                }
            };
            
            script.onerror = () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
                reject(new Error(`Failed to load pdf.js script from ${src}`));
            };

            document.head.appendChild(script);
        });
    };

    try {
        // Primary: cdnjs
        return await loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
            'sha512-6WnuP6eYfC27zSAnRL2oK12L7Q79oR1jL9PajE+6N386Ino7Yp95YRE1Q1QYqGCS/zW64B9M3T1oV7E+V2N2lA=='
        );
    } catch (err) {
        console.warn("Primary PDF CDN failed, trying secondary (unpkg)...", err);
        try {
            return await loadScript('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js');
        } catch (err2) {
            console.warn("Secondary PDF CDN failed, trying tertiary (jsdelivr)...", err2);
            return await loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js');
        }
    }
};
