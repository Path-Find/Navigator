/**
 * Converts a string to Title Case.
 * Example: "PRINCIPAL COMPETENCIES" -> "Principal Competencies"
 * Example: "graphic design" -> "Graphic Design"
 */
export const toTitleCase = (str: string): string => {
    if (!str) return '';

    // If the string is already mixed case, it might be an acronym (e.g. "GIS", "React").
    // We only want to force Title Case if it's all uppercase or all lowercase.
    const isAllUpper = str === str.toUpperCase() && str !== str.toLowerCase();
    const isAllLower = str === str.toLowerCase() && str !== str.toUpperCase();

    if (!isAllUpper && !isAllLower) return str;

    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Converts a string to Sentence Case.
 * Example: "DEVELOP A MARKETING STRATEGY" -> "Develop a marketing strategy"
 */
export const toSentenceCase = (str: string): string => {
    if (!str) return '';

    const isAllUpper = str === str.toUpperCase() && str !== str.toLowerCase();
    const isAllLower = str === str.toLowerCase() && str !== str.toUpperCase();

    if (!isAllUpper && !isAllLower) return str;

    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};
