# PulseCheck

A lightweight API performance monitoring dashboard built with Next.js and TypeScript. Add an endpoint, run a check, and watch uptime and latency take shape — all stored in your browser, nowhere else.

![PulseCheck](https://img.shields.io/badge/status-portfolio--project-informational)

## Features

- Add, edit, enable/disable, and delete API monitors
- Authorization support per monitor: **Bearer Token**, **API Key** (header or query param), **Basic Auth**, or **Custom Headers**
- Manual "Check Now" health checks with status code + response-time measurement
- Response-time history chart (24h / 7d / 30d) built with Recharts
- Dynamic uptime calculation from real check history
- Automatic incident detection (opens on failure, resolves on recovery)
- Recent checks feed and per-monitor detail pages
- Search and filter monitors by status
- Local status page reflecting your browser's own check history
- Export / import your data as JSON, or clear it entirely
- Demo data generator so the dashboard never looks empty on first load
- Dark / light / system theme
- Fully responsive, with loading and empty states throughout

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui-style components (built on Radix UI primitives)
- [Recharts](https://recharts.org/) for the response-time chart
- [Zod](https://zod.dev/) for all validation (form input + the API route)
- [Lucide React](https://lucide.dev/) icons
- Browser `localStorage` — **no database**

## Architecture

```
                    Browser
                       │
              ┌────────┴────────┐
              │                 │
          localStorage       Next.js
              │             Route Handler
              │                 │
       ┌──────┴──────┐          ↓
       │             │      External API
    Monitors       History
```

- **localStorage** is the only place application data lives: monitor configuration, check history, incidents, and UI preferences (`src/lib/storage.ts`). It is never touched from a Server Component — only from Client Components and client-side utilities, to avoid hydration mismatches.
- **`POST /api/check`** (`src/app/api/check/route.ts`) is the only server-side functionality. It validates the request with Zod, runs basic SSRF protection, performs the `fetch`, measures elapsed time with `performance.now()`, and returns a structured result. It does not persist anything — the browser is responsible for saving the result to `localStorage` after the response comes back.
- **Recharts** turns the locally stored check history into the response-time chart, uptime percentage, and latency stats — all computed dynamically in `src/lib/monitoring.ts`, never hardcoded.

### Why no automatic background monitoring?

Because there is intentionally no database and no server process, PulseCheck cannot poll your APIs every N minutes while your browser is closed — `localStorage` and a stateless Route Handler simply aren't built for that. The core loop is a deliberate design choice, not a limitation to work around:

```
Add API → Check Now → Store result → Analyze history → Show charts → Detect incidents
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── dashboard/
│   │   ├── layout.tsx                # Sidebar shell
│   │   ├── page.tsx                  # Overview
│   │   ├── monitors/
│   │   │   ├── page.tsx              # Monitor list (search + filter)
│   │   │   └── [id]/page.tsx         # Monitor detail
│   │   ├── incidents/page.tsx
│   │   └── settings/page.tsx         # Appearance, demo data, export/import/clear
│   ├── status/page.tsx               # Local-only public-looking status page
│   └── api/check/route.ts            # The one server endpoint
├── components/
│   ├── ui/                           # Hand-rolled shadcn-style primitives
│   ├── dashboard/, monitors/, incidents/, charts/, status/, settings/, layout/
├── lib/
│   ├── storage.ts                    # localStorage read/write, corruption-safe
│   ├── monitoring.ts                 # Uptime, stats, incident reconciliation
│   ├── validation.ts                 # Zod schemas
│   ├── security.ts                   # SSRF protection
│   ├── demo-data.ts                  # Realistic sample data generator
│   └── utils.ts
├── hooks/
│   ├── use-monitoring-store.tsx      # Central client-side store (Context)
│   ├── use-monitors.ts, use-checks.ts, use-incidents.ts   # Thin slices of the store
│   └── use-theme.ts
└── types/index.ts
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Open Dashboard**, then **Load Demo Data** to see the app populated, or add your own monitor right away.

```bash
npm run build   # production build
npm run lint    # ESLint
```

> **Note on this build:** this project was generated in a sandboxed environment without network access, so dependencies were never installed and `npm run build` was never run here. The code is written to compile cleanly against the versions pinned in `package.json`, but please run `npm install && npm run build` yourself before treating it as verified — and open an issue-shaped mental note for anything that needs a tweak.

## Security

Because the server-side check route makes requests to URLs supplied by the user, `src/lib/security.ts` blocks obviously internal targets before any request is made:

- `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, and other loopback forms
- Private IPv4 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`), and carrier-grade NAT (`100.64.0.0/10`)
- Private/unique-local and link-local IPv6 ranges
- Hostnames ending in `.local`, `.internal`, `.lan`, or with no dot at all
- Any protocol other than `http://` or `https://`

Requests also have a hard-capped timeout (30s) and the API route never echoes back raw internal error details.

### Authorization

Each monitor can be configured with one of four authorization methods (`src/components/monitors/auth-fields.tsx`):

| Method | How it's sent |
| --- | --- |
| Bearer Token | `Authorization: Bearer <token>` header |
| API Key | A header of your choosing, or appended as a query parameter |
| Basic Auth | Username/password, base64-encoded server-side into `Authorization: Basic ...` |
| Custom Headers | Any number of arbitrary `key: value` header pairs |

Credentials are only ever sent to the exact URL the monitor points at, from `POST /api/check` on the server — they're never exposed to a third party. Secret fields (tokens, API keys, passwords, custom header values) are masked in the form with a show/hide toggle.

**Important:** because there is no database, credentials are stored the same place everything else is — **in plaintext in this browser's `localStorage`** — and are included in plaintext if you export your data from Settings. Don't use production secrets you wouldn't want sitting in browser storage or in a downloaded JSON file; consider scoped/read-only tokens where your API supports them.

**This is a portfolio/demo monitoring tool, not hardened production monitoring infrastructure.** It does not protect against DNS rebinding, redirects that resolve to a private IP after the initial safety check, IPv6 address obfuscation tricks, or a compromised/malicious DNS resolver. Don't point it at anything you wouldn't be comfortable exposing to a basic SSRF check.

## Limitations

- Data is stored only in the browser that created it — nothing syncs across devices or browsers.
- Monitoring does not continue when the browser or app is closed; there is no background scheduler.
- This is not a production distributed monitoring service.
- The status page at `/status` is local to the browser viewing it, not a globally hosted public page.
- Clearing browser storage (or using a different browser/device) means starting over — export a backup from Settings first.

## Future Improvements

- PostgreSQL (or similar) for durable, multi-device storage
- Authentication and per-user monitor ownership
- Background workers for scheduled, unattended monitoring
- Email notifications on incident open/resolve
- Slack / Discord webhook notifications
- A real, globally hosted public status page
- Checks from multiple geographic regions
  
