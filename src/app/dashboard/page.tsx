"use client";

import Link from "next/link";
import { Activity, CheckCircle2, Gauge, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatGrid, type StatItem } from "@/components/dashboard/stat-grid";
import { MonitorFormDialog } from "@/components/monitors/monitor-form-dialog";
import { LoadDemoDataButton } from "@/components/dashboard/demo-data-button";
import { ResponseTimeChart } from "@/components/charts/response-time-chart";
import { RecentChecksList } from "@/components/monitors/recent-checks-list";
import { IncidentItem } from "@/components/incidents/incident-item";
import { StatusLabel } from "@/components/monitors/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonitoring } from "@/hooks/use-monitoring-store";
import { computeMonitorStats, activeIncidents } from "@/lib/monitoring";
import { formatMs } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { monitors, checks, incidents, loaded, addMonitor } = useMonitoring();

  if (!loaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div>
        <PageHeader title="Overview" description="Your API performance at a glance." />
        <EmptyState
          icon={Activity}
          title="No monitors yet"
          description="Add your first API endpoint to start tracking its performance."
          action={
            <div className="flex items-center gap-2">
              <MonitorFormDialog onSubmit={(v) => addMonitor(v)} />
              <LoadDemoDataButton />
            </div>
          }
        />
      </div>
    );
  }

  const statsByMonitor = monitors.map((m) => ({ monitor: m, stats: computeMonitorStats(m, checks) }));
  const healthy = statsByMonitor.filter((s) => s.stats.status === "operational").length;
  const failing = statsByMonitor.filter((s) => s.stats.status === "failing").length;
  const latencies = statsByMonitor.map((s) => s.stats.avgResponseTime).filter((v): v is number => v !== null);
  const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null;

  const stats: StatItem[] = [
    { label: "Monitors", value: String(monitors.length), icon: Gauge },
    { label: "Healthy", value: String(healthy), icon: CheckCircle2, tone: "success" },
    { label: "Failing", value: String(failing), icon: XCircle, tone: failing > 0 ? "destructive" : "default" },
    { label: "Avg Latency", value: formatMs(avgLatency), icon: Activity },
  ];

  const openIncidents = activeIncidents(incidents).slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your API performance at a glance."
        actions={<MonitorFormDialog onSubmit={(v) => addMonitor(v)} />}
      />

      <StatGrid stats={stats} />

      <Card className="mt-6">
        <CardContent className="pt-5">
          <ResponseTimeChart checks={checks} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Monitors</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/monitors">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {statsByMonitor.slice(0, 6).map(({ monitor, stats: s }) => (
              <Link
                key={monitor.id}
                href={`/dashboard/monitors/${monitor.id}`}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent/60"
              >
                <span className="truncate font-medium text-foreground">{monitor.name}</span>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground">{formatMs(s.avgResponseTime)}</span>
                  <StatusLabel status={s.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Incidents</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/incidents">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {openIncidents.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                All systems operational
              </div>
            ) : (
              <div className="space-y-3">
                {openIncidents.map((incident) => (
                  <IncidentItem
                    key={incident.id}
                    incident={incident}
                    monitor={monitors.find((m) => m.id === incident.monitorId)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentChecksList checks={checks} />
        </CardContent>
      </Card>
    </div>
  );
}
