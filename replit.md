# KumbhSathi

A production-ready mobile-first web app serving as a pilgrimage companion for Kumbh Mela 2027 in Prayagraj — combining spiritual guidance, real-time crowd monitoring, emergency response, and AI-powered assistance.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/kumbhsathi run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session encryption

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server) — port 8080, path /api
- Frontend: React + Vite + wouter + TanStack Query + shadcn UI + framer-motion (artifacts/kumbhsathi) — path /
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)
- Build: esbuild (CJS bundle for API)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all contracts)
- `lib/api-zod/src/` — Generated Zod schemas from Orval
- `lib/api-client-react/src/generated/` — Generated React Query hooks from Orval
- `lib/db/src/schema/` — Drizzle ORM schema files (9 tables)
- `artifacts/api-server/src/routes/` — Express route handlers (13 route files)
- `artifacts/kumbhsathi/src/pages/` — React page components (15 pages)
- `artifacts/kumbhsathi/src/components/` — Shared UI components

## Architecture decisions

- Contract-first: OpenAPI spec defines all API shapes; Orval generates hooks and Zod validators automatically
- Simple JWT: Token stored in localStorage as `kumbh_token`; passed via custom-fetch to all API calls
- AI chatbot: Built-in knowledge base for Kumbh Mela queries — no external AI API needed
- No external map API: Map page shows coordinates, zone data, and links to Google Maps
- Guest mode: Full app access without registration via `/api/auth/guest`

## Product

KumbhSathi gives pilgrims at Kumbh Mela 2027:
- **Dashboard** — real-time crowd level, weather, active alerts ticker, upcoming events, quick access grid
- **Temple Explorer** — searchable list of temples/ghats with Hindi names, timings, crowd levels, rules, bookmarks
- **Events & Schedule** — all Kumbh events + Shahi Snan bathing dates with countdown timers
- **Lost & Found** — report and find missing persons/items; admin approval queue
- **Emergency Hub** — center-stage SOS button (GPS-based), emergency hotlines, nearby hospitals/police
- **AI Guide** — Hindi/English/Marathi chatbot with Kumbh knowledge (temples, snan dates, safety, navigation)
- **Crowd Monitor** — zone-by-zone density with capacity percentages and color-coded levels
- **Map** — service directory (hospitals, police, toilets, food, parking) filterable by type
- **Admin Panel** — broadcast alerts, manage crowd zones, approve lost-found reports, view SOS incidents
- **Profile** — edit personal info, emergency contacts, medical info

## User preferences

- Mobile-first design, max-width container on desktop
- Saffron primary color, deep midnight blue dark mode, warm gold accents
- Poppins font
- No emojis in UI — lucide-react icons only
- Hindi/English/Marathi language support

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after editing openapi.yaml before building
- Run `pnpm --filter @workspace/db run push` after editing lib/db/src/schema/ files
- API server must be running for the web app to show real data
- The crowd heatmap route `/api/crowd/heatmap` returns coordinates for visual overlays

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Generated hooks: `lib/api-client-react/src/generated/api.ts`
- Custom fetch (auth token injection): `lib/api-client-react/src/custom-fetch.ts`
