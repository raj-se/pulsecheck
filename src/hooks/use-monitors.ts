"use client";

import { useMonitoring } from "@/hooks/use-monitoring-store";

/** Monitor list + CRUD actions, sliced from the shared monitoring store. */
export function useMonitors() {
  const { monitors, addMonitor, updateMonitor, deleteMonitor, loaded } = useMonitoring();
  return { monitors, addMonitor, updateMonitor, deleteMonitor, loaded };
}
