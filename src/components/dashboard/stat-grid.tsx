import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "destructive" | "warning";
}

const TONE_CLASS: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
};

export function StatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums", TONE_CLASS[stat.tone ?? "default"])}>
              {stat.value}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
