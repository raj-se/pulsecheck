/**
 * Basic SSRF protection for the /api/check route.
 *
 * This blocks the obvious ways a user-supplied URL could be used to reach
 * internal infrastructure (localhost, private IP ranges, link-local
 * addresses, etc). It is deliberately conservative rather than exhaustive —
 * see the README for what this does NOT protect against.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

// Matches things like "foo.local", "foo.internal", "foo.lan", or a bare
// hostname with no dot at all (often an internal service name).
const BLOCKED_HOSTNAME_PATTERNS = [/\.local$/i, /\.internal$/i, /\.lan$/i, /^[^.]+$/];

function isIPv4(hostname: string): boolean {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

function isPrivateIPv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return true; // malformed, treat as unsafe
  }
  const [a, b] = parts as [number, number, number, number];

  if (a === 127) return true; // loopback
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 0) return true; // "this network"
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  return false;
}

function isPrivateIPv6(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (normalized === "::1") return true; // loopback
  if (normalized.startsWith("fe80")) return true; // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local
  if (normalized.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 address — check the embedded IPv4 part.
    const mapped = normalized.split(":").pop() ?? "";
    if (isIPv4(mapped)) return isPrivateIPv4(mapped);
  }
  return false;
}

export interface UrlSafetyResult {
  safe: boolean;
  reason?: string;
}

export function assertSafeUrl(rawUrl: string): UrlSafetyResult {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "The URL could not be parsed." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, reason: "Only http:// and https:// URLs are allowed." };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { safe: false, reason: "Requests to this host are not allowed." };
  }

  if (BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    return { safe: false, reason: "Requests to internal-looking hosts are not allowed." };
  }

  if (isIPv4(hostname) && isPrivateIPv4(hostname)) {
    return { safe: false, reason: "Requests to private IP ranges are not allowed." };
  }

  if (hostname.includes(":") && isPrivateIPv6(hostname)) {
    return { safe: false, reason: "Requests to private IP ranges are not allowed." };
  }

  return { safe: true };
}
