import type { CheckResult, Incident, Monitor, MonitorStats, MonitorStatus, TimeRange } from "@/types";

/** Checks for a monitor, newest first. */
export function checksForMonitor(checks: CheckResult[], monitorId: string): CheckResult[] {
  return checks
    .filter((c) => c.monitorId === monitorId)
    .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
}

export function rangeStartDate(range: TimeRange): Date {
  const now = new Date();
  const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export function checksInRange(checks: CheckResult[], range: TimeRange): CheckResult[] {
  const start = rangeStartDate(range).getTime();
  return checks.filter((c) => new Date(c.checkedAt).getTime() >= start);
}

/** Computes uptime %, latency stats, and health status for one monitor. */
export function computeMonitorStats(monitor: Monitor, allChecks: CheckResult[]): MonitorStats {
  const checks = checksForMonitor(allChecks, monitor.id);
  const totalChecks = checks.length;
  const failedChecks = checks.filter((c) => !c.success).length;
  const successful = totalChecks - failedChecks;

  const latencies = checks
    .map((c) => c.responseTime)
    .filter((v): v is number => typeof v === "number");

  const uptime = totalChecks > 0 ? (successful / totalChecks) * 100 : null;
  const avgResponseTime =
    latencies.length > 0 ? latencies.reduce((sum, v) => sum + v, 0) / latencies.length : null;
  const fastest = latencies.length > 0 ? Math.min(...latencies) : null;
  const slowest = latencies.length > 0 ? Math.max(...latencies) : null;
  const lastCheck = checks[0] ?? null;

  let status: MonitorStatus = "unknown";
  if (!monitor.isActive) {
    status = "disabled";
  } else if (lastCheck) {
    if (!lastCheck.success) {
      status = "failing";
    } else {
      // Degraded: last check passed but at least one of the recent 5 failed.
      const recent = checks.slice(0, 5);
      const recentFailures = recent.filter((c) => !c.success).length;
      status = recentFailures > 0 ? "degraded" : "operational";
    }
  }

  return { uptime, avgResponseTime, fastest, slowest, totalChecks, failedChecks, lastCheck, status };
}

export function overallStatus(statuses: MonitorStatus[]): "operational" | "degraded" | "failing" | "unknown" {
  const active = statuses.filter((s) => s !== "disabled");
  if (active.length === 0) return "unknown";
  if (active.some((s) => s === "failing")) return "failing";
  if (active.some((s) => s === "degraded")) return "degraded";
  if (active.every((s) => s === "operational")) return "operational";
  return "unknown";
}

/**
 * Reconciles incidents against a fresh check result.
 * - A failed check opens a new incident only if there isn't already an
 *   unresolved one for that monitor.
 * - A successful check resolves any open incident for that monitor.
 */
export function reconcileIncidents(
  incidents: Incident[],
  monitor: Monitor,
  result: CheckResult
): { incidents: Incident[]; opened: Incident | null; resolved: Incident | null } {
  const openIncident = incidents.find((i) => i.monitorId === monitor.id && !i.resolvedAt);

  if (!result.success) {
    if (openIncident) {
      return { incidents, opened: null, resolved: null };
    }
    const reason = result.statusCode
      ? `${monitor.name} returned HTTP ${result.statusCode}.`
      : result.errorMessage
        ? `${monitor.name} failed: ${result.errorMessage}`
        : `${monitor.name} failed a health check.`;

    const newIncident: Incident = {
      id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      monitorId: monitor.id,
      startedAt: result.checkedAt,
      reason,
    };
    return { incidents: [newIncident, ...incidents], opened: newIncident, resolved: null };
  }

  if (openIncident) {
    const resolvedIncident: Incident = { ...openIncident, resolvedAt: result.checkedAt };
    const next = incidents.map((i) => (i.id === openIncident.id ? resolvedIncident : i));
    return { incidents: next, opened: null, resolved: resolvedIncident };
  }

  return { incidents, opened: null, resolved: null };
}

export function activeIncidents(incidents: Incident[]): Incident[] {
  return incidents
    .filter((i) => !i.resolvedAt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function resolvedIncidents(incidents: Incident[]): Incident[] {
  return incidents
    .filter((i) => i.resolvedAt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}
