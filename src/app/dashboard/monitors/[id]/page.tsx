"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Activity, CheckCircle2, Percent, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid, type StatItem } from "@/components/dashboard/stat-grid";
import { StatusLabel } from "@/components/monitors/status-badge";
import { CheckNowButton } from "@/components/monitors/check-now-button";
import { MonitorFormDialog } from "@/components/monitors/monitor-form-dialog";
import { DeleteMonitorDialog } from "@/components/monitors/delete-monitor-dialog";
import { ResponseTimeChart } from "@/components/charts/response-time-chart";
import { RecentChecksList } from "@/components/monitors/recent-checks-list";
import { IncidentItem } from "@/components/incidents/incident-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonitoring } from "@/hooks/use-monitoring-store";
import { checksForMonitor, computeMonitorStats } from "@/lib/monitoring";
import { formatMs, formatPercent } from "@/lib/utils";

export default function MonitorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { monitors, checks, incidents, loaded, updateMonitor, deleteMonitor } = useMonitoring();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const monitor = monitors.find((m) => m.id === params.id);

  if (!loaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold text-foreground">Monitor not found</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          It may have been deleted, or the link is stale for this browser.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/dashboard/monitors">
            <ArrowLeft className="h-4 w-4" />
            Back to monitors
          </Link>
        </Button>
      </div>
    );
  }

  const monitorChecks = checksForMonitor(checks, monitor.id);
  const stats = computeMonitorStats(monitor, checks);
  const monitorIncidents = incidents
    .filter((i) => i.monitorId === monitor.id)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const statItems: StatItem[] = [
    { label: "Uptime", value: formatPercent(stats.uptime), icon: Percent, tone: "success" },
    { label: "Average Response", value: formatMs(stats.avgResponseTime), icon: Activity },
    { label: "Fastest", value: formatMs(stats.fastest), icon: CheckCircle2, tone: "success" },
    { label: "Slowest", value: formatMs(stats.slowest), icon: TrendingDown, tone: "warning" },
  ];

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground">
        <Link href="/dashboard/monitors">
          <ArrowLeft className="h-4 w-4" />
          Monitors
        </Link>
      </Button>

      <PageHeader
        title={monitor.name}
        description={monitor.url}
        actions={
          <>
            <CheckNowButton monitorId={monitor.id} size="default" variant="default" />
            <Button variant="outline" size="icon" onClick={() => setEditOpen(true)} aria-label="Edit monitor">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDeleteOpen(true)} aria-label="Delete monitor">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <StatusLabel status={stats.status} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active</span>
          <Switch
            checked={monitor.isActive}
            onCheckedChange={(checked) =>
              updateMonitor(monitor.id, {
                name: monitor.name,
                url: monitor.url,
                method: monitor.method,
                timeout: monitor.timeout,
                expectedStatusCode: monitor.expectedStatusCode,
                isActive: checked,
                auth: monitor.auth ?? { type: "none" },
              })
            }
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {stats.totalChecks} total checks · {stats.failedChecks} failed
        </span>
      </div>

      <StatGrid stats={statItems} />

      <Card className="mt-6">
        <CardContent className="pt-5">
          <ResponseTimeChart checks={monitorChecks} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentChecksList checks={monitorChecks} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monitorIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No incidents recorded for this monitor.</p>
            ) : (
              monitorIncidents.map((incident) => <IncidentItem key={incident.id} incident={incident} monitor={monitor} />)
            )}
          </CardContent>
        </Card>
      </div>

      <MonitorFormDialog
        monitor={monitor}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={(values) => updateMonitor(monitor.id, values)}
      />

      <DeleteMonitorDialog
        monitor={deleteOpen ? monitor : null}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={(id) => {
          deleteMonitor(id);
          router.push("/dashboard/monitors");
        }}
      />
    </div>
  );
}
