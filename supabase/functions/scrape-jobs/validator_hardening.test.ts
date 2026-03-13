
// Note: This test file requires Bun to run (e.g. `bun test`).
// It verifies the logic of the validator.ts shared module.

import { describe, it, expect } from "bun:test";
import { isPrivateIP, validateUrl, readTextSafe } from "./validator.ts";

// Mock resolver for testing
const mockResolver = async (hostname: string) => {
    // Simulate resolving various formats to local IPs
    if (hostname === '0177.0.0.1') return ['127.0.0.1'];
    if (hostname === 'localtest.me') return ['127.0.0.1'];
    if (hostname === 'example.com') return ['93.184.216.34'];
    if (hostname === '169.254.169.254') return ['169.254.169.254'];
    if (hostname === 'rbnd.gl0.eu') return ['127.0.0.1'];
    throw new Error('Not found');
};

describe("SSRF Validator Logic", () => {
    it("blocks standard loopback", () => {
        expect(isPrivateIP("127.0.0.1")).toBe(true);
    });

    it("blocks AWS metadata IP", () => {
        expect(isPrivateIP("169.254.169.254")).toBe(true);
    });

    it("blocks standard private range 10.x", () => {
        expect(isPrivateIP("10.0.0.1")).toBe(true);
    });

    it("blocks standard private range 172.16.x", () => {
        expect(isPrivateIP("172.16.0.1")).toBe(true);
    });

    it("blocks standard private range 192.168.x", () => {
        expect(isPrivateIP("192.168.1.1")).toBe(true);
    });

    it("blocks IPv6 loopback", () => {
        expect(isPrivateIP("::1")).toBe(true);
    });

    it("blocks IPv4-mapped IPv6", () => {
        expect(isPrivateIP("::ffff:127.0.0.1")).toBe(true);
    });

    it("allows public IP", () => {
        expect(isPrivateIP("8.8.8.8")).toBe(false);
    });

    describe("validateUrl", () => {
        it("blocks direct private IP", async () => {
            try {
                await validateUrl("http://127.0.0.1", mockResolver);
                throw new Error("Should have failed");
            } catch (e: any) {
                expect(e.message).toContain("Access to private IP");
            }
        });

        it("blocks domain resolving to private IP", async () => {
            try {
                await validateUrl("http://localtest.me", mockResolver);
                throw new Error("Should have failed");
            } catch (e: any) {
                expect(e.message).toContain("Access to private IP");
            }
        });

        it("blocks octal IP encoding (0177.0.0.1 -> 127.0.0.1)", async () => {
            try {
                await validateUrl("http://0177.0.0.1", mockResolver);
                throw new Error("Should have failed");
            } catch (e: any) {
                expect(e.message).toContain("Access to private IP");
            }
        });

        it("blocks hex IP encoding (0x7f000001 -> 127.0.0.1)", async () => {
            try {
                await validateUrl("http://0x7f000001", mockResolver);
                throw new Error("Should have failed");
            } catch (e: any) {
                expect(e.message).toContain("Access to private IP");
            }
        });

        it("blocks decimal IP encoding (2130706433 -> 127.0.0.1)", async () => {
            try {
                await validateUrl("http://2130706433", mockResolver);
                throw new Error("Should have failed");
            } catch (e: any) {
                expect(e.message).toContain("Access to private IP");
            }
        });
    });
});

describe("readTextSafe", () => {
    it("reads small response successfully", async () => {
        const response = new Response("Hello World");
        // readTextSafe must be awaited
        const text = await readTextSafe(response, 100);
        expect(text).toBe("Hello World");
    });

    it("throws on response larger than limit", async () => {
        // Create a large stream
        const largeString = "a".repeat(1024);
        const response = new Response(largeString);

        try {
            await readTextSafe(response, 512); // Limit 512 bytes
            throw new Error("Should have thrown");
        } catch (e: any) {
            expect(e.message).toContain("Response too large");
        }
    });
});
