# SK Makeup Artist

Luxury makeup artist platform with enterprise admin dashboard and premium public website.

## Structure

```
apps/
  api/     — Express.js REST API (Node.js + TypeScript)
  web/     — Public website (React 19 + Vite)
  admin/   — Admin dashboard (React 19 + Vite)
packages/
  shared/  — Shared types, Zod schemas, constants
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- MongoDB 6+ (local install or self-hosted VPS; standard `mongodb://` connection strings)

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
# Fill in credentials — use standard MongoDB URI, e.g.:
# mongodb://username:password@host:27017/sk_makeup_artist?authSource=admin
pnpm seed
pnpm dev:api
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm.cmd install` | Install all dependencies (Windows: use `pnpm.cmd` if scripts blocked) |
| `pnpm dev:api` | Start API (port 5000) |
| `pnpm dev:web` | Start public website (port 5173) |
| `pnpm dev:admin` | Start admin dashboard (port 5174) |
| `pnpm build` | Build all packages |
| `pnpm build:api` | Build API only |
| `pnpm seed` | Seed database with super admin and defaults |
| `pnpm test:api` | Smoke-test public API routes (API must be running) |
| `pnpm typecheck` | Type-check all packages |

## Local MongoDB (Docker)

```bash
docker compose -f docker/docker-compose.mongodb.yml up -d
# Then set apps/api/.env:
# MONGODB_URI=mongodb://mongo_admin:change_me_admin@127.0.0.1:27017/sk_makeup_artist?authSource=admin
pnpm seed
pnpm dev:api
```
