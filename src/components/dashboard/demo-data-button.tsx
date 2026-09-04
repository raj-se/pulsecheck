"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMonitoring } from "@/hooks/use-monitoring-store";

export function LoadDemoDataButton({ variant = "outline" }: { variant?: "outline" | "default" }) {
  const { loadDemoData } = useMonitoring();
  return (
    <Button variant={variant} size="sm" onClick={loadDemoData}>
      <Sparkles className="h-4 w-4" />
      Load Demo Data
    </Button>
  );
}
