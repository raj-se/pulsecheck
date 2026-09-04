"use client";

import { Loader2, Zap } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useChecks } from "@/hooks/use-checks";

export function CheckNowButton({ monitorId, size = "sm", variant = "outline" }: { monitorId: string } & Pick<ButtonProps, "size" | "variant">) {
  const { runCheck, checkingIds } = useChecks();
  const isChecking = checkingIds.has(monitorId);

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isChecking}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void runCheck(monitorId);
      }}
    >
      {isChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
      {isChecking ? "Checking…" : "Check Now"}
    </Button>
  );
}
