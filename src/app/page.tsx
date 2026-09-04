import Link from "next/link";
import { ArrowRight, Gauge, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

const FEATURES = [
  {
    icon: Gauge,
    title: "Manual, on-demand checks",
    description: "Click Check Now on any endpoint and get status code, latency, and success in under a second.",
  },
  {
    icon: LineChart,
    title: "Latency over time",
    description: "Every check builds your response-time history — charted across 24 hours, 7 days, or 30 days.",
  },
  {
    icon: ShieldCheck,
    title: "Incidents, tracked automatically",
    description: "A failing check opens an incident. A recovery closes it. No manual bookkeeping.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/status">Status Page</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="mb-4 font-mono text-xs text-muted-foreground">API performance, checked by hand</p>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-5xl">
            Monitor your APIs.
            <br />
            Understand their performance.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            A lightweight API performance monitor built for developers. Add an endpoint, run a check, and watch
            uptime and latency take shape — all stored in your browser, nowhere else.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/status">View Status Page</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">pulsecheck.app/dashboard</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
            {[
              { label: "Monitors", value: "5" },
              { label: "Healthy", value: "4" },
              { label: "Failing", value: "1" },
              { label: "Avg Latency", value: "184ms" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-mono text-xl font-semibold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="h-40 border-t border-border bg-gradient-to-t from-primary/5 to-transparent px-4 py-3">
            <svg viewBox="0 0 400 100" className="h-full w-full" preserveAspectRatio="none">
              <polyline
                points="0,70 40,60 80,65 120,40 160,50 200,30 240,45 280,25 320,38 360,20 400,32"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <feature.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row md:px-8">
          <span>PulseCheck — a portfolio project. Data lives only in your browser.</span>
          <Link href="/dashboard" className="hover:text-foreground">
            Open Dashboard →
          </Link>
        </div>
      </footer>
    </div>
  );
}
