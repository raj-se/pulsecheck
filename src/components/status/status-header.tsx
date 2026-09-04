import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CONFIG = {
  operational: {
    icon: CheckCircle2,
    label: "All systems operational",
    className: "bg-success/10 text-success border-success/20",
  },
  degraded: {
    icon: AlertTriangle,
    label: "Some systems degraded",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  failing: {
    icon: XCircle,
    label: "System outage",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  unknown: {
    icon: AlertTriangle,
    label: "No monitors configured",
    className: "bg-muted text-muted-foreground border-border",
  },
} as const;

export function StatusHeader({ status }: { status: keyof typeof CONFIG }) {
  const config = CONFIG[status];
  const Icon = config.icon;
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border px-4 py-3.5", config.className)}>
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
