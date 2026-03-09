export interface ParsedSalary {
    min: number;
    max: number;
    midpoint: number;
}

export function parseSalary(raw: string): ParsedSalary | null {
    if (!raw) return null;

    const s = raw.toLowerCase().trim();

    // Detect hourly and convert to annual (2080 work hours/year)
    const isHourly = /\/h(ou)?r|per hour|hourly/.test(s);
    const multiplier = isHourly ? 2080 : 1;

    const extractNum = (token: string): number | null => {
        // Strip currency symbols, spaces
        const cleaned = token.replace(/[$,\s]/g, '');
        const match = cleaned.match(/^([\d.]+)(k?)$/i);
        if (!match) return null;
        const base = parseFloat(match[1]);
        const isK = match[2].toLowerCase() === 'k';
        return (isK ? base * 1000 : base) * multiplier;
    };

    // Try to find two numbers separated by a range delimiter
    const rangePattern = /([$]?[\d,]+\.?\d*k?)\s*(?:[-–—]|to)\s*([$]?[\d,]+\.?\d*k?)/i;
    const rangeMatch = s.match(rangePattern);
    if (rangeMatch) {
        const min = extractNum(rangeMatch[1]);
        const max = extractNum(rangeMatch[2]);
        if (min !== null && max !== null && min <= max) {
            return { min, max, midpoint: (min + max) / 2 };
        }
    }

    // Single number (e.g. "up to $90K", "$90K+", "$100,000/year")
    const singleMatch = s.match(/([\d,]+\.?\d*k?)/i);
    if (singleMatch) {
        const num = extractNum(singleMatch[1]);
        if (num !== null && num > 0) {
            return { min: num, max: num, midpoint: num };
        }
    }

    return null;
}

export function formatSalary(amount: number): string {
    if (amount >= 1000) {
        const k = amount / 1000;
        return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
}
