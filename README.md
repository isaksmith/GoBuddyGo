# GoBabyGo Buddy-Link AR

GoBabyGo Buddy-Link AR is a mission-driven prototype that supports the GoBabyGo vision: helping children with mobility challenges gain independence, joy, and participation through adapted ride-on cars.

This project focuses on the sibling experience. It turns a sibling from a passive observer into an active co-pilot with game mechanics, AR interactions, and safety-aware prompts while the driver stays focused on their physical controls.

## Mission Alignment

GoBabyGo's core mission is inclusive mobility and play.

This app extends that mission by:
- Encouraging family-centered, inclusive play around adapted vehicles.
- Building confidence and responsibility in siblings through guided co-pilot tasks.
- Prioritizing safety with proximity warnings and low-distraction interaction design.
- Creating accessible, joyful moments that keep the child driver in control.

## What This Repository Contains

This is a pnpm + TypeScript monorepo with mobile and API artifacts plus shared libraries.

- `artifacts/mobile`: Expo React Native app (the main Buddy-Link AR experience).
- `artifacts/api-server`: Express API server (assets, API routes, and integrations).
- `lib/api-spec`: OpenAPI source of truth.
- `lib/api-client-react`: Generated React Query client.
- `lib/api-zod`: Generated Zod schemas.
- `lib/db`: Drizzle/Postgres data layer.
- `scripts`: Utility scripts.

## Key Experience Areas

- AR-inspired co-pilot gameplay (e.g., pathfinding and station interactions).
- Parent mode and session summaries.
- Garage and custom car design workflows.
- Safety overlays (e.g., proximity warning concepts from the PRD).
- 3D vehicle visualization support.

## Tech Stack

- Monorepo: pnpm workspaces
- Language: TypeScript
- Mobile: Expo + React Native + Expo Router
- API: Express 5
- Validation: Zod
- Database: PostgreSQL + Drizzle ORM
- API codegen: Orval from OpenAPI

## Quick Start

### Prerequisites

- Node.js 24+
- pnpm 10+

### Install

```bash
pnpm install
```

### Typecheck

```bash
pnpm run typecheck
```

### Build

```bash
pnpm run build
```

## Running the Project

### API server

```bash
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

### Mobile app

The workspace `dev` script for mobile is configured for Replit environment variables.

For Replit:

```bash
pnpm --filter @workspace/mobile run dev
```

For local development on macOS/Linux, run Expo directly from the mobile package:

```bash
cd artifacts/mobile
pnpm exec expo start
```

## Environment Notes

- Some API routes rely on external credentials (for example Meshy integrations).
- Database packages expect a valid `DATABASE_URL` when DB features are enabled.


## License

MIT
