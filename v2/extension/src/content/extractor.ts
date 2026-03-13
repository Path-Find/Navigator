import type { ExtractedJob } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
    if (!html) return '';
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return (doc.body.textContent || '').trim();
    } catch {
        // Fallback for environments where DOMParser is unavailable or fails (e.g. background service worker context)
        return html.replace(/<[^>]+>/g, '').trim();
    }
}

function cleanText(text: string): string {
    return text
        .replace(/[\t ]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+$/gm, '')
        .trim();
}

function getMeta(name: string): string | null {
    const el =
        document.querySelector(`meta[property="${name}"]`) ||
        document.querySelector(`meta[name="${name}"]`);
    return el?.getAttribute('content')?.trim() || null;
}

function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
}

// ─── JSON-LD (Layer 1 — highest confidence) ─────────────────────────────

type JsonLdNode = Record<string, unknown>;
type JsonLdData = JsonLdNode | unknown[] | null;

interface JsonLdAddress {
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
    address?: JsonLdAddress;
}

interface JsonLdSalary {
    currency?: string;
    value?: number | { minValue?: number; maxValue?: number; value?: number; unitText?: string };
}

function findJobPosting(data: JsonLdData): JsonLdNode | null {
    if (!data) return null;
    if (Array.isArray(data)) {
        for (const item of data) {
            const found = findJobPosting(item as JsonLdData);
            if (found) return found;
        }
        return null;
    }
    const node = data as JsonLdNode;
    if (node['@type'] === 'JobPosting') return node;
    if (node['@graph']) return findJobPosting(node['@graph'] as JsonLdData);
    return null;
}

function formatLocation(loc: string | JsonLdAddress | JsonLdAddress[] | null): string | null {
    if (!loc) return null;
    if (typeof loc === 'string') return loc;
    if (Array.isArray(loc)) {
        const locations = loc.map((l) => formatLocation(l)).filter(Boolean);
        return locations.length ? locations.join(' · ') : null;
    }
    const addr = loc.address || loc;
    const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
}

function formatSalary(salary: JsonLdSalary | null): string | null {
    if (!salary) return null;
    const currency = salary.currency || 'USD';
    const value = salary.value;
    if (!value) return null;

    const fmt = (n: number) => {
        if (n >= 1000) return `${Math.round(n / 1000)}k`;
        return String(n);
    };

    if (typeof value === 'object') {
        const min = value.minValue;
        const max = value.maxValue;
        const single = value.value;
        const unit = (value.unitText || 'YEAR').toLowerCase();
        const suffix = unit === 'hour' ? '/hr' : '/yr';

        if (min && max) return `${currency} ${fmt(min)} – ${fmt(max)}${suffix}`;
        if (single) return `${currency} ${fmt(single)}${suffix}`;
    }
    if (typeof value === 'number') return `${currency} ${fmt(value)}/yr`;
    return null;
}

function extractFromJsonLd(): Partial<ExtractedJob> | null {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
        try {
            const data = JSON.parse(script.textContent || '') as JsonLdData;
            const posting = findJobPosting(data);
            if (posting) {
                const hiringOrg = posting.hiringOrganization as { name?: string } | undefined;
                return {
                    title: (posting.title as string | undefined) || null,
                    company: hiringOrg?.name || null,
                    location: formatLocation(posting.jobLocation as string | JsonLdAddress | JsonLdAddress[] | null),
                    salary: formatSalary((posting.baseSalary || posting.estimatedSalary) as JsonLdSalary | null),
                    description: posting.description ? stripHtml(posting.description as string) : '',
                };
            }
        } catch { /* malformed JSON-LD, skip */ }
    }
    return null;
}

// ─── Meta Tags (Layer 2) ────────────────────────────────────────────────

function extractFromMeta(): Partial<ExtractedJob> {
    return {
        title: getMeta('og:title') || null,
        company: getMeta('og:site_name') || null,
        description: getMeta('og:description') || getMeta('description') || '',
    };
}

// ─── DOM Heuristics (Layer 3 — site-specific) ───────────────────────────

function textOf(selector: string): string | null {
    return document.querySelector(selector)?.textContent?.trim() || null;
}

