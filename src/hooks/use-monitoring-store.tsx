"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AuthConfig, CheckResult, ExportPayload, HttpMethod, Incident, Monitor } from "@/types";
import {
  getMonitors,
  saveMonitors,
  getChecks,
  saveChecks,
  getIncidents,
  saveIncidents,
  isStorageAvailable,
  isDemoLoaded,
  setDemoLoaded,
  clearAllData as clearAllStorageData,
} from "@/lib/storage";
import { generateDemoData } from "@/lib/demo-data";
import { reconcileIncidents } from "@/lib/monitoring";
import { exportPayloadSchema } from "@/lib/validation";
import { genId } from "@/lib/utils";

export interface MonitorFormInput {
  name: string;
  url: string;
  method: HttpMethod;
  timeout: number;
  expectedStatusCode: number;
  isActive: boolean;
  auth: AuthConfig;
}

interface MonitoringState {
  monitors: Monitor[];
  checks: CheckResult[];
  incidents: Incident[];
  loaded: boolean;
  storageAvailable: boolean;
  demoLoaded: boolean;
  checkingIds: Set<string>;
}

interface MonitoringContextValue extends MonitoringState {
  addMonitor: (input: MonitorFormInput) => Monitor;
  updateMonitor: (id: string, input: MonitorFormInput) => void;
  deleteMonitor: (id: string) => void;
  runCheck: (monitorId: string) => Promise<void>;
  loadDemoData: () => void;
  clearDemoData: () => void;
  clearAllData: () => void;
  exportData: () => ExportPayload;
  importData: (payload: unknown) => { success: boolean; error?: string };
}

