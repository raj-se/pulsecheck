import { NextRequest, NextResponse } from "next/server";
import { checkRequestSchema } from "@/lib/validation";
import { assertSafeUrl } from "@/lib/security";
import type { AuthConfig } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckResponseBody {
  success: boolean;
  statusCode: number | null;
  responseTime: number | null;
  errorMessage?: string;
}

const HARD_MAX_TIMEOUT_MS = 30000;

function fail(message: string, status = 400) {
  return NextResponse.json<CheckResponseBody>(
    { success: false, statusCode: null, responseTime: null, errorMessage: message },
    { status }
  );
}

/**
 * Applies the monitor's configured authorization to the outgoing request.
 * Returns the final URL (query-param API keys are appended here) and the
 * header set to send. Basic auth is base64-encoded server-side so the
 * browser never has to do it.
 */
function applyAuth(targetUrl: URL, auth: AuthConfig | undefined, headers: Headers): URL {
  if (!auth || auth.type === "none") return targetUrl;

  switch (auth.type) {
    case "bearer": {
      if (auth.bearerToken) headers.set("Authorization", `Bearer ${auth.bearerToken}`);
      break;
    }
    case "apiKey": {
      if (auth.apiKeyName && auth.apiKeyValue) {
        if (auth.apiKeyLocation === "query") {
          targetUrl.searchParams.set(auth.apiKeyName, auth.apiKeyValue);
        } else {
          headers.set(auth.apiKeyName, auth.apiKeyValue);
        }
      }
      break;
    }
    case "basic": {
      if (auth.basicUsername !== undefined && auth.basicPassword !== undefined) {
        const encoded = Buffer.from(`${auth.basicUsername}:${auth.basicPassword}`, "utf-8").toString("base64");
        headers.set("Authorization", `Basic ${encoded}`);
      }
      break;
    }
    case "custom": {
      for (const header of auth.customHeaders ?? []) {
        if (header.key && header.value) headers.set(header.key, header.value);
      }
      break;
    }
  }

  return targetUrl;
}

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail("Request body must be valid JSON.");
  }

  const parsed = checkRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid request.");
  }

  const { url, method, timeout, auth } = parsed.data;
  const safety = assertSafeUrl(url);
  if (!safety.safe) {
    return fail(safety.reason ?? "This URL is not allowed.");
  }

  let finalUrl: URL;
  const headers = new Headers({ "User-Agent": "PulseCheck/1.0 (+api-monitor)" });
  try {
    finalUrl = applyAuth(new URL(url), auth, headers);
  } catch {
    return fail("Could not apply the configured authorization to this request.");
  }

  const effectiveTimeout = Math.min(timeout, HARD_MAX_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), effectiveTimeout);

  const start = performance.now();
  try {
    const response = await fetch(finalUrl, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers,
      cache: "no-store",
    });
    const end = performance.now();
    const responseTime = Math.round(end - start);

    return NextResponse.json<CheckResponseBody>({
      success: true,
      statusCode: response.status,
      responseTime,
    });
  } catch (error) {
    const end = performance.now();
    const responseTime = Math.round(end - start);
    const isAbort = error instanceof Error && error.name === "AbortError";

    return NextResponse.json<CheckResponseBody>({
      success: false,
      statusCode: null,
      // A timed-out request still has an elapsed duration worth showing.
      responseTime: isAbort ? responseTime : null,
      errorMessage: isAbort
        ? `Request timed out after ${effectiveTimeout}ms.`
        : "The request failed. The host may be unreachable, refused the connection, or rejected the request headers.",
    });
  } finally {
    clearTimeout(timer);
  }
}
