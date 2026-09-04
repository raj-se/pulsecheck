export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AuthType = "none" | "bearer" | "apiKey" | "basic" | "custom";

export interface CustomHeader {
  key: string;
  value: string;
}

export interface AuthConfig {
  type: AuthType;
  bearerToken?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyLocation?: "header" | "query";
  basicUsername?: string;
  basicPassword?: string;
  customHeaders?: CustomHeader[];
}

export const NO_AUTH: AuthConfig = { type: "none" };

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  timeout: number; // seconds
  expectedStatusCode: number;
  isActive: boolean;
  isDemo?: boolean;
  auth?: AuthConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CheckResult {
  id: string;
  monitorId: string;
  statusCode: number | null;
  responseTime: number | null; // ms
  success: boolean;
  errorMessage?: string;
  checkedAt: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  startedAt: string;
  resolvedAt?: string;
  reason: string;
}

export type MonitorStatus = "operational" | "degraded" | "failing" | "disabled" | "unknown";

export interface MonitorStats {
  uptime: number | null;
  avgResponseTime: number | null;
  fastest: number | null;
  slowest: number | null;
  totalChecks: number;
  failedChecks: number;
  lastCheck: CheckResult | null;
  status: MonitorStatus;
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  monitors: Monitor[];
  checks: CheckResult[];
  incidents: Incident[];
}

export type TimeRange = "24h" | "7d" | "30d";
