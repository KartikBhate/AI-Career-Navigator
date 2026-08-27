# AI Career & Skill Navigator

A guided intake experience for college students to turn their education, skills, interests, and target career into a clearer next move.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/career-navigator/src/App.tsx` — the single-page Pathfinder intake flow and local state
- `artifacts/career-navigator/src/index.css` — visual theme, typography, layout utilities, and motion
- `artifacts/career-navigator/src/pages/not-found.tsx` — fallback route

## Architecture decisions

- The first release is frontend-only and keeps the intake in local React state so students can explore the flow without account setup or backend dependencies.
- The five-stage flow validates each required signal before moving forward and preserves answers through review/edit states.

## Product

- Pathfinder guides students through education, skills, interests, and career direction.
- Skills support typed tags, suggestions, duplicate prevention, and removal.
- Interests support multi-select plus optional context, while career direction supports free text and suggested roles.
- Review and completion states summarize the student's signal and generate a personalized four-step roadmap from the submitted profile and weekly study time.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
