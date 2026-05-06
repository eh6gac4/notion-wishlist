# 開発フロー

このプロジェクトは Notion Tasks 風に「1 タスク = 1 ブランチ = 1 PR」で進めます。
main は常にデプロイ可能な状態を保ち、機能追加・修正は必ず作業ブランチ → PR の流れで取り込みます。

## 1 サイクルの全体像

```
作業ブランチ作成 → 実装 → ユニットテスト → UI テスト → コミット → push → PR 作成 → レビュー → マージ
```

## 1. 作業ブランチを切る

main を最新化してから、目的に応じた接頭辞でブランチを切ります。

```bash
git switch main
git pull --ff-only
git switch -c <prefix>/<short-description>
```

| 接頭辞 | 用途 |
| --- | --- |
| `feat/` | 新機能 |
| `fix/` | バグ修正 |
| `chore/` | 設定・依存・雑務 |
| `refactor/` | 振る舞いを変えない内部整理 |
| `docs/` | ドキュメントのみ |

例: `feat/board-view`, `fix/status-pill-color`, `chore/upgrade-next`.

## 2. 実装

- スコープを 1 PR に閉じる（複数の関心事を 1 PR に混ぜない）
- 既存の構造（`app/`, `components/`, `lib/`）に従う
- Notion API への依存は `lib/store.ts` を経由（`lib/notion.ts` / `lib/mock.ts` を直接呼ばない）

## 3. ユニットテスト（Vitest）

```bash
npm test           # 1 回実行
npm run test:watch # 監視モード
```

- 配置: `tests/unit/**/*.test.{ts,tsx}` または `lib/**/*.test.ts`
- 環境は `jsdom`、`@testing-library/react` でコンポーネント描画も可
- ロジック中心の対象（`lib/notion.ts` の変換・`lib/mock.ts` の CRUD・`components/Pill.tsx` のような純コンポーネント）は必ずテストを増やす

## 4. UI テスト（Playwright）

```bash
npm run test:e2e        # ヘッドレス実行
npm run test:e2e:ui     # UI モードで対話的に
```

- 配置: `tests/e2e/**/*.spec.ts`
- `webServer` がダミーモード（`USE_MOCK_DATA=1`）の dev を自動起動するので、テスト前にサーバを立てる必要はない
- 初回は `npx playwright install chromium` でブラウザをダウンロード

## 5. ローカル一括チェック

push 前に必ず:

```bash
npm run check          # typecheck + unit test
npm run build          # 本番ビルドが通ること
npm run test:e2e       # E2E が通ること
```

## 6. コミット

- メッセージは現在形・命令形（"add ...", "fix ..."）で、1 PR 内で意味のある単位に分ける
- `.env.local` など秘密情報は絶対にコミットしない（`.gitignore` で除外済み）
- pre-commit フック等が失敗した場合は **amend ではなく新しいコミット** を作って修正する

## 7. push と PR

```bash
git push -u origin <branch>
gh pr create --fill
# またはタイトル・本文を指定する場合:
gh pr create --title "..." --body "..."
```

PR テンプレ（`.github/pull_request_template.md`）に沿って:
- 何を変えたか（Summary）
- なぜ（Why）
- 動作確認（Test plan）

を埋めること。

## 8. CI

GitHub Actions（`.github/workflows/ci.yml`）が PR で自動的に下記を実行します:

- `verify`: typecheck → unit test → build
- `e2e`: Playwright（ダミーモードで dev を起動）

両方 green になるまでマージしません。

## 9. レビューとマージ

- 自分以外のレビューが付くまでマージしない（1 人運用なら自レビューでも可、その場合はセルフコメントで意図を残す）
- マージ方式は **Squash and merge** を推奨（main の履歴を線形に保つ）
- マージ後は作業ブランチを削除（`gh pr merge --squash --delete-branch`）

## ディレクトリ構成

```
app/                Next.js App Router
components/         React コンポーネント
lib/                Notion クライアント・mock・型・store ファサード
tests/
  unit/             Vitest（jsdom）
  e2e/              Playwright
.github/workflows/  CI
```

## 環境変数

`.env.local`（gitignore 済）に:

```
NOTION_TOKEN=...
NOTION_DATABASE_ID=...
USE_MOCK_DATA=0   # 1 にすればトークン無しでメモリ内ダミーデータで動く
```
