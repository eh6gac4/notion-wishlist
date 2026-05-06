# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Web client for a Notion database "🛒 Wishlist". The Notion DB is the source of truth; the app's Route Handlers proxy reads/writes so the `NOTION_TOKEN` stays server-side. Stack: Next.js 15 App Router + React 19 + Tailwind, NextAuth v5 (Credentials), deployed to Cloudflare Workers via `@opennextjs/cloudflare`.

The UI/code/comments are written in Japanese — match that style when editing.

## Commands

```bash
npm run dev          # next dev on port 3004 (NOT the default 3000)
npm run build        # next build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm test             # vitest run (unit, jsdom)
npm run test:watch   # vitest watch
npm run test:e2e     # playwright; auto-starts dev with USE_MOCK_DATA=1
npm run test:e2e:ui  # playwright UI mode
npm run check        # typecheck + unit test (run before pushing)

# Run a single test
npx vitest run tests/unit/Pill.test.tsx
npx playwright test tests/e2e/smoke.spec.ts
npx playwright test -g "test name"

# Cloudflare (auth via .env.local — see README, no `wrangler login` needed)
npm run cf:preview   # build + run under workerd locally
npm run cf:deploy    # build + wrangler deploy
npm run cf:typegen   # regenerate worker-configuration.d.ts after editing wrangler.jsonc
npm run cf:secret -- NOTION_TOKEN  # register a Workers secret
```

CI (`.github/workflows/ci.yml`) runs `verify` (typecheck → test → build with `USE_MOCK_DATA=1`) and `e2e` on every PR. Both jobs must be green to merge.

## Architecture

### Data layer — always go through `lib/store.ts`

`lib/store.ts` is a thin facade that picks `lib/notion.ts` (real Notion API) or `lib/mock.ts` (in-memory store) based on `isMockMode()` in `lib/env.ts`. **Route handlers and components must import from `lib/store.ts`, not from `notion.ts`/`mock.ts` directly** — this is enforced by convention, not the type system.

`isMockMode()` returns `true` when `USE_MOCK_DATA=1`, when `USE_MOCK_DATA=0` is unset and either `NOTION_TOKEN` or `NOTION_DATABASE_ID` is missing. So `npm run dev` Just Works without credentials, and Playwright runs against the same mock path.

The mock store lives on `globalThis.__wishlistMockStore` so it survives Next.js dev hot-reload but resets on full server restart.

### Notion property mapping

`lib/types.ts` defines `WishItem` and the hardcoded Japanese option labels (`STATUSES = ["検討中", "購入予定", "購入済み", "却下"]`, `PRIORITIES = ["高", "中", "低"]`). If the real Notion DB uses different option names, change these constants — the strings flow straight through to the Notion API.

`lib/notion.ts` maps between `WishItem` and Notion's `PageObjectResponse`. Property names default to Japanese (`品名`, `URL`, `価格`, `ステータス`, `優先度`, `購入予定日`) but each is overridable via `NOTION_PROP_*` env vars (see `PROPS`). Archive = `pages.update({ archived: true })`, not actual deletion.

### Cloudflare Workers gotcha

`lib/notion.ts` constructs the Notion client with `fetch: (url, init) => globalThis.fetch(url, init)`. The SDK's default `node-fetch` path breaks under `nodejs_compat` on workerd. Don't remove this when touching the Notion client.

`wrangler.jsonc` puts non-secret config in `vars` (`NOTION_DATABASE_ID`, `USE_MOCK_DATA`); `NOTION_TOKEN` must only be set via `wrangler secret put` — never add it to `vars`. After editing `wrangler.jsonc`, run `npm run cf:typegen`.

### Auth

NextAuth v5 with a single Credentials provider checking `APP_USERNAME` / `APP_PASSWORD` from `config.ts`. JWT strategy with a 15-minute access token and a 30-day refresh window (handled in `auth.ts`'s `jwt` callback — when access expires but refresh is still valid, the access expiry is bumped without re-auth).

`middleware.ts` redirects unauthenticated requests to `/login` and skips a fixed list of static/API/PWA paths in its `matcher`. **Auth is bypassed entirely when `NODE_ENV !== "production"` and (mock mode or `DISABLE_AUTH=1`)** — so dev with mock data needs no login.

`/api/login` (the form-post endpoint, separate from `/api/auth/[...nextauth]`) applies a per-IP failure counter from `lib/rate-limit.ts` (5 attempts → 30-minute lockout). The counter is an in-memory `Map`, so it resets per Workers isolate — it's a "first line of defense", not a hard limit.

### Client app

`app/page.tsx` is a Server Component that fetches items via `listItems()` and passes them to the Client Component `components/WishlistApp.tsx`. `WishlistApp` owns the entire UI state (filter, sort, query, items) and applies optimistic updates: it mutates local state, then PATCH/DELETE; on failure it rolls back to the previous array. Keep that pattern when adding mutating actions.

### PWA / Service Worker

`@serwist/next` compiles `app/sw.ts` to `public/sw.js`. The SW is **disabled in dev** (`next.config.ts`). `app/sw.ts` defines two custom runtime caches: a NetworkFirst for `/api/items` GETs (with a `cacheWillUpdate` guard that refuses redirected/non-JSON responses so a session-expired login redirect doesn't poison the cache), and a CacheFirst for images. Document fallback is `/offline`.

If you change SW behaviour, remember `serwist.skipWaiting + clientsClaim` mean the new SW takes effect on next navigation — old clients can briefly hit stale caches.

## Conventions

- One task = one branch = one PR. Branch prefixes: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`. Squash-merge into `main`.
- Test layout: `tests/unit/**/*.test.{ts,tsx}` (vitest, jsdom) and `tests/e2e/**/*.spec.ts` (playwright). The `@/*` alias resolves to repo root in both vitest and tsconfig.
- Pre-commit hook failures: fix and create a **new** commit, do not `--amend` (CONTRIBUTING.md §7).
- The `/simplify` skill is part of the documented workflow — run it on changed files before writing tests, per CONTRIBUTING.md and the PR template.
