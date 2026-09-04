"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LineChart as ChartIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { checksInRange } from "@/lib/monitoring";
import { formatMs } from "@/lib/utils";
import type { CheckResult, TimeRange } from "@/types";

const RANGE_LABEL: Record<TimeRange, string> = { "24h": "24 Hours", "7d": "7 Days", "30d": "30 Days" };

function tickFormatter(range: TimeRange) {
  return (value: string) => {
    const date = new Date(value);
    if (range === "24h") return date.toLocaleTimeString(undefined, { hour: "numeric" });
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
}

interface ChartPoint {
  time: string;
  responseTime: number | null;
  success: boolean;
}

export function ResponseTimeChart({ checks, minRange = "24h" }: { checks: CheckResult[]; minRange?: TimeRange }) {
  const [range, setRange] = React.useState<TimeRange>(minRange);

  const data = React.useMemo<ChartPoint[]>(() => {
    const inRange = checksInRange(checks, range)
      .slice()
      .sort((a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime());
    return inRange.map((c) => ({ time: c.checkedAt, responseTime: c.responseTime, success: c.success }));
  }, [checks, range]);

  const hasData = data.length > 1;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Response Time</h3>
        <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <TabsList>
            {(Object.keys(RANGE_LABEL) as TimeRange[]).map((r) => (
              <TabsTrigger key={r} value={r} className="text-xs">
                {RANGE_LABEL[r]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {hasData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="responseTimeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                tickFormatter={tickFormatter(range)}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}ms`}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(value: string) => new Date(value).toLocaleString()}
                formatter={(value: number) => [formatMs(value), "Response time"]}
              />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#responseTimeFill)"
                connectNulls
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          icon={ChartIcon}
          title="Not enough data yet"
          description={`Run a few checks and this chart will fill in with response times over the last ${RANGE_LABEL[range].toLowerCase()}.`}
          className="h-64 justify-center"
        />
      )}
    </div>
  );
}
