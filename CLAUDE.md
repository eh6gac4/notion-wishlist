# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Notion データベース「🛒 Wishlist」の Web クライアント。Notion DB が正本（Source of Truth）で、`NOTION_TOKEN` をサーバ側に閉じ込めるため、Route Handlers が Notion API を仲介する。スタックは Next.js 15 App Router + React 19 + Tailwind、認証は NextAuth v5 (Credentials)、本番は `@opennextjs/cloudflare` 経由で Cloudflare Workers にデプロイ。

UI・コメント・ドキュメントは日本語。編集時はこれに合わせること。

## コマンド

```bash
npm run dev          # next dev — ポートは 3004（デフォルトの 3000 ではない）
npm run build        # next build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm test             # vitest run（ユニット, jsdom）
npm run test:watch   # vitest 監視モード
npm run test:e2e     # playwright。USE_MOCK_DATA=1 で dev を自動起動
npm run test:e2e:ui  # playwright UI モード
npm run check        # typecheck + unit test（push 前に必ず）

# 単一テスト実行
npx vitest run tests/unit/Pill.test.tsx
npx playwright test tests/e2e/smoke.spec.ts
npx playwright test -g "テスト名"

# Cloudflare（認証は .env.local 経由。`wrangler login` 不要。詳細は README）
npm run cf:preview   # build + workerd でローカル実行
npm run cf:deploy    # build + wrangler deploy
npm run cf:typegen   # wrangler.jsonc を編集したら worker-configuration.d.ts を再生成
npm run cf:secret -- NOTION_TOKEN  # Workers の secret を登録
```

CI（`.github/workflows/ci.yml`）は PR ごとに `verify`（typecheck → test → `USE_MOCK_DATA=1` での build）と `e2e` を走らせる。両方 green でないとマージ不可。

## アーキテクチャ

### データ層 — 必ず `lib/store.ts` を経由する

`lib/store.ts` は薄いファサードで、`lib/env.ts` の `isMockMode()` を見て `lib/notion.ts`（実 Notion API）か `lib/mock.ts`（メモリ内ストア）に振り分ける。**Route Handler とコンポーネントは `lib/store.ts` から import すること。`notion.ts` / `mock.ts` を直接呼ばない** — 型では強制されないが規約として守る。

`isMockMode()` は `USE_MOCK_DATA=1` の時、または `USE_MOCK_DATA=0` が未設定で `NOTION_TOKEN` か `NOTION_DATABASE_ID` のどちらかが欠けている時に `true` を返す。だから `npm run dev` は資格情報なしでそのまま動くし、Playwright も同じモック経路で走る。

モックストアは `globalThis.__wishlistMockStore` に置いてあるので Next.js の dev ホットリロードでは生き残るが、サーバ完全再起動でリセットされる。

### Notion プロパティのマッピング

`lib/types.ts` に `WishItem` と日本語の選択肢ラベル（`STATUSES = ["検討中", "購入予定", "購入済み", "却下"]`、`PRIORITIES = ["高", "中", "低"]`）がハードコードされている。実 Notion DB の選択肢名が違う場合はこの定数を変える — 文字列はそのまま Notion API に流れる。

`lib/notion.ts` が `WishItem` ↔ Notion `PageObjectResponse` を変換する。プロパティ名のデフォルトは日本語（`品名`, `URL`, `価格`, `ステータス`, `優先度`, `購入予定日`）だが、それぞれ `NOTION_PROP_*` 環境変数で上書きできる（`PROPS` を参照）。アーカイブは `pages.update({ archived: true })` で、完全削除ではない。

### Cloudflare Workers の落とし穴

`lib/notion.ts` は Notion クライアントを `fetch: (url, init) => globalThis.fetch(url, init)` で生成している。SDK 既定の `node-fetch` 経路は workerd の `nodejs_compat` で落ちるので、Notion クライアントを触る時にこれを消さないこと。

`wrangler.jsonc` には公開して良い設定だけ `vars` に入れる（`NOTION_DATABASE_ID`, `USE_MOCK_DATA`）。`NOTION_TOKEN` は必ず `wrangler secret put` で登録する — `vars` に入れない。`wrangler.jsonc` を編集したら `npm run cf:typegen` を実行する。

### 認証

NextAuth v5、Credentials プロバイダ 1 つで `config.ts` の `APP_USERNAME` / `APP_PASSWORD` を突き合わせる。JWT 戦略で access token は 15 分、refresh は 30 日（`auth.ts` の `jwt` callback で処理）— access が切れても refresh が有効なら再認証なしで access の expiry だけ伸ばす。

`middleware.ts` は未認証リクエストを `/login` にリダイレクトし、静的・API・PWA 関連の固定パスは `matcher` で除外する。**`NODE_ENV !== "production"` かつ（モックモードまたは `DISABLE_AUTH=1`）の時は認証を完全にバイパスする** — つまり dev のモックモードではログイン不要。

`/api/login`（`/api/auth/[...nextauth]` とは別のフォーム POST 用）は `lib/rate-limit.ts` の IP ごとの失敗カウンタを噛ませている（5 回失敗で 30 分ロック）。カウンタはメモリ内 `Map` なので Workers の isolate ごとにリセットされる — 厳密な制限ではなく「最初の防御層」。

### クライアント

`app/page.tsx` は Server Component で、`listItems()` で取得して Client Component の `components/WishlistApp.tsx` に渡す。`WishlistApp` が UI 状態（フィルタ・ソート・クエリ・items）を全部持ち、楽観的更新を使う：ローカル state を先に変更し、PATCH/DELETE を投げ、失敗したら直前の配列にロールバック。変更系アクションを足す時はこのパターンを踏襲する。

### PWA / Service Worker

`@serwist/next` が `app/sw.ts` を `public/sw.js` にコンパイルする。**dev では SW を無効化**（`next.config.ts`）。`app/sw.ts` には独自のランタイムキャッシュが 2 つ：`/api/items` GET 用の NetworkFirst（`cacheWillUpdate` でリダイレクト・非 JSON レスポンスを弾き、セッション切れの login リダイレクトをキャッシュに混入させない）と画像用の CacheFirst。document fallback は `/offline`。

SW の挙動を変える時は `serwist.skipWaiting + clientsClaim` の効果で次の遷移から新 SW が効くことを意識する — 古いクライアントが一時的に古いキャッシュにヒットする可能性がある。

## 規約

- 1 タスク = 1 ブランチ = 1 PR。ブランチ接頭辞は `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`。`main` には Squash merge。
- テスト配置: `tests/unit/**/*.test.{ts,tsx}`（vitest, jsdom）と `tests/e2e/**/*.spec.ts`（playwright）。`@/*` エイリアスはリポジトリルートを指す（vitest と tsconfig 両方）。
- pre-commit フック失敗時は **新しいコミット**で修正する。`--amend` しない（CONTRIBUTING.md §7）。
- `/simplify` スキルは公式ワークフローの一部 — テストを書く前に変更ファイルに対して走らせる（CONTRIBUTING.md と PR テンプレ参照）。
