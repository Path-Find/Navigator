interface PdfjsLib {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument(params: { data: string }): { promise: Promise<PDFDocumentProxy> };
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
