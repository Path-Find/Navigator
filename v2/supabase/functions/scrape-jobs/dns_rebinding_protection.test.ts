import { test, expect, beforeAll, afterAll, spyOn } from "bun:test";
import { fetchSafe } from "./validator.ts";

// Mock Deno global for DNS resolution
const mockResolveDns = async (hostname: string, recordType: string) => {
    if (hostname === 'example.com') return ['93.184.216.34'];
    if (hostname === 'secure.example.com') return ['93.184.216.34'];
    if (hostname === 'rebinding.test') return ['1.2.3.4']; // Public IP for test
    if (hostname === 'internal.test') return ['127.0.0.1'];
    throw new Error(`DNS Not found for ${hostname}`);
};

(globalThis as any).Deno = {
    resolveDns: mockResolveDns
};

// Mock fetch
const fetchSpy = spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    return new Response('ok');
});

test("fetchSafe - HTTP URL should be rewritten to IP (DNS Rebinding Protection)", async () => {
    fetchSpy.mockClear();
    await fetchSafe("http://example.com");

    expect(fetchSpy).toHaveBeenCalled();
    const call = fetchSpy.mock.calls[0];
    const url = call[0].toString();
    const options = call[1];

    // Check URL uses IP
    expect(url).toBe("http://93.184.216.34/");

    // Check Host header
    const headers = new Headers(options?.headers);
    expect(headers.get("Host")).toBe("example.com");
});

test("fetchSafe - HTTPS URL should NOT be rewritten (Certificate Validation)", async () => {
    fetchSpy.mockClear();
    await fetchSafe("https://secure.example.com");

    expect(fetchSpy).toHaveBeenCalled();
    const call = fetchSpy.mock.calls[0];
    const url = call[0].toString();
    const options = call[1];

    // Check URL uses hostname
    expect(url).toBe("https://secure.example.com");

    // Host header might be implicit, but we didn't set it explicitly
    // Verify we didn't mess up headers
    const headers = new Headers(options?.headers);
    // We expect NO explicit Host header (or at least not rewritten one, though fetch adds it automatically)
    // Our code only sets Host if it rewrites URL.
    expect(headers.has("Host")).toBe(false);
});

test("fetchSafe - Private IP should be blocked", async () => {
    fetchSpy.mockClear();
    try {
        await fetchSafe("http://internal.test");
        throw new Error("Should have thrown");
    } catch (e: any) {
        expect(e.message).toContain("Access to private IP 127.0.0.1 is denied");
    }
    expect(fetchSpy).not.toHaveBeenCalled();
});