const MonitoringContext = React.createContext<MonitoringContextValue | null>(null);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<MonitoringState>({
    monitors: [],
    checks: [],
    incidents: [],
    loaded: false,
    storageAvailable: true,
    demoLoaded: false,
    checkingIds: new Set(),
  });

  React.useEffect(() => {
    const storageAvailable = isStorageAvailable();
    setState((prev) => ({
      ...prev,
      monitors: getMonitors(),
      checks: getChecks(),
      incidents: getIncidents(),
      demoLoaded: isDemoLoaded(),
      storageAvailable,
      loaded: true,
    }));
  }, []);

  const persist = React.useCallback(
    (next: Partial<Pick<MonitoringState, "monitors" | "checks" | "incidents">>) => {
      if (next.monitors) saveMonitors(next.monitors);
      if (next.checks) saveChecks(next.checks);
      if (next.incidents) saveIncidents(next.incidents);
    },
    []
  );

  const addMonitor = React.useCallback(
    (input: MonitorFormInput): Monitor => {
      const now = new Date().toISOString();
      const monitor: Monitor = { id: genId("mon"), ...input, createdAt: now, updatedAt: now };
      setState((prev) => {
        const monitors = [monitor, ...prev.monitors];
        persist({ monitors });
        return { ...prev, monitors };
      });
      return monitor;
    },
    [persist]
  );

  const updateMonitor = React.useCallback(
    (id: string, input: MonitorFormInput) => {
      setState((prev) => {
        const monitors = prev.monitors.map((m) =>
          m.id === id ? { ...m, ...input, updatedAt: new Date().toISOString() } : m
        );
        persist({ monitors });
        return { ...prev, monitors };
      });
    },
    [persist]
  );

  const deleteMonitor = React.useCallback(
    (id: string) => {
      setState((prev) => {
        const monitors = prev.monitors.filter((m) => m.id !== id);
        const checks = prev.checks.filter((c) => c.monitorId !== id);
        const incidents = prev.incidents.filter((i) => i.monitorId !== id);
        persist({ monitors, checks, incidents });
        return { ...prev, monitors, checks, incidents };
      });
    },
    [persist]
  );

  const runCheck = React.useCallback(
    async (monitorId: string) => {
      const monitor = state.monitors.find((m) => m.id === monitorId);
      if (!monitor) return;

      setState((prev) => ({ ...prev, checkingIds: new Set(prev.checkingIds).add(monitorId) }));

      let result: CheckResult;
      try {
        const response = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: monitor.url,
            method: monitor.method,
            timeout: monitor.timeout * 1000,
            auth: monitor.auth,
          }),
        });
        const body = (await response.json()) as {
          success: boolean;
          statusCode: number | null;
          responseTime: number | null;
          errorMessage?: string;
        };

        const success = body.success && body.statusCode === monitor.expectedStatusCode;
        result = {
          id: genId("chk"),
          monitorId,
          statusCode: body.statusCode,
          responseTime: body.responseTime,
          success,
          errorMessage:
            body.success && !success
              ? `Expected status ${monitor.expectedStatusCode}, got ${body.statusCode}.`
              : body.errorMessage,
          checkedAt: new Date().toISOString(),
        };
      } catch {
        result = {
          id: genId("chk"),
          monitorId,
          statusCode: null,
          responseTime: null,
          success: false,
          errorMessage: "Could not reach the check service. Check your connection and try again.",
          checkedAt: new Date().toISOString(),
        };
      }

      setState((prev) => {
        const checks = [result, ...prev.checks];
        const { incidents, opened, resolved } = reconcileIncidents(prev.incidents, monitor, result);
        persist({ checks, incidents });

        const nextChecking = new Set(prev.checkingIds);
        nextChecking.delete(monitorId);

        if (opened) {
          toast.error(`${monitor.name} is down`, { description: opened.reason });
        } else if (resolved) {
          toast.success(`${monitor.name} recovered`);
        } else if (result.success) {
          toast.success(`${monitor.name}: ${result.statusCode} in ${result.responseTime}ms`);
        } else {
          toast.error(`${monitor.name} check failed`, { description: result.errorMessage });
        }

        return { ...prev, checks, incidents, checkingIds: nextChecking };
      });
    },
    [state.monitors, persist]
  );

  const loadDemoData = React.useCallback(() => {
    const demo = generateDemoData();
    setState((prev) => {
      const monitors = [...demo.monitors, ...prev.monitors];
      const checks = [...demo.checks, ...prev.checks];
      const incidents = [...demo.incidents, ...prev.incidents];
      persist({ monitors, checks, incidents });
      setDemoLoaded(true);
      return { ...prev, monitors, checks, incidents, demoLoaded: true };
    });
    toast.success("Demo data loaded");
  }, [persist]);

  const clearDemoData = React.useCallback(() => {
    setState((prev) => {
      const demoIds = new Set(prev.monitors.filter((m) => m.isDemo).map((m) => m.id));
      const monitors = prev.monitors.filter((m) => !m.isDemo);
      const checks = prev.checks.filter((c) => !demoIds.has(c.monitorId));
      const incidents = prev.incidents.filter((i) => !demoIds.has(i.monitorId));
      persist({ monitors, checks, incidents });
      setDemoLoaded(false);
      return { ...prev, monitors, checks, incidents, demoLoaded: false };
    });
    toast.success("Demo data removed");
  }, [persist]);

  const clearAllData = React.useCallback(() => {
    clearAllStorageData();
    setState((prev) => ({ ...prev, monitors: [], checks: [], incidents: [], demoLoaded: false }));
    toast.success("All local data cleared");
  }, []);

  const exportData = React.useCallback((): ExportPayload => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      monitors: state.monitors,
      checks: state.checks,
      incidents: state.incidents,
    };
  }, [state.monitors, state.checks, state.incidents]);

  const importData = React.useCallback(
    (payload: unknown): { success: boolean; error?: string } => {
      const parsed = exportPayloadSchema.safeParse(payload);
      if (!parsed.success) {
        return { success: false, error: "That file doesn't look like a valid PulseCheck backup." };
      }
      const { monitors, checks, incidents } = parsed.data;
      persist({ monitors, checks, incidents });
      setState((prev) => ({ ...prev, monitors, checks, incidents }));
      toast.success("Data imported successfully");
      return { success: true };
    },
    [persist]
  );

  const value: MonitoringContextValue = {
    ...state,
    addMonitor,
    updateMonitor,
    deleteMonitor,
    runCheck,
    loadDemoData,
    clearDemoData,
    clearAllData,
    exportData,
    importData,
  };

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring(): MonitoringContextValue {
  const ctx = React.useContext(MonitoringContext);
  if (!ctx) throw new Error("useMonitoring must be used within a MonitoringProvider");
  return ctx;
}
