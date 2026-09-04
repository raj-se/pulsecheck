"use client";

import { Toaster } from "sonner";
import { MonitoringProvider } from "@/hooks/use-monitoring-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MonitoringProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!bg-card !text-card-foreground !border !border-border !shadow-lg",
            description: "!text-muted-foreground",
          },
        }}
      />
    </MonitoringProvider>
  );
}
