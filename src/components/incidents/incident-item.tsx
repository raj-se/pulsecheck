import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatClock, formatDuration } from "@/lib/utils";
import type { Incident, Monitor } from "@/types";

export function IncidentItem({ incident, monitor }: { incident: Incident; monitor?: Monitor }) {
  const isActive = !incident.resolvedAt;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isActive ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {monitor?.name ?? "Unknown monitor"} {isActive ? "is down" : "recovered"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{incident.reason}</p>
          </div>
        </div>
        <Badge variant={isActive ? "destructive" : "success"} className="shrink-0">
          {isActive ? "Active" : "Resolved"}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
        <span>Started: {formatClock(incident.startedAt)}</span>
        <span>Duration: {formatDuration(incident.startedAt, incident.resolvedAt)}</span>
        {incident.resolvedAt && <span>Resolved: {formatClock(incident.resolvedAt)}</span>}
      </div>
    </Card>
  );
}
