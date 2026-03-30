interface PdfjsLib {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument(params: { data: string | Uint8Array }): { promise: Promise<PDFDocumentProxy> };
}

interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFPageProxy {
    getTextContent(): Promise<{ items: Array<{ str: string }> }>;
}

interface Window {
    pdfjsLib: PdfjsLib | undefined;
}
