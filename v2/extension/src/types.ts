export interface ExtractedJob {
    title: string | null;
    company: string | null;
    location: string | null;
    salary: string | null;
    description: string;
    url: string;
    source: 'json_ld' | 'meta' | 'dom' | 'fallback';
    confidence: 'high' | 'medium' | 'low';
}

export interface ExtractionResponse {
    success: boolean;
    data?: ExtractedJob;
    error?: string;
}
