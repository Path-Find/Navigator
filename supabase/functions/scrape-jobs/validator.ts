// Helper to check if string is a strict IPv4 address (canonical format)
function isStrictIPv4(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    for (const part of parts) {
        // Must be digits only
        if (!/^\d+$/.test(part)) return false;

        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) return false;

        // Disallow leading zeros (unless it's just "0") to prevent octal interpretation confusion
        if (part.length > 1 && part.startsWith('0')) return false;
    }
    return true;
}

// Helper to check if an IP address is private or reserved
export function isPrivateIP(ip: string): boolean {
    // IPv6 logic (Check first to handle IPv4-mapped IPv6)
    if (ip.includes(':')) {
        const lower = ip.toLowerCase();

        // ::1 (Loopback)
        if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;

        // :: (Unspecified)
        if (lower === '::' || lower === '0:0:0:0:0:0:0:0') return true;

        // fc00::/7 (Unique Local)
        if (lower.startsWith('fc') || lower.startsWith('fd')) return true;

        // fe80::/10 (Link-local)
        if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;

        // IPv4-mapped IPv6 ::ffff:0:0/96
        if (lower.startsWith('::ffff:')) {
            const v4Part = ip.split(':').pop() || '';
            return isPrivateIP(v4Part);
        }

        // 64:ff9b::/96 (IPv4/IPv6 translation)
        if (lower.startsWith('64:ff9b:')) return true;

        // 2001:db8::/32 (Documentation)
        if (lower.startsWith('2001:db8:')) return true;

        // 2002::/16 (6to4) - can be used for encapsulation
        if (lower.startsWith('2002:')) return true;

        return false;
    }

    // IPv4 logic
    if (ip.includes('.')) {
        // Basic format check
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4 || parts.some(isNaN)) return false;

        // 0.0.0.0/8 (Current network)
        if (parts[0] === 0) return true;

        // 10.0.0.0/8 (Private network)
        if (parts[0] === 10) return true;

        // 100.64.0.0/10 (Shared Address Space)
        if (parts[0] === 100 && (parts[1] >= 64 && parts[1] <= 127)) return true;

        // 127.0.0.0/8 (Loopback)
        if (parts[0] === 127) return true;

        // 169.254.0.0/16 (Link-local / APIPA)
        if (parts[0] === 169 && parts[1] === 254) return true;

        // 172.16.0.0/12 (Private network)
        if (parts[0] === 172 && (parts[1] >= 16 && parts[1] <= 31)) return true;

        // 192.0.0.0/24 (IETF Protocol Assignments)
        if (parts[0] === 192 && parts[1] === 0 && parts[2] === 0) return true;

        // 192.0.2.0/24 (TEST-NET-1)
        if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;

        // 192.88.99.0/24 (6to4 Relay Anycast)
        if (parts[0] === 192 && parts[1] === 88 && parts[2] === 99) return true;

        // 192.168.0.0/16 (Private network)
        if (parts[0] === 192 && parts[1] === 168) return true;

        // 198.18.0.0/15 (Network Benchmark)
        if (parts[0] === 198 && (parts[1] >= 18 && parts[1] <= 19)) return true;

        // 198.51.100.0/24 (TEST-NET-2)
        if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;

        // 203.0.113.0/24 (TEST-NET-3)
        if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;

        // 224.0.0.0/4 (Multicast)
        if (parts[0] >= 224 && parts[0] <= 239) return true;

        // 240.0.0.0/4 (Reserved)
        if (parts[0] >= 240) return true;

        // 255.255.255.255 (Broadcast)
        if (parts[0] === 255 && parts[1] === 255 && parts[2] === 255 && parts[3] === 255) return true;

        return false;
    }

    return false;
}

type DnsResolver = (hostname: string) => Promise<string[]>;

export const defaultDnsResolver: DnsResolver = async (hostname) => {
    // Check if Deno is available
    if (typeof (globalThis as any).Deno !== 'undefined') {
        const Deno = (globalThis as any).Deno;
        try {
            const ipv4 = await Deno.resolveDns(hostname, 'A');
            return ipv4;
        } catch (e) {
            // Only throw if strictly no records found, or handle AAAA if needed.
            // For now, let's assume we primarily care about IPv4 for this scraper or handle IPv6 if returned.
            // If Deno throws NotFound, maybe try AAAA?
            try {
                const ipv6 = await Deno.resolveDns(hostname, 'AAAA');
                return ipv6;
            } catch {
                throw e;
            }
        }
    }

    // Fallback for testing environments (Node/Bun)
    try {
        const dns = await import('node:dns/promises');
        try {
            return await dns.resolve4(hostname);
        } catch {
            try {
                return await dns.resolve6(hostname);
            } catch {
                // If both fail, throw error
                throw new Error('No DNS records found');
            }
        }
    } catch {
        throw new Error('DNS resolution not available in this environment');
    }
};

