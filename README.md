# notion-wishlist

Notion のデータベース「🛒 Wishlist」を Web 上で閲覧・編集するためのツール。

- フロントエンド: Next.js 15 (App Router) + React 19 + Tailwind CSS
- バックエンド: Next.js Route Handlers が Notion API を仲介（トークンはサーバー側のみ）
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

ブラウザで <http://localhost:3000> を開きます。

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

## API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/api/items` | 全件取得 |
| `POST` | `/api/items` | 1 件作成 |
| `PATCH` | `/api/items/[id]` | 部分更新 |
| `DELETE` | `/api/items/[id]` | アーカイブ |

## コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run start      # 本番起動
npm run typecheck  # 型チェック
npm run lint       # Lint
```
