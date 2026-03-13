export interface SEORoleBucket {
    id: string; // The canonical ID (e.g., 'software-engineer')
    slug: string; // The URL slug (e.g., 'software-engineer')
    title: string; // The display title (e.g., 'Software Engineer')
    keywords: string[]; // Triggers for mapping (e.g., ['developer', 'programmer', 'coding'])
    description: string; // Meta description template
    content: {
        headline: string;
        subheadline: string;
        topSkills: string[];
        commonMistakes: string[];
        proTip: string;
        promptAdvice?: string[];
        tailoringFocus?: string[];
        coverLetterStrategy?: string;
    };
}

export interface SEOMappingResult {
    bucket: SEORoleBucket;
    originalQuery: string;
    isExactMatch: boolean;
}
