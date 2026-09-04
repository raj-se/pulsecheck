"use client";

import * as React from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMonitoring } from "@/hooks/use-monitoring-store";

export function ExportDataButton() {
  const { exportData } = useMonitoring();

  function handleExport() {
    const payload = exportData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pulsecheck-backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4" />
      Export Data
    </Button>
  );
}

export function ImportDataButton() {
  const { importData } = useMonitoring();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pendingPayload, setPendingPayload] = React.useState<unknown>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setPendingPayload(parsed);
        setConfirmOpen(true);
      } catch {
        toast.error("That file isn't valid JSON.");
      }
    };
    reader.onerror = () => toast.error("Couldn't read that file.");
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    const result = importData(pendingPayload);
    if (!result.success) {
      toast.error("Import failed", { description: result.error });
    }
    setConfirmOpen(false);
    setPendingPayload(null);
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        Import Data
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing data?</AlertDialogTitle>
            <AlertDialogDescription>
              Importing this file will replace all monitors, check history, and incidents currently stored in this
              browser. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPayload(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>Replace data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
