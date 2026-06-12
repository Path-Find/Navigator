/**
 * Employers known to prohibit AI-assisted job applications.
 *
 * Add entries here when a policy is confirmed — either from the job posting
 * language or from direct knowledge. The text scan in detectAiBan catches
 * postings that include the policy inline; this list catches cases where
 * the employer has the policy but doesn't restate it in every posting.
 *
 * Fields:
 *   name        — canonical employer name (used in the ban reason message)
 *   aliases     — other names / abbreviations the employer might appear as
 *   reason      — one-line description of the known policy
 *   source      — how the policy was confirmed ("posting text", "HR policy", etc.)
 */

export interface KnownAiBanEmployer {
    name: string;
    aliases: string[];
    reason: string;
    source: string;
}

export const KNOWN_AI_BAN_EMPLOYERS: KnownAiBanEmployer[] = [
    {
        name: 'Toronto Transit Commission',
        aliases: ['TTC'],
        reason: 'TTC prohibits AI-assisted applications, cover letters, and interview preparation.',
        source: 'Direct knowledge — confirmed policy',
    },
    // Add entries as new cases are confirmed. Format:
    // {
    //     name: 'Employer Name',
    //     aliases: ['Short form', 'Other name'],
    //     reason: 'Brief description of their policy.',
    //     source: 'posting text | HR policy | direct knowledge',
    // },
];
