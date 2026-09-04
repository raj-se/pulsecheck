"use client";

import * as React from "react";
import { Activity, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { MonitorFormDialog } from "@/components/monitors/monitor-form-dialog";
import { DeleteMonitorDialog } from "@/components/monitors/delete-monitor-dialog";
import { MonitorCard } from "@/components/monitors/monitor-card";
import { LoadDemoDataButton } from "@/components/dashboard/demo-data-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMonitoring } from "@/hooks/use-monitoring-store";
import { computeMonitorStats } from "@/lib/monitoring";
import type { Monitor, MonitorStatus } from "@/types";

type StatusFilter = "all" | MonitorStatus;

export default function MonitorsPage() {
  const { monitors, checks, loaded, addMonitor, updateMonitor, deleteMonitor } = useMonitoring();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [editing, setEditing] = React.useState<Monitor | null>(null);
  const [deleting, setDeleting] = React.useState<Monitor | null>(null);

  const filtered = React.useMemo(() => {
    return monitors.filter((m) => {
      const matchesQuery =
        query.trim().length === 0 ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.url.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || computeMonitorStats(m, checks).status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [monitors, checks, query, statusFilter]);

  if (!loaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Monitors"
        description={`${monitors.length} endpoint${monitors.length === 1 ? "" : "s"} being watched.`}
        actions={<MonitorFormDialog onSubmit={(v) => addMonitor(v)} />}
      />

      {monitors.length === 0 ? (
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
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search monitors by name or URL…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="failing">Failing</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No matches" description="Try a different search term or filter." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((monitor) => (
                <MonitorCard key={monitor.id} monitor={monitor} onEdit={setEditing} onDelete={setDeleting} />
              ))}
            </div>
          )}
        </>
      )}

      <MonitorFormDialog
        monitor={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={(values) => {
          if (editing) updateMonitor(editing.id, values);
        }}
      />

      <DeleteMonitorDialog
        monitor={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(id) => {
          deleteMonitor(id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
