import { assertEquals, assertRejects } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { isPrivateIP, validateUrl } from "./validator.ts";

Deno.test("isPrivateIP - private IPv4", () => {
  assertEquals(isPrivateIP("127.0.0.1"), true);
  assertEquals(isPrivateIP("10.0.0.1"), true);
  assertEquals(isPrivateIP("172.16.0.1"), true);
  assertEquals(isPrivateIP("192.168.1.1"), true);
  assertEquals(isPrivateIP("169.254.1.1"), true);
  assertEquals(isPrivateIP("0.0.0.0"), true);
});

Deno.test("isPrivateIP - public IPv4", () => {
  assertEquals(isPrivateIP("8.8.8.8"), false);
  assertEquals(isPrivateIP("1.1.1.1"), false);
  assertEquals(isPrivateIP("172.32.0.1"), false);
});

Deno.test("isPrivateIP - private IPv6", () => {
  assertEquals(isPrivateIP("::1"), true);
  assertEquals(isPrivateIP("fc00::1"), true);
  assertEquals(isPrivateIP("fe80::1"), true);
  assertEquals(isPrivateIP("::ffff:127.0.0.1"), true);
});

Deno.test("isPrivateIP - public IPv6", () => {
  assertEquals(isPrivateIP("2001:4860:4860::8888"), false);
});

const mockResolver = async (hostname: string) => {
    if (hostname === 'google.com') return ['142.250.190.46'];
    if (hostname === 'private.local') return ['192.168.1.1'];
    if (hostname === 'ipv6.local') return ['fe80::1'];
    throw new Error('Not found');
};

Deno.test("validateUrl - valid public URL", async () => {
  await validateUrl("https://google.com", mockResolver);
});

Deno.test("validateUrl - private IPv4 URL", async () => {
  await assertRejects(
    () => validateUrl("http://127.0.0.1", mockResolver),
    Error,
    "Access to private IP 127.0.0.1 is denied"
  );
});

Deno.test("validateUrl - private IPv6 URL", async () => {
  await assertRejects(
    () => validateUrl("http://[::1]", mockResolver),
    Error,
    "Access to private IP ::1 is denied"
  );
});

Deno.test("validateUrl - domain resolving to private IP", async () => {
  await assertRejects(
    () => validateUrl("http://private.local", mockResolver),
    Error,
    "Access to private IP 192.168.1.1 is denied"
  );
});

Deno.test("validateUrl - domain resolving to private IPv6", async () => {
  await assertRejects(
    () => validateUrl("http://ipv6.local", mockResolver),
    Error,
    "Access to private IP fe80::1 is denied"
  );
});

Deno.test("validateUrl - invalid URL", async () => {
  await assertRejects(
    () => validateUrl("not-a-url", mockResolver),
    Error,
    "Invalid URL"
  );
});

Deno.test("validateUrl - octal IPv4 (should be resolved not treated as IP)", async () => {
  // If we try 0127.0.0.1, it should NOT match strict IP check.
  // It should try to resolve.
  // The mockResolver doesn't know 0127.0.0.1, so it throws "Not found".
  // This confirms it went to resolution (and didn't bypass or block early incorrectly if logic was flawed).
  // If it was treated as public IP, it would return undefined (success).
  // If it was treated as private IP, it would throw "Access to private IP".
  await assertRejects(
    () => validateUrl("http://0127.0.0.1", mockResolver),
    Error,
    "Not found"
  );
});

Deno.test("validateUrl - hex IPv4 (should be resolved)", async () => {
    await assertRejects(
        () => validateUrl("http://0x7f.0.0.1", mockResolver),
        Error,
        "Not found"
    );
});
