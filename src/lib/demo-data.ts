import type { CheckResult, Incident, Monitor } from "@/types";
import { genId } from "@/lib/utils";

interface DemoMonitorSeed {
  name: string;
  url: string;
  baseLatency: number;
  jitter: number;
  failRate: number;
}

const DEMO_SEEDS: DemoMonitorSeed[] = [
  { name: "Production API", url: "https://api.example.com/health", baseLatency: 165, jitter: 60, failRate: 0.006 },
  { name: "Payment API", url: "https://payments.example.com/health", baseLatency: 240, jitter: 110, failRate: 0.012 },
  { name: "Authentication API", url: "https://auth.example.com/health", baseLatency: 130, jitter: 40, failRate: 0 },
  { name: "Website", url: "https://www.example.com", baseLatency: 210, jitter: 90, failRate: 0.003 },
];

function pseudoRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function generateDemoData(): { monitors: Monitor[]; checks: CheckResult[]; incidents: Incident[] } {
  const now = Date.now();
  const monitors: Monitor[] = [];
  const checks: CheckResult[] = [];
  const incidents: Incident[] = [];

  DEMO_SEEDS.forEach((seed, seedIndex) => {
    const rand = pseudoRandom(seedIndex * 977 + 13);
    const monitorId = genId("mon");
    const createdAt = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

    monitors.push({
      id: monitorId,
      name: seed.name,
      url: seed.url,
      method: "GET",
      timeout: 10,
      expectedStatusCode: 200,
      isActive: true,
      isDemo: true,
      createdAt,
      updatedAt: createdAt,
    });

    // One check roughly every 20 minutes for the last 7 days.
    const intervalMinutes = 20;
    const totalChecks = Math.floor((7 * 24 * 60) / intervalMinutes);
    let openIncident: Incident | null = null;

    for (let i = totalChecks; i >= 0; i--) {
      const checkedAt = new Date(now - i * intervalMinutes * 60 * 1000);
      const wave = Math.sin((totalChecks - i) / 18) * (seed.jitter / 2);
      const noise = (rand() - 0.5) * seed.jitter;
      const latency = Math.max(28, Math.round(seed.baseLatency + wave + noise));
      const failed = rand() < seed.failRate;

      const result: CheckResult = {
        id: genId("chk"),
        monitorId,
        statusCode: failed ? (rand() < 0.5 ? 500 : 503) : 200,
        responseTime: failed ? null : latency,
        success: !failed,
        errorMessage: failed ? "Request timed out" : undefined,
        checkedAt: checkedAt.toISOString(),
      };
      checks.push(result);

      if (failed && !openIncident) {
        openIncident = {
          id: genId("inc"),
          monitorId,
          startedAt: result.checkedAt,
          reason: `${seed.name} returned HTTP ${result.statusCode}.`,
        };
      } else if (!failed && openIncident) {
        incidents.push({ ...openIncident, resolvedAt: result.checkedAt });
        openIncident = null;
      }
    }

    if (openIncident) incidents.push(openIncident);
  });

  return { monitors, checks, incidents };
}
