# subscription-note

定期支払い（サブスク）管理アプリケーション。Netflix・ChatGPT・AWS など月額／年額サービスを一元管理します。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | Vue 3 + TypeScript + Pinia + Vite |
| Backend | Hono + TypeScript + Drizzle ORM |
| Database | SQLite (`packages/backend/db.sqlite`) |
| Shared | Zod スキーマ（`packages/shared`） |
| パッケージ管理 | pnpm workspaces（モノレポ） |

---

## 前提条件

- **Node.js** 22.x 以上（`node --version` で確認）
- **pnpm** 10.x 以上（`pnpm --version` で確認）

```bash
# pnpm が入っていない場合
npm install -g pnpm
```

---

## セットアップ

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. データベースのセットアップ

#### マイグレーションの実行

`drizzle/` ディレクトリのマイグレーションファイルを順番に適用します。シードデータ（Netflix 1件）も含まれます。

```bash
cd packages/backend
pnpm db:migrate
```

成功すると `packages/backend/db.sqlite` が作成され、動作確認用の Netflix レコードが1件投入されます。

> **再セットアップしたい場合：** `db.sqlite` を削除してから再実行してください。
>
> ```bash
> rm packages/backend/db.sqlite
> pnpm --filter @subscription-note/backend db:migrate
> ```

#### Drizzle Studio でデータを確認・編集する

```bash
cd packages/backend
npx drizzle-kit studio
# → http://local.drizzle.studio が開きます
```

---

## 開発サーバーの起動

フロントエンドとバックエンドを同時に起動します。

```bash
# ルートから両方まとめて起動
pnpm dev
```

または個別に起動する場合：

```bash
# バックエンド（ポート 3000）
cd packages/backend
pnpm dev

# フロントエンド（ポート 5173）
cd packages/frontend
pnpm dev
```

| サービス | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

---

## ビルド

```bash
# 全パッケージをビルド
pnpm build

# バックエンドのみ
cd packages/backend
pnpm build
# → packages/backend/dist/index.mjs が生成されます

# フロントエンドのみ
cd packages/frontend
pnpm build
```

---

## テスト

```bash
# 全パッケージのテストを実行
pnpm test

# バックエンドのみ
cd packages/backend
pnpm test             # 全テスト
pnpm test:unit        # ユニットテストのみ
pnpm test:integration # 統合テストのみ
pnpm test:coverage    # カバレッジ付き

# フロントエンドのみ
cd packages/frontend
pnpm test:unit  # Vitest
pnpm test:e2e   # Playwright
```

---

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/recurring-payments` | 一覧取得 |
| `POST` | `/api/recurring-payments` | 新規作成 |
| `GET` | `/api/recurring-payments/:id` | 詳細取得 |
| `PUT` | `/api/recurring-payments/:id` | 更新（解約・再契約含む） |
| `DELETE` | `/api/recurring-payments/:id` | 削除（物理削除） |

動作確認例：

```bash
# 一覧取得
curl http://localhost:3000/api/recurring-payments | jq .

# 詳細取得
curl http://localhost:3000/api/recurring-payments/<id> | jq .
```

---

## ディレクトリ構成

```
subscription-note/
├── packages/
│   ├── backend/          # Hono + Drizzle + SQLite
│   │   ├── src/
│   │   │   ├── domain/           # Entity, ValueObject, Repository Interface
│   │   │   ├── usecases/         # ビジネスロジック
│   │   │   ├── infrastructure/   # DB クライアント, リポジトリ実装
│   │   │   └── presentation/     # Hono ルート
│   │   ├── drizzle.config.ts
│   │   └── tsdown.config.ts
│   ├── frontend/         # Vue 3 + Pinia + Vite
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       └── stores/
│   └── shared/           # Zod スキーマ（フロント・バック共有）
│       └── src/
│           └── schemas/
├── docs/                 # 設計ドキュメント
└── pnpm-workspace.yaml
```

詳細な設計ドキュメントは [`docs/`](./docs/) を参照してください。
