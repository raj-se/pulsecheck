"use client";

import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SecretInput } from "@/components/ui/secret-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuthConfig, AuthType, CustomHeader } from "@/types";

const AUTH_OPTIONS: { value: AuthType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bearer", label: "Bearer Token" },
  { value: "apiKey", label: "API Key" },
  { value: "basic", label: "Basic Auth" },
  { value: "custom", label: "Custom Headers" },
];

export interface AuthFieldsProps {
  value: AuthConfig;
  onChange: (next: AuthConfig) => void;
  errors?: Record<string, string>;
}

export function AuthFields({ value, onChange, errors = {} }: AuthFieldsProps) {
  function update(patch: Partial<AuthConfig>) {
    onChange({ ...value, ...patch });
  }

  function updateHeader(index: number, patch: Partial<CustomHeader>) {
    const headers = [...(value.customHeaders ?? [])];
    headers[index] = { ...headers[index], ...patch } as CustomHeader;
    update({ customHeaders: headers });
  }

  function addHeader() {
    update({ customHeaders: [...(value.customHeaders ?? []), { key: "", value: "" }] });
  }

  function removeHeader(index: number) {
    update({ customHeaders: (value.customHeaders ?? []).filter((_, i) => i !== index) });
  }

  return (
    <div className="grid gap-3 rounded-md border border-border p-3">
      <div className="grid gap-1.5">
        <Label htmlFor="auth-type">Authorization</Label>
        <Select value={value.type} onValueChange={(v) => update({ type: v as AuthType })}>
          <SelectTrigger id="auth-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUTH_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Sent with the request when checking this monitor. Stored in this browser&apos;s localStorage.
        </p>
      </div>

      {value.type === "bearer" && (
        <div className="grid gap-1.5">
          <Label htmlFor="bearer-token">Token</Label>
          <SecretInput
            id="bearer-token"
            placeholder="eyJhbGciOi..."
            value={value.bearerToken ?? ""}
            onChange={(e) => update({ bearerToken: e.target.value })}
          />
          {errors.bearerToken && <p className="text-xs text-destructive">{errors.bearerToken}</p>}
          <p className="text-xs text-muted-foreground">Sent as {"`Authorization: Bearer <token>`"}.</p>
        </div>
      )}

      {value.type === "apiKey" && (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="apikey-name">Header or param name</Label>
              <Input
                id="apikey-name"
                placeholder="X-API-Key"
                value={value.apiKeyName ?? ""}
                onChange={(e) => update({ apiKeyName: e.target.value })}
              />
              {errors.apiKeyName && <p className="text-xs text-destructive">{errors.apiKeyName}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="apikey-location">Send as</Label>
              <Select
                value={value.apiKeyLocation ?? "header"}
                onValueChange={(v) => update({ apiKeyLocation: v as "header" | "query" })}
              >
                <SelectTrigger id="apikey-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="query">Query parameter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="apikey-value">Key value</Label>
            <SecretInput
              id="apikey-value"
              placeholder="sk_live_..."
              value={value.apiKeyValue ?? ""}
              onChange={(e) => update({ apiKeyValue: e.target.value })}
            />
            {errors.apiKeyValue && <p className="text-xs text-destructive">{errors.apiKeyValue}</p>}
          </div>
        </div>
      )}

      {value.type === "basic" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="basic-username">Username</Label>
            <Input
              id="basic-username"
              value={value.basicUsername ?? ""}
              onChange={(e) => update({ basicUsername: e.target.value })}
            />
            {errors.basicUsername && <p className="text-xs text-destructive">{errors.basicUsername}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="basic-password">Password</Label>
            <SecretInput
              id="basic-password"
              value={value.basicPassword ?? ""}
              onChange={(e) => update({ basicPassword: e.target.value })}
            />
            {errors.basicPassword && <p className="text-xs text-destructive">{errors.basicPassword}</p>}
          </div>
        </div>
      )}

      {value.type === "custom" && (
        <div className="grid gap-2">
          <Label>Headers</Label>
          {(value.customHeaders ?? []).map((header, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Header-Name"
                value={header.key}
                onChange={(e) => updateHeader(index, { key: e.target.value })}
                className="w-2/5"
              />
              <SecretInput
                placeholder="value"
                value={header.value}
                onChange={(e) => updateHeader(index, { value: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground"
                onClick={() => removeHeader(index)}
                aria-label="Remove header"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {errors.customHeaders && <p className="text-xs text-destructive">{errors.customHeaders}</p>}
          <Button type="button" variant="outline" size="sm" onClick={addHeader} className="mt-1 w-fit">
            <Plus className="h-3.5 w-3.5" />
            Add Header
          </Button>
        </div>
      )}
    </div>
  );
}
