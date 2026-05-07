# notion-wishlist

Notion のデータベース「🛒 Wishlist」を Web 上で閲覧・編集するためのツール。

本番: <https://wish.eh6gac4.work>（要ログイン）

- フロントエンド: Next.js 15 (App Router) + React 19 + Tailwind CSS
- バックエンド: Next.js Route Handlers が Notion API を仲介（トークンはサーバー側のみ）
- 認証: NextAuth.js v5 (Credentials)
- データの正本（Source of Truth）は Notion DB

## 想定する Notion DB のスキーマ

実 DB「🛒 Wishlist」(`31a1690d811d45f7895dfe9ff0adf29b`) に合わせています。

| プロパティ名 | 型 | 内容 |
| --- | --- | --- |
| `品名` | Title | 商品名 |
| `URL` | URL | 購入候補先 URL |
| `価格` | Number (円) | 価格 |
| `ステータス` | Select | `検討中` / `購入予定` / `購入済み` / `却下` |
| `優先度` | Select | `高` / `中` / `低` |
| `購入予定日` | Date | 購入予定日 |
| `メモ` | Rich text | 備考 |

AI 分析機能の結果は DB プロパティではなく、各アイテム（ページ）の **本文末尾**に「🤖 AI 分析（時刻）」見出し + 結果ブロックとして追記されます。

`ステータス` と `優先度` の選択肢名はコード側にハードコードされています。
別の名称を使いたい場合は `lib/types.ts` の `WishStatus` / `WishPriority` を編集してください。

## セットアップ

### 1. Notion インテグレーションを作る

1. <https://www.notion.so/profile/integrations> で **+ New integration** から内部インテグレーションを作成
2. 表示された **Internal Integration Token** (`secret_...`) をメモ
3. Wishlist DB のページを開き、右上の **... → Connections** からインテグレーションを招待

### 2. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集し、`NOTION_TOKEN` を設定（`NOTION_DATABASE_ID` は既に既知の値が入っています）。

### 3. 依存をインストールして起動

```bash
npm install
npm run dev
```

ブラウザで <http://localhost:3004> を開きます。

## ダミーデータモード

`NOTION_TOKEN` または `NOTION_DATABASE_ID` が未設定だと、**自動的にメモリ内のダミーデータで動作**します（dev で `npm run dev` がそのまま動く）。明示的に切り替えたい場合は `.env.local` で:

```bash
USE_MOCK_DATA=1   # 強制的にダミー
USE_MOCK_DATA=0   # Notion を使う（トークン未設定だとエラー）
```

ダミーデータは Next.js プロセス上のメモリに保持され、追加・編集・削除も反映されますが、サーバー再起動でリセットされます。ヘッダに「ダミーデータ」バッジが表示されます。

## 機能

- 一覧表示（カード形式、価格・優先度バッジ・ステータスバッジ・購入予定日）
- 絞り込み: アクティブのみ / すべて / 各ステータス
- 並び替え: 優先度 / 購入予定日 / 更新日 / 価格昇降順
- 品名での検索
- 新規追加（インラインフォーム）
- インライン編集（品名・URL・価格・購入予定日）
- ステータス・優先度のワンクリック変更
- アーカイブ（Notion 上では「ゴミ箱」へ移動。完全削除ではない）
- 表示中の合計金額表示
- AI 分析（Claude による「買うべきか」判定 → `分析結果` プロパティへ保存）

## AI 分析機能

詳細ダイアログの「分析する」ボタンを押すと、Claude API がアイテム情報（品名・価格・優先度・登録経過日数・メモ等）を踏まえて「買う／見送る／保留」の結論と理由を返し、対象 Notion ページの本文末尾に「🤖 AI 分析（時刻）」見出し + 箇条書きとして追記します。再分析しても過去のブロックは削除されず、履歴として末尾に積み上がります（不要になれば Notion 側で手動削除可能）。

- 環境変数 `ANTHROPIC_API_KEY` を設定（モックモード時は未設定でもダミー分析が返る）
- モデルは既定で `claude-haiku-4-5-20251001`。`ANTHROPIC_MODEL` で上書き可能
- Cloudflare Workers では `npm run cf:secret -- ANTHROPIC_API_KEY` で secret として登録
- 分析結果は Notion ページ本文に書き込むため、Notion インテグレーションに対象 DB の編集権限が必要です

## API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/api/items` | 全件取得 |
| `POST` | `/api/items` | 1 件作成 |
| `PATCH` | `/api/items/[id]` | 部分更新 |
| `DELETE` | `/api/items/[id]` | アーカイブ |
| `POST` | `/api/items/[id]/analyze` | AI 分析を実行し、結果を保存 |

## コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run start      # 本番起動
npm run typecheck  # 型チェック
npm run lint       # Lint
```

## Cloudflare Workers へのデプロイ

本番環境は [Cloudflare Workers](https://developers.cloudflare.com/workers/) 上で
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) アダプタを通して動かしている。
静的アセットは Workers Assets バインディングから配信され、Route Handlers は同じ Worker 内で実行される。

### 認証は API トークン方式

`wrangler login` のブラウザ認証は使わず、API トークンを `.env.local` に置いて
`dotenv-cli` 経由で `wrangler` に渡す（CI でもローカルでも同じ流れ）。

1. <https://dash.cloudflare.com/profile/api-tokens> で API トークンを作成。
   テンプレ「Edit Cloudflare Workers」、または最低限以下の権限:
   - Account → Workers Scripts: **Edit**
   - Account → Workers KV Storage: **Edit**
   - User → User Details: **Read**
2. <https://dash.cloudflare.com/> 右上の **Account ID** をコピー。
3. `.env.local` に追記:

```bash
CLOUDFLARE_API_TOKEN=cf_xxx
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

`npm run cf:*` スクリプトは `dotenv -e .env.local --` で `wrangler` を起動するので、
シェルに `export` する必要はない。

### 初期セットアップ（1 回だけ）

`NOTION_TOKEN` を Cloudflare の暗号化 secret として登録する。`.env.local` の値を
そのまま標準入力で渡す:

```bash
# .env.local の NOTION_TOKEN を読み取って secret 登録（対話なし）
sed -n 's/^NOTION_TOKEN=//p' .env.local | npm run cf:secret -- NOTION_TOKEN
```

対話で打ち込みたければ:

```bash
npm run cf:secret -- NOTION_TOKEN
```

`NOTION_DATABASE_ID` と `USE_MOCK_DATA` は `wrangler.jsonc` の `vars` に入っている。
変更したい場合は `wrangler.jsonc` を編集して再デプロイすれば反映される。

### ローカルプレビュー（Workers ランタイムで動かす）

```bash
# .dev.vars を用意（NOTION_TOKEN などローカル専用の値。.env.local とは別ファイル）
cp .dev.vars.example .dev.vars

npm run cf:preview
```

### デプロイ

```bash
npm run cf:deploy
```

内部で `opennextjs-cloudflare build` → `wrangler deploy` を実行する。
ビルド成果物は `.open-next/` 以下に出る（gitignore 済み）。

### 型生成

`wrangler.jsonc` のバインディングや `vars` を変えたあとは、TypeScript 側の型を再生成する:

```bash
npm run cf:typegen
```

`worker-configuration.d.ts` が更新される（gitignore 済み・各自で生成）。
