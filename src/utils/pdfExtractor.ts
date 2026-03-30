import { loadPdfJS } from "./pdfLoader";

/**
 * Extracts text from a base64 encoded PDF file.
 */
export const extractPdfText = async (base64: string): Promise<string> => {
    try {
        const pdfjsLib = await loadPdfJS();
        if (!pdfjsLib) throw new Error("PDF library not loaded");

        // Convert base64 to Uint8Array
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        const pagesContent: string[] = [];

        // Sequential processing to prevent memory spikes on large PDFs
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            pagesContent.push(pageText);
        }

        const rawContent = pagesContent.join('\n');

        // Clean common PDF extraction artifacts (ligatures etc)
        const cleaned = rawContent
            .replace(/f\s+i/g, 'fi')
            .replace(/f\s+l/g, 'fl')
            .replace(/fi\s+/g, 'fi')
            .replace(/fl\s+/g, 'fl')
            .replace(/ti\s+/g, 'ti')
            .replace(/ff\s+/g, 'ff')
            .replace(/ft\s+/g, 'ft')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleaned.length < 10) {
            throw new Error("PDF appears empty or contains no readable text.");
        }

        return cleaned + '\n';
    } catch (err) {
        console.error("[PdfService] Extraction failed:", err);
        throw err;
    }
}
