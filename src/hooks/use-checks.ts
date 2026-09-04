"use client";

import { useMonitoring } from "@/hooks/use-monitoring-store";

/** Check history + the manual "Check Now" action, sliced from the shared store. */
export function useChecks() {
  const { checks, runCheck, checkingIds } = useMonitoring();
  return { checks, runCheck, checkingIds };
}
