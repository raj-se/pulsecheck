"use client";

import { useMonitoring } from "@/hooks/use-monitoring-store";

/** Incident list, sliced from the shared monitoring store. */
export function useIncidents() {
  const { incidents } = useMonitoring();
  return { incidents };
}
