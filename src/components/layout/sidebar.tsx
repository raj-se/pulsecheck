"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, Gauge, Github, Menu, Settings, SignalHigh, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/monitors", label: "Monitors", icon: Activity },
  { href: "/dashboard/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/status", label: "Status Page", icon: SignalHigh },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const APP_VERSION = "0.1.0";

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-border px-3 py-3">
      <a
        href="https://github.com/raj-se/pulsecheck"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        <Github className="h-4 w-4" />
        View source
      </a>
      <div className="flex items-center justify-between px-3 pt-1">
        <span className="font-mono text-xs text-muted-foreground">v{APP_VERSION}</span>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 flex-col py-4">
          <NavLinks pathname={pathname} />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
        <Link href="/">
          <Logo />
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 md:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card md:hidden">
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo />
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <div className="flex flex-1 flex-col py-4">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <SidebarFooter />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
