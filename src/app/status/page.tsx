"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { StatusHeader } from "@/components/status/status-header";
import { StatusLabel } from "@/components/monitors/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMonitoring } from "@/hooks/use-monitoring-store";
import { computeMonitorStats, overallStatus, resolvedIncidents } from "@/lib/monitoring";
import { formatClock, formatDuration } from "@/lib/utils";

export default function StatusPage() {
  const { monitors, checks, incidents, loaded } = useMonitoring();

  const statsByMonitor = monitors.map((m) => ({ monitor: m, stats: computeMonitorStats(m, checks) }));
  const overall = overallStatus(statsByMonitor.map((s) => s.stats.status));
  const pastIncidents = resolvedIncidents(incidents).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/">
            <Logo />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">PulseCheck Status</h1>

        <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            This status page reads data stored in your browser&apos;s localStorage. It reflects only what this device
            has checked, and is not a globally hosted public status page.
          </span>
        </div>

        <div className="mt-6">
          {!loaded ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <StatusHeader status={monitors.length === 0 ? "unknown" : overall} />
          )}
        </div>

        <div className="mt-8">
          {!loaded ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : statsByMonitor.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No monitors configured on this device yet.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {statsByMonitor.map(({ monitor, stats }) => (
                <li key={monitor.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{monitor.name}</span>
                  <StatusLabel status={stats.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Past Incidents</h2>
          {!loaded ? (
            <Skeleton className="h-10 w-full" />
          ) : pastIncidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents reported.</p>
          ) : (
            <ul className="space-y-3">
              {pastIncidents.map((incident) => {
                const monitor = monitors.find((m) => m.id === incident.monitorId);
                return (
                  <li key={incident.id} className="rounded-md border border-border px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">{monitor?.name ?? "Unknown monitor"}</p>
                    <p className="mt-0.5 text-muted-foreground">{incident.reason}</p>
                    <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                      {formatClock(incident.startedAt)} · resolved after {formatDuration(incident.startedAt, incident.resolvedAt)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