function extractLinkedIn(): Partial<ExtractedJob> {
    return {
        title:
            textOf('.job-details-jobs-unified-top-card__job-title') ||
            textOf('.jobs-unified-top-card__job-title') ||
            textOf('.topcard__title') || null,
        company:
            textOf('.job-details-jobs-unified-top-card__company-name') ||
            textOf('.jobs-unified-top-card__company-name') ||
            textOf('.topcard__org-name-link') || null,
        location:
            textOf('.job-details-jobs-unified-top-card__bullet') ||
            textOf('.jobs-unified-top-card__bullet') || null,
    };
}

function extractIndeed(): Partial<ExtractedJob> {
    return {
        title:
            textOf('.jobsearch-JobInfoHeader-title') ||
            textOf('[data-testid="jobsearch-JobInfoHeader-title"]') || null,
        company:
            textOf('[data-company-name]') ||
            textOf('[data-testid="inlineHeader-companyName"]') || null,
        location: textOf('[data-testid="inlineHeader-companyLocation"]') || null,
        salary: textOf('#salaryInfoAndJobType') || null,
    };
}

function extractGreenhouse(): Partial<ExtractedJob> {
    return {
        title: textOf('.app-title') || null,
        company: textOf('.company-name') || null,
        location: textOf('.location') || null,
    };
}

function extractLever(): Partial<ExtractedJob> {
    return {
        title: textOf('.posting-headline h2') || null,
        company: null, // Lever pages use subdomain as company
        location: textOf('.posting-categories .sort-by-time .posting-category:first-child') || null,
    };
}

function extractWorkday(): Partial<ExtractedJob> {
    return {
        title:
            textOf('[data-automation-id="jobPostingHeader"]') ||
            textOf('h2[data-automation-id="jobTitle"]') || null,
        company: textOf('[data-automation-id="company"]') || null,
        location: textOf('[data-automation-id="locations"]') || null,
    };
}

function extractGenericDOM(): Partial<ExtractedJob> {
    const h1 = document.querySelector('h1');
    return {
        title: h1?.textContent?.trim() || null,
        company: null,
        location: null,
    };
}

function extractFromDOM(): Partial<ExtractedJob> {
    const host = window.location.hostname;
    if (host.includes('linkedin.com')) return extractLinkedIn();
    if (host.includes('indeed.com') || host.includes('indeed.')) return extractIndeed();
    if (host.includes('greenhouse.io')) return extractGreenhouse();
    if (host.includes('lever.co')) return extractLever();
    if (host.includes('workday.com') || host.includes('myworkdayjobs.com')) return extractWorkday();
    return extractGenericDOM();
}

// ─── Clean Content (Layer 4 — fallback body text) ───────────────────────

function extractCleanContent(): string {
    // Prefer semantic main content areas
    const main = document.querySelector(
        'main, article, [role="main"], .job-description, #job-description, ' +
        '.jobs-description__content, #jobDescriptionText, .posting-page'
    );
    if (main) return cleanText((main as HTMLElement).innerText);

    // Fallback: clone body, strip nav/header/footer/sidebar
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(
        'nav, header, footer, aside, script, style, noscript, ' +
        '[role="navigation"], [role="banner"], [role="contentinfo"]'
    ).forEach(el => el.remove());

    return truncate(cleanText(clone.innerText), 15000);
}

// ─── Main Extraction Entrypoint ─────────────────────────────────────────

export function extractJobData(): ExtractedJob {
    const url = window.location.href;

    // Layer 1: JSON-LD (best)
    const jsonLd = extractFromJsonLd();
    if (jsonLd?.title) {
        return {
            title: jsonLd.title,
            company: jsonLd.company || null,
            location: jsonLd.location || null,
            salary: jsonLd.salary || null,
            description: jsonLd.description || extractCleanContent(),
            url,
            source: 'json_ld',
            confidence: 'high',
        };
    }

    // Layer 2: Site-specific DOM selectors
    const dom = extractFromDOM();
    if (dom.title) {
        return {
            title: dom.title,
            company: dom.company || null,
            location: dom.location || null,
            salary: dom.salary || null,
            description: extractCleanContent(),
            url,
            source: 'dom',
            confidence: 'medium',
        };
    }

    // Layer 3: Meta tags + clean content
    const meta = extractFromMeta();
    return {
        title: meta.title || document.title || null,
        company: meta.company || null,
        location: null,
        salary: null,
        description: meta.description || extractCleanContent(),
        url,
        source: meta.title ? 'meta' : 'fallback',
        confidence: meta.title ? 'medium' : 'low',
    };
}
