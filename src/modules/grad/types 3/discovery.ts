export interface Program {
    id: string;
    name: string;
    institution: string;
    location: {
        city: string;
        province: string;
        country: string;
    };
    type: 'Masters' | 'PhD' | 'Certificate' | 'Bootcamp';
    url: string;
    keywords: string[]; // e.g. ["Urban Planning", "Sustainability", "Design"]
    isVerified: boolean; // True for our curated flagship list
}

export interface DiscoveryMatch extends Program {
    matchReason: string; // AI generated reason why this fits the user's transcript/goals
    fitScore: number;    // 0-100
}
