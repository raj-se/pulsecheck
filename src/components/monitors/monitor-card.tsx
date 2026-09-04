"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusLabel } from "@/components/monitors/status-badge";
import { CheckNowButton } from "@/components/monitors/check-now-button";
import { computeMonitorStats } from "@/lib/monitoring";
import { formatMs, formatPercent, truncate } from "@/lib/utils";
import { useMonitoring } from "@/hooks/use-monitoring-store";
import type { Monitor } from "@/types";

export function MonitorCard({
  monitor,
  onEdit,
  onDelete,
}: {
  monitor: Monitor;
  onEdit: (monitor: Monitor) => void;
  onDelete: (monitor: Monitor) => void;
}) {
  const { checks } = useMonitoring();
  const stats = computeMonitorStats(monitor, checks);

  return (
    <Card className="p-4 transition-colors hover:border-border/80">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/dashboard/monitors/${monitor.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{monitor.name}</h3>
            {monitor.isDemo && (
              <Badge variant="muted" className="shrink-0">
                Demo
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{truncate(monitor.url, 56)}</p>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground" aria-label="Monitor actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(monitor)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(monitor)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <StatusLabel status={stats.status} />
        <div className="flex items-center gap-1.5">
          {monitor.auth && monitor.auth.type !== "none" && (
            <Lock className="h-3 w-3 text-muted-foreground" aria-label="Authorization configured" />
          )}
          {monitor.method !== "GET" && (
            <Badge variant="outline" className="font-mono text-[10px]">
              {monitor.method}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 font-mono text-xs tabular-nums">
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="mt-0.5 font-medium text-foreground">{stats.lastCheck?.statusCode ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Latency</p>
          <p className="mt-0.5 font-medium text-foreground">{formatMs(stats.lastCheck?.responseTime)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Uptime</p>
          <p className="mt-0.5 font-medium text-foreground">{formatPercent(stats.uptime)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <CheckNowButton monitorId={monitor.id} />
        <Button asChild size="sm" variant="ghost">
          <Link href={`/dashboard/monitors/${monitor.id}`}>Details</Link>
        </Button>
      </div>
    </Card>
  );
}
