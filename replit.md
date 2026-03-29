# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, static assets at `/api/assets` (from `public/assets/`), routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Image-to-3D: `src/routes/image-to-3d.ts` exposes `POST /api/image-to-3d` and `GET /api/image-to-3d/:taskId` — proxies to Meshy.ai API using `MESHY_API_KEY` secret
- Depends on: `@workspace/db`, `@workspace/api-zod`
- **Routing**: API server `paths` must be `["/api"]` (not `["/"]`) to avoid intercepting Expo domain traffic. Both the mobile and API artifacts claim root paths, and `["/"]` on the API server shadows the Expo dev server manifest, breaking Expo Go. In production, the API server serves the mobile web build at `/` via its catch-all route but routing is handled differently (no Expo dev server running).
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/mobile` (`@workspace/mobile`)

Expo React Native mobile app — **GoBabyGo Buddy-Link AR**. A gamified companion app for siblings of children using WSU GoBabyGo modified ride-on vehicles.

- Framework: Expo SDK with Expo Router (file-based navigation)
- Fonts: `@expo-google-fonts/balsamiq-sans` (BalsamiqSans_400Regular, BalsamiqSans_700Bold)
- Camera: `expo-camera` with `CameraView` + `useCameraPermissions()`
- Sensors: `expo-sensors` Accelerometer used for shake/proximity detection
- Storage: AsyncStorage (no backend — fully offline)
- Design: Deep navy (#0D1B2A) + orange accent (#FF6B2B) + amber secondary (#FFD166)
- Navigation: 4 bottom tabs (Home/Games/Garage/Sounds) + stack routes /ar, /summary, /parent-mode, /coin-dash, /car-detail, /design-builder
- Screens: Home, Games, Garage, Sounds, AR Drive (Coin Dash), Car Detail, Design Builder, Session Summary, Parent Mode (PIN: 1234)
- Components: DefaultCarSvg (configurable SVG car), AROverlay, MissionCard, BadgeCard, CelebrationOverlay, ProximityWarning, ModelViewer (cross-platform 3D model viewer — iframe on web, WebView on native)
- Context: AppContext with savedCars (pre-seeded with default "Buddy Car" with 3D GLB model), carDesigns, session management, badge generation, AsyncStorage persistence
- Garage: Tabbed (SAVED CARS / MY DESIGNS), default "Buddy Car" always present (non-deletable, shows 3D McLaren model), used as vehicle in AR games via savedCars[0]
- 3D Models: Buddy Car GLB served from API server at `/api/assets/buddy-car.glb` (85MB); other cars use Meshy AI-generated GLBs or user-imported GLB files
- Animation: All Animated API calls use `useNativeDriver: Platform.OS !== 'web'` for web compatibility
- `pnpm --filter @workspace/mobile run dev` — start Expo dev server

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
