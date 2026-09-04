"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthFields } from "@/components/monitors/auth-fields";
import { monitorFormSchema } from "@/lib/validation";
import { NO_AUTH, type Monitor } from "@/types";
import type { MonitorFormInput } from "@/hooks/use-monitoring-store";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const DEFAULT_VALUES = {
  name: "",
  url: "",
  method: "GET" as const,
  timeout: "10",
  expectedStatusCode: "200",
  isActive: true,
  auth: NO_AUTH,
};

interface MonitorFormDialogProps {
  monitor?: Monitor;
  onSubmit: (values: MonitorFormInput) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MonitorFormDialog({ monitor, onSubmit, trigger, open, onOpenChange }: MonitorFormDialogProps) {
  const isEdit = Boolean(monitor);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [values, setValues] = React.useState(DEFAULT_VALUES);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [authErrors, setAuthErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!dialogOpen) return;
    if (monitor) {
      setValues({
        name: monitor.name,
        url: monitor.url,
        method: monitor.method,
        timeout: String(monitor.timeout),
        expectedStatusCode: String(monitor.expectedStatusCode),
        isActive: monitor.isActive,
        auth: monitor.auth ?? NO_AUTH,
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
    setErrors({});
    setAuthErrors({});
  }, [dialogOpen, monitor]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = monitorFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      const nestedAuthErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const [root, sub] = issue.path;
        if (root === "auth" && typeof sub === "string") {
          if (!nestedAuthErrors[sub]) nestedAuthErrors[sub] = issue.message;
        } else if (typeof root === "string" && !fieldErrors[root]) {
          fieldErrors[root] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setAuthErrors(nestedAuthErrors);
      return;
    }
    setSubmitting(true);
    onSubmit(parsed.data);
    setSubmitting(false);
    setDialogOpen(false);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isControlled ? (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Monitor
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit monitor" : "Add monitor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the endpoint PulseCheck watches." : "Add an API endpoint for PulseCheck to watch."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Monitor name</Label>
            <Input
              id="name"
              placeholder="Production API"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://api.example.com/health"
              value={values.url}
              onChange={(e) => setValues((v) => ({ ...v, url: e.target.value }))}
            />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="method">HTTP method</Label>
              <Select value={values.method} onValueChange={(v) => setValues((s) => ({ ...s, method: v as typeof s.method }))}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="status">Expected status code</Label>
              <Input
                id="status"
                inputMode="numeric"
                value={values.expectedStatusCode}
                onChange={(e) => setValues((v) => ({ ...v, expectedStatusCode: e.target.value }))}
              />
              {errors.expectedStatusCode && <p className="text-xs text-destructive">{errors.expectedStatusCode}</p>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="timeout">Timeout (seconds)</Label>
            <Input
              id="timeout"
              inputMode="numeric"
              value={values.timeout}
              onChange={(e) => setValues((v) => ({ ...v, timeout: e.target.value }))}
            />
            {errors.timeout && <p className="text-xs text-destructive">{errors.timeout}</p>}
          </div>

          <AuthFields value={values.auth} onChange={(auth) => setValues((v) => ({ ...v, auth }))} errors={authErrors} />

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="active">Active</Label>
              <p className="text-xs text-muted-foreground">Inactive monitors are skipped and shown as disabled.</p>
            </div>
            <Switch id="active" checked={values.isActive} onCheckedChange={(v) => setValues((s) => ({ ...s, isActive: v }))} />
          </div>

          <DialogFooter className="mt-1">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add Monitor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
