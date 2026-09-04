"use client";

import * as React from "react";
import { History } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { formatMs, formatRelativeTime } from "@/lib/utils";
import type { CheckResult } from "@/types";

const PAGE_SIZE = 8;

export function RecentChecksList({ checks }: { checks: CheckResult[] }) {
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sorted = React.useMemo(
    () => [...checks].sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()),
    [checks]
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No checks yet"
        description="Run a manual check on a monitor to see its results appear here."
      />
    );
  }

  const visible = sorted.slice(0, visibleCount);

  return (
    <div>
      <ul className="divide-y divide-border">
        {visible.map((check) => (
          <li key={check.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${check.success ? "bg-success" : "bg-destructive"}`} />
              <span className="font-mono text-xs tabular-nums text-foreground">{check.statusCode ?? "—"}</span>
              {check.errorMessage && !check.success && (
                <span className="truncate text-xs text-muted-foreground">{check.errorMessage}</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatMs(check.responseTime)}</span>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(check.checkedAt)}</span>
            </div>
          </li>
        ))}
      </ul>
      {visibleCount < sorted.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-2 w-full rounded-md border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Show more ({sorted.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