export async function validateUrl(url: string, resolver: DnsResolver = defaultDnsResolver): Promise<string[]> {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error('Invalid URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol: must be http or https');
    }

    const hostname = parsed.hostname;

    // Handle IPv6 literals in URL (wrapped in brackets)
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
        const ip = hostname.slice(1, -1);
        if (isPrivateIP(ip)) {
            throw new Error(`Access to private IP ${ip} is denied`);
        }
        return [ip];
    }

    // Check if hostname is a STRICT IPv4 address
    // We only skip DNS resolution if it's a strictly valid canonical IPv4.
    // Non-strict IPs (e.g. with leading zeros like 0127.0.0.1) are treated as domains
    // and must be resolved (or fail resolution) to prevent octal interpretation bypasses.
    if (isStrictIPv4(hostname)) {
        if (isPrivateIP(hostname)) {
            throw new Error(`Access to private IP ${hostname} is denied`);
        }
        return [hostname];
    }

    // Resolve hostname
    let ips: string[];
    try {
        ips = await resolver(hostname);
    } catch {
        throw new Error(`Failed to resolve hostname: ${hostname}`);
    }

    if (!ips || ips.length === 0) {
        throw new Error(`Failed to resolve hostname: ${hostname}`);
    }

    for (const ip of ips) {
        if (isPrivateIP(ip)) {
            throw new Error(`Access to private IP ${ip} is denied`);
        }
    }

    return ips;
}

export async function fetchSafe(inputUrl: string, options: RequestInit = {}): Promise<Response> {
    let currentUrl = inputUrl;
    let response: Response;
    const maxRedirects = 5;
    const timeout = 15000; // 15 second timeout for scraping

    for (let i = 0; i < maxRedirects; i++) {
        // Validate URL (SSRF Prevention) and get resolved IPs
        const ips = await validateUrl(currentUrl);
        const resolvedIp = ips[0];

        // Prepare request options
        let fetchUrl = currentUrl;
        const fetchOptions: RequestInit = { ...options };

        // For HTTP requests, rewrite the URL to use the resolved IP address to prevent DNS rebinding attacks (TOCTOU).
        // For HTTPS, we cannot rewrite to IP easily because of certificate validation (hostname mismatch).
        // Deno/Browser fetch APIs do not support pinning IP for HTTPS.
        // We rely on the initial DNS resolution validation for HTTPS, accepting the small risk of DNS rebinding if strict HTTPS is not enforced or if using non-browser runtime tricks.
        const parsedUrl = new URL(currentUrl);
        if (parsedUrl.protocol === 'http:' && !isStrictIPv4(parsedUrl.hostname) && !parsedUrl.hostname.startsWith('[')) {
            const u = new URL(currentUrl);
            u.hostname = resolvedIp;
            fetchUrl = u.toString();

            // Set Host header to original hostname
            const headers = new Headers(fetchOptions.headers);
            headers.set('Host', parsedUrl.hostname);
            fetchOptions.headers = headers;
        }

        // Setup timeout controller
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            // Fetch with manual redirect
            // Note: We use 'manual' to intercept 3xx responses and validate the new location
            response = await fetch(fetchUrl, {
                ...fetchOptions,
                redirect: 'manual',
                signal: controller.signal
            });
        } finally {
            clearTimeout(id);
        }

        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('Location');

            // If no location header, we can't follow redirect, so return the 3xx response
            if (!location) {
                return response;
            }

            // Resolve relative URLs
            try {
                // Use currentUrl (with hostname) as base for correct relative resolution
                currentUrl = new URL(location, currentUrl).toString();
            } catch {
                throw new Error(`Invalid redirect URL: ${location}`);
            }

            // Consume/Cancel the response body to free resources before next fetch
            try {
                await response.body?.cancel();
            } catch {
                // Ignore cancellation errors
            }

            continue;
        }

        return response;
    }

    throw new Error(`Too many redirects (max ${maxRedirects})`);
}

/**
 * Reads the response text body safely, enforcing a size limit to prevent DoS.
 * @param response The Fetch Response object
 * @param maxLength Maximum allowed bytes (default 5MB)
 * @returns The response text
 */
export async function readTextSafe(response: Response, maxLength: number = 5 * 1024 * 1024): Promise<string> {
    if (!response.body) return "";

    const reader = response.body.getReader();
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        receivedLength += value.length;
        if (receivedLength > maxLength) {
            // Cancel the rest of the stream
            await reader.cancel();
            throw new Error(`Response too large (max ${maxLength} bytes)`);
        }
        chunks.push(value);
    }

    // Concatenate chunks
    const result = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
        result.set(chunk, position);
        position += chunk.length;
    }

    return new TextDecoder().decode(result);
}
