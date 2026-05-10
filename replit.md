# روايتي (Riwayati)

Arabic literary platform where writers craft novels with AI assistance, share their work, and build a readership.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000→8080 via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only, may prompt)
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Clerk (`@clerk/express`) for auth
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + TailwindCSS v4, Wouter router, Clerk React
- AI: OpenAI via Replit AI Integration (SSE streaming)

## Where things live

- `lib/db/src/schema/` — DB schema (users, books, chapters, links)
- `lib/api-spec/` — OpenAPI spec + generated Zod schemas + React Query hooks
- `artifacts/api-server/src/` — Express server (routes, middlewares)
- `artifacts/literary-platform/src/` — React frontend
- `artifacts/literary-platform/public/logo.png` — R|J brand logo

## Architecture decisions

- **Clerk auth**: Frontend uses `@clerk/react` ClerkProvider with Wouter routerPush/routerReplace adapters. Backend uses `@clerk/express` `clerkMiddleware` + `getAuth`. Users are synced to DB on first sign-in via `POST /api/auth/sync`.
- **Black-and-white theme**: All CSS variables in `index.css` are pure black/white/gray. No color accents.
- **AI writing**: `POST /api/ai/write` streams SSE chunks from OpenAI `gpt-4.1` directly to the browser, which appends tokens into the chapter textarea.
- **Auth flow**: Clerk JWT → `getAuth(req)` → DB lookup by `clerkId` → `req.userId` (integer) set on request.
- **No session middleware**: `express-session` is in package.json but unused. Auth is fully stateless via Clerk JWTs.

## Product

- **Home**: Hero landing + trending books + stats
- **Explore**: Browse/search all published books
- **Write**: Manage your books library, create new books
- **Write Book**: Chapter editor with auto-save + AI writing panel (SSE streaming)
- **Profile**: Public author page with books + bio links
- **Settings**: Edit display name, bio, avatar; manage social links

## User preferences

- Arabic RTL UI throughout (`dir="rtl"`)
- Font: Playfair Display (serif) for headings/brand, Plus Jakarta Sans for body
- Brand: روايتي with R|J logo (public/logo.png)

## Gotchas

- `pnpm --filter @workspace/db run push-force` — use force flag to skip interactive truncation prompt
- Schema already has `clerk_id` (nullable, unique) and nullable `password_hash` — applied via raw SQL
- Clerk routes in Wouter: sign-in uses `routing="path"` with `basePath` prefix; `routerPush` strips basePath before calling wouter `setLocation`
- SSE streaming: use fetch API (not EventSource) for POST-based streaming

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Clerk skill: `.local/skills/clerk-auth/SKILL.md`
