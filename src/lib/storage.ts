import type { CheckResult, Incident, Monitor } from "@/types";

export const STORAGE_KEYS = {
  monitors: "pulsecheck:monitors",
  checks: "pulsecheck:checks",
  incidents: "pulsecheck:incidents",
  theme: "pulsecheck:theme",
  demoLoaded: "pulsecheck:demo-loaded",
} as const;

const STORAGE_VERSION = 1;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage disabled (private browsing, quota, permissions, etc).
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function readList<T>(key: string, isValid: (value: unknown) => value is T): T[] {
  const raw = safeGetItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    // Corrupted JSON — fail safe to an empty list rather than crashing.
    return [];
  }
}

function writeList<T>(key: string, items: T[]): boolean {
  return safeSetItem(key, JSON.stringify(items));
}

function isMonitor(value: unknown): value is Monitor {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.url === "string" &&
    typeof v.method === "string" &&
    typeof v.timeout === "number" &&
    typeof v.expectedStatusCode === "number" &&
    typeof v.isActive === "boolean" &&
    typeof v.createdAt === "string" &&
    typeof v.updatedAt === "string"
  );
}

function isCheckResult(value: unknown): value is CheckResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.monitorId === "string" &&
    (typeof v.statusCode === "number" || v.statusCode === null) &&
    (typeof v.responseTime === "number" || v.responseTime === null) &&
    typeof v.success === "boolean" &&
    typeof v.checkedAt === "string"
  );
}

function isIncident(value: unknown): value is Incident {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.monitorId === "string" &&
    typeof v.startedAt === "string" &&
    typeof v.reason === "string"
  );
}

export function getMonitors(): Monitor[] {
  return readList(STORAGE_KEYS.monitors, isMonitor);
}

export function saveMonitors(monitors: Monitor[]): boolean {
  return writeList(STORAGE_KEYS.monitors, monitors);
}

export function getChecks(): CheckResult[] {
  return readList(STORAGE_KEYS.checks, isCheckResult);
}

export function saveChecks(checks: CheckResult[]): boolean {
  return writeList(STORAGE_KEYS.checks, checks);
}

export function getIncidents(): Incident[] {
  return readList(STORAGE_KEYS.incidents, isIncident);
}

export function saveIncidents(incidents: Incident[]): boolean {
  return writeList(STORAGE_KEYS.incidents, incidents);
}

export function getTheme(): "light" | "dark" | "system" | null {
  const raw = safeGetItem(STORAGE_KEYS.theme);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return null;
}

export function saveTheme(theme: "light" | "dark" | "system"): void {
  safeSetItem(STORAGE_KEYS.theme, theme);
}

export function isDemoLoaded(): boolean {
  return safeGetItem(STORAGE_KEYS.demoLoaded) === "true";
}

export function setDemoLoaded(loaded: boolean): void {
  safeSetItem(STORAGE_KEYS.demoLoaded, loaded ? "true" : "false");
}

export function clearAllData(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.monitors);
    window.localStorage.removeItem(STORAGE_KEYS.checks);
    window.localStorage.removeItem(STORAGE_KEYS.incidents);
    window.localStorage.removeItem(STORAGE_KEYS.demoLoaded);
  } catch {
    // Nothing more we can do — surface via the caller's own error handling.
  }
}

export function isStorageAvailable(): boolean {
  if (!isBrowser()) return false;
  try {
    const testKey = "pulsecheck:__test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const storageVersion = STORAGE_VERSION;
