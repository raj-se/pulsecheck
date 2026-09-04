"use client";

import { Moon, Sparkles, Sun, SunMoon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExportDataButton, ImportDataButton } from "@/components/settings/export-import";
import { ClearAllDataButton } from "@/components/settings/clear-data";
import { useTheme } from "@/hooks/use-theme";
import { useMonitoring } from "@/hooks/use-monitoring-store";
import { cn } from "@/lib/utils";

const APPEARANCE_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: SunMoon },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { monitors, demoLoaded, loadDemoData, clearDemoData, storageAvailable } = useMonitoring();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Appearance, demo data, and your local backup." />

      {!storageAvailable && (
        <div className="mb-6 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          localStorage isn&apos;t available in this browser (private browsing or storage may be disabled). PulseCheck
          will still work, but nothing will be saved between visits.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how PulseCheck looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {APPEARANCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-md border px-3 py-3 text-xs font-medium transition-colors",
                  theme === option.value
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Demo Data</CardTitle>
          <CardDescription>
            {demoLoaded
              ? "Demo monitors and sample history are currently loaded."
              : "Load a few sample monitors with realistic history to explore PulseCheck."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          {demoLoaded ? (
            <Button variant="outline" size="sm" onClick={clearDemoData}>
              Remove Demo Data
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={loadDemoData}>
              <Sparkles className="h-4 w-4" />
              Load Demo Data
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Everything is stored in this browser&apos;s localStorage — {monitors.length} monitor
            {monitors.length === 1 ? "" : "s"} right now. Export a backup before clearing your browser data. If any
            monitor has authorization configured, its tokens or credentials are stored and exported in plaintext —
            keep exported files as safe as you would a password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <ExportDataButton />
            <ImportDataButton />
          </div>
          <Separator className="my-4" />
          <ClearAllDataButton />
        </CardContent>
      </Card>
    </div>
  );
}
