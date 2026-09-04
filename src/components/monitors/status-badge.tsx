import { cn } from "@/lib/utils";
import type { MonitorStatus } from "@/types";

const STATUS_CONFIG: Record<MonitorStatus, { label: string; dot: string; text: string }> = {
  operational: { label: "Operational", dot: "bg-success", text: "text-success" },
  degraded: { label: "Degraded", dot: "bg-warning", text: "text-warning" },
  failing: { label: "Failing", dot: "bg-destructive", text: "text-destructive" },
  disabled: { label: "Disabled", dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
  unknown: { label: "Not checked yet", dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
};

export function StatusDot({ status, className }: { status: MonitorStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      {status === "operational" && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", config.dot)} />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", config.dot)} />
    </span>
  );
}

export function StatusLabel({ status, className }: { status: MonitorStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium", config.text, className)}>
      <StatusDot status={status} />
      {config.label}
    </span>
  );
}

export function statusLabelText(status: MonitorStatus): string {
  return STATUS_CONFIG[status].label;
}
