"use client";

import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { IncidentItem } from "@/components/incidents/incident-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonitoring } from "@/hooks/use-monitoring-store";
import { activeIncidents, resolvedIncidents } from "@/lib/monitoring";

export default function IncidentsPage() {
  const { monitors, incidents, loaded } = useMonitoring();

  if (!loaded) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const active = activeIncidents(incidents);
  const resolved = resolvedIncidents(incidents);
  const monitorFor = (id: string) => monitors.find((m) => m.id === id);

  return (
    <div>
      <PageHeader title="Incidents" description="Automatic incident detection from your check history." />

      {active.length === 0 && resolved.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">All systems operational</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">No incidents have been recorded.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">Active ({active.length})</h2>
              <div className="space-y-3">
                {active.map((incident) => (
                  <IncidentItem key={incident.id} incident={incident} monitor={monitorFor(incident.monitorId)} />
                ))}
              </div>
            </section>
          )}

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">Resolved ({resolved.length})</h2>
              <div className="space-y-3">
                {resolved.map((incident) => (
                  <IncidentItem key={incident.id} incident={incident} monitor={monitorFor(incident.monitorId)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
