# ディレクトリ構成 & テスト計画

## 1. モノレポのディレクトリ構成

```
subscription-app/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── RecurringPayment.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── valueObjects/
│   │   │   │   │   ├── RecurringPaymentId.ts
│   │   │   │   │   ├── Price.ts
│   │   │   │   │   ├── BillingDay.ts
│   │   │   │   │   ├── PaymentStatus.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── application/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── CreateRecurringPaymentUseCase.ts
│   │   │   │   │   ├── UpdateRecurringPaymentUseCase.ts
│   │   │   │   │   ├── DeleteRecurringPaymentUseCase.ts
│   │   │   │   │   ├── CancelRecurringPaymentUseCase.ts
│   │   │   │   │   ├── GetRecurringPaymentUseCase.ts
│   │   │   │   │   ├── GetRecurringPaymentsUseCase.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── mappers/
│   │   │   │   │   ├── RecurringPaymentMapper.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── dtos/
│   │   │   │   │   ├── CreateRecurringPaymentRequest.ts
│   │   │   │   │   ├── UpdateRecurringPaymentRequest.ts
│   │   │   │   │   ├── RecurringPaymentResponse.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/
│   │   │   │   │   ├── db.ts
│   │   │   │   │   ├── migrations/
│   │   │   │   │   │   └── 0001_init.sql
│   │   │   │   │   └── schema.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── RecurringPaymentRepository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── presentation/
│   │   │   │   ├── http/
│   │   │   │   │   ├── routes/
│   │   │   │   │   │   ├── recurringPaymentRoutes.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── middlewares/
│   │   │   │   │   │   ├── errorHandler.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── config/
│   │   │   │   └── config.ts
│   │   │   ├── main.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── RecurringPayment.test.ts
│   │   │   │   │   │   └── index.test.ts
│   │   │   │   │   └── valueObjects/
│   │   │   │   │       ├── Price.test.ts
│   │   │   │   │       ├── BillingDay.test.ts
│   │   │   │   │       ├── PaymentStatus.test.ts
│   │   │   │   │       └── RecurringPaymentId.test.ts
│   │   │   │   └── application/
│   │   │   │       └── usecases/
│   │   │   │           ├── CreateRecurringPaymentUseCase.test.ts
│   │   │   │           └── ...
│   │   │   ├── integration/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── RecurringPaymentRepository.test.ts
│   │   │   │   └── api/
│   │   │   │       ├── recurringPayment.test.ts
│   │   │   │       └── ...
│   │   │   ├── fixtures/
│   │   │   │   ├── recurringPayment.fixtures.ts
│   │   │   │   └── ...
│   │   │   └── setup.ts
│   │   ├── vitest.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── domains/
│   │   │   │   ├── subscription.ts
│   │   │   │   ├── subscriptionInput.ts
│   │   │   │   └── index.ts
│   │   │   ├── components/
│   │   │   │   ├── FormInput.vue
│   │   │   │   ├── SubscriptionCard.vue
│   │   │   │   ├── SubscriptionFormContainer.vue
│   │   │   │   └── index.ts
│   │   │   ├── pages/
│   │   │   │   └── SubscriptionsPage.vue
│   │   │   ├── stores/
│   │   │   │   ├── subscription.ts
│   │   │   │   └── index.ts
│   │   │   ├── api/
│   │   │   │   ├── client.ts  ← Hono RPC クライアント（型安全）
│   │   │   │   └── index.ts
│   │   │   ├── main.ts
│   │   │   └── App.vue
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   │   ├── domains/
│   │   │   │   │   ├── subscription.test.ts
│   │   │   │   │   ├── subscriptionInput.test.ts
│   │   │   │   │   └── ...
│   │   │   │   ├── stores/
│   │   │   │   │   └── subscription.test.ts
│   │   │   │   └── ...
│   │   │   ├── components/
│   │   │   │   ├── FormInput.test.ts
│   │   │   │   ├── SubscriptionCard.test.ts
│   │   │   │   └── ...
│   │   │   ├── e2e/
│   │   │   │   └── subscriptions.test.ts
│   │   │   ├── fixtures/
│   │   │   │   └── subscription.fixtures.ts
│   │   │   └── setup.ts
│   │   ├── vitest.config.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── index.html
│   │
│   └── shared/
│       ├── schemas/
│       │   ├── recurringPayment.ts
│       │   └── index.ts
│       ├── types/
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── index.ts
│
├── doc/
│   ├── 00-overview.md
│   ├── 01-architecture.md
│   ├── 02-domain-design.md
│   ├── 03-api-design.md
│   ├── 04-frontend-design.md
│   ├── 05-directory-structure.md
│   ├── 06-test-plan.md
│   ├── 07-setup.md
│   └── images/
│
├── .gitignore
├── package.json                 ← root workspaces 定義
├── pnpm-workspace.yaml          ← （オプション）
└── README.md
```

---

## 2. Backend ディレクトリの詳細

### 2.1 Domain Layer

```
src/domain/
├── entities/
│   ├── RecurringPayment.ts      ← Entity 本体
│   └── index.ts
├── valueObjects/
│   ├── RecurringPaymentId.ts
│   ├── Price.ts
│   ├── BillingDay.ts
│   ├── PaymentStatus.ts
│   └── index.ts
└── index.ts
```

**責務：**
- Entity, ValueObject の定義
- ビジネスルールの強制
- Repository Interface の定義（別ファイル化するなら application/ 配下）

### 2.2 Application Layer

```
src/application/
├── usecases/
│   ├── CreateRecurringPaymentUseCase.ts
│   ├── UpdateRecurringPaymentUseCase.ts
│   ├── DeleteRecurringPaymentUseCase.ts
│   ├── CancelRecurringPaymentUseCase.ts
│   ├── GetRecurringPaymentUseCase.ts
│   ├── GetRecurringPaymentsUseCase.ts
│   └── index.ts
├── mappers/
│   ├── RecurringPaymentMapper.ts    ← Domain ↔ DTO 変換
│   └── index.ts
├── dtos/
│   ├── recurringPayment.ts         ← Request/Response
│   └── index.ts
└── index.ts
```

**責務：**
- ビジネスロジックの実装
- Domain ↔ DTO の変換
- Repository の呼び出し

### 2.3 Infrastructure Layer

```
src/infrastructure/
├── database/
│   ├── db.ts                       ← Drizzle DB インスタンス
│   ├── schema.ts                   ← Drizzle テーブル定義
│   └── migrations/
│       └── 0001_init.sql           ← マイグレーションファイル
├── repositories/
│   ├── RecurringPaymentRepository.ts  ← Repository 実装
│   └── index.ts
└── index.ts
```

**責務：**
- DB 接続
- Repository 実装
- データベース操作

### 2.4 Presentation Layer

```
src/presentation/
├── http/
│   ├── routes/
│   │   ├── recurringPaymentRoutes.ts  ← ルートハンドラ
│   │   └── index.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   └── index.ts
│   └── index.ts
├── app.ts                             ← Hono アプリ本体
└── index.ts
```

**責務：**
- HTTP ハンドラ
- リクエスト検証（Zod）
- エラーハンドリング
- **`export type AppType = typeof app`** ← Frontend の型推論用にエクスポート

---

## 3. Frontend ディレクトリの詳細

### 3.1 Domains

```
src/domains/
├── subscription.ts              ← DomainModel
├── subscriptionInput.ts         ← InputModel + Converter
└── index.ts
```

### 3.2 Components

```
src/components/
├── FormInput.vue                ← I/O コンポーネント
├── SubscriptionCard.vue         ← 表示コンポーネント
├── SubscriptionFormContainer.vue ← 取りまとめコンポーネント
└── index.ts
```

### 3.3 Pages

```
src/pages/
└── SubscriptionsPage.vue        ← ページコンポーネント
```

### 3.4 Stores

```
src/stores/
├── subscription.ts              ← Pinia Store
└── index.ts
```

### 3.5 API Client（Hono RPC）

```
src/api/
├── client.ts                    ← Hono RPC クライアント
│                                  （型安全な API クライアント）
└── index.ts
```

**実装例：**

```typescript
// src/api/client.ts
import { hc } from 'hono/client';
import type { AppType } from '@backend/presentation/app';

export const client = hc<AppType>('http://localhost:3000');
```

**使用例：**

```typescript
// コンポーネント内
const response = await client.api['recurring-payments'].$post({
  json: { name: 'Netflix', price: 1490, billingInterval: { ... } }
});
// response の型は自動推論される ✨
```

**メリット：**
- ✅ Backend のハンドラから型が自動推論される
- ✅ IDE の補完が効く（IntelliSense）
- ✅ Backend 変更時に自動で Frontend に反映

---

## 4. Shared ディレクトリ

```
packages/shared/
├── schemas/
│   ├── recurringPayment.ts      ← Zod スキーマ（フロント・バック共有）
│   └── index.ts
├── types/
│   └── index.ts
├── package.json
├── tsconfig.json
└── index.ts
```

**重要：** フロント・バック で同じ Zod スキーマをインポートする。

---

## 5. テスト構成

### 5.1 Backend テスト構成

```
test/
├── unit/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── RecurringPayment.test.ts
│   │   │   └── [...]
│   │   └── valueObjects/
│   │       ├── Price.test.ts
│   │       ├── BillingDay.test.ts
│   │       ├── PaymentStatus.test.ts
│   │       └── RecurringPaymentId.test.ts
│   └── application/
│       └── usecases/
│           ├── CreateRecurringPaymentUseCase.test.ts
│           ├── UpdateRecurringPaymentUseCase.test.ts
│           └── [...]
├── integration/
│   ├── repositories/
│   │   └── RecurringPaymentRepository.test.ts
│   └── api/
│       ├── createRecurringPayment.test.ts
│       ├── updateRecurringPayment.test.ts
│       ├── deleteRecurringPayment.test.ts
│       ├── getRecurringPayments.test.ts
│       └── [...]
├── fixtures/
│   ├── recurringPayment.fixtures.ts
│   └── [...]
└── setup.ts
```

### 5.2 Frontend テスト構成

```
test/
├── unit/
│   ├── domains/
│   │   ├── subscription.test.ts
│   │   ├── subscriptionInput.test.ts
│   │   └── [...]
│   ├── stores/
│   │   └── subscription.test.ts
│   └── [...]
├── components/
│   ├── FormInput.test.ts
│   ├── SubscriptionCard.test.ts
│   ├── SubscriptionFormContainer.test.ts
│   └── [...]
├── e2e/
│   ├── subscriptions.test.ts     ← 画面操作テスト（jsdom）
│   └── [...]
├── fixtures/
│   ├── subscription.fixtures.ts
│   └── [...]
└── setup.ts
```

---

## 6. テスト計画（C1 100% を目指す）

### 6.1 Backend テスト

#### Domain Layer（ユニットテスト）

**RecurringPayment Entity：**
- ✅ `create()` で新規インスタンスを生成できる
- ✅ 属性が正しく設定される
- ✅ `cancel()` で解約できる
- ✅ 既に解約済みの場合はエラー
- ✅ `update()` で更新できる
- ✅ `equals()` で値を比較できる

**ValueObjects：**

Price：
- ✅ 正の数で生成できる
- ✅ 0 以下の数でエラー
- ✅ 小数第2位に丸められる
- ✅ `equals()` で値を比較できる
- ✅ `format()` で表示用文字列を返す

BillingDay：
- ✅ 1～31 の整数で生成できる
- ✅ 0 以下でエラー
- ✅ 32 以上でエラー
- ✅ 小数でエラー

PaymentStatus：
- ✅ 有効なステータス（active, cancelled）で生成できる
- ✅ 無効なステータスでエラー
- ✅ `isActive()`, `isCancelled()` で状態判定

RecurringPaymentId：
- ✅ UUID で生成できる
- ✅ 有効な UUID で復元できる
- ✅ 無効な UUID でエラー

#### Application Layer（ユニットテスト）

CreateRecurringPaymentUseCase：
- ✅ 有効なリクエストで Entity を生成できる
- ✅ Repository に保存できる
- ✅ レスポンスに変換できる

UpdateRecurringPaymentUseCase：
- ✅ 存在する ID で更新できる
- ✅ 存在しない ID でエラー
- ✅ バリデーションエラーで例外を throw

CancelRecurringPaymentUseCase：
- ✅ 利用中のものを解約できる
- ✅ 既に解約済みのものはエラー
- ✅ 存在しない ID でエラー

#### Infrastructure Layer（統合テスト）

RecurringPaymentRepository：
- ✅ `save()` で保存できる
- ✅ `findById()` で取得できる
- ✅ `findAll()` で全件取得できる
- ✅ `update()` で更新できる
- ✅ `delete()` で削除できる
- ✅ 存在しない ID で null を返す

#### Presentation Layer（統合テスト）

API エンドポイント：
- ✅ POST /api/recurring-payments → 201 で作成
- ✅ GET /api/recurring-payments → 200 で全件取得
- ✅ GET /api/recurring-payments/:id → 200 で取得、404 で not found
- ✅ PUT /api/recurring-payments/:id → 200 で更新
- ✅ DELETE /api/recurring-payments/:id → 204 で削除
- ✅ PATCH /api/recurring-payments/:id/cancel → 200 で解約
- ✅ Zod バリデーションエラー → 400 で返す

### 6.2 Frontend テスト

#### Domain Layer（ユニットテスト）

Subscription：
- ✅ `fromResponse()` で DomainModel を生成できる
- ✅ getters（statusLabel, priceFormatted, etc）が正しい値を返す
- ✅ `isActive()`, `isCancelled()` で状態判定できる
- ✅ `equals()` で値を比較できる

SubscriptionInput：
- ✅ `createEmptySubscriptionInput()` で空の InputModel を生成
- ✅ `toSubscriptionInput()` で DomainModel → InputModel に変換
- ✅ `inputToDomain()` で InputModel → DomainModel に変換（Zod 検証含む）
- ✅ バリデーションエラーで例外を throw

#### Component テスト

FormInput：
- ✅ v-model で入力値をバインドできる
- ✅ エラーメッセージを表示できる
- ✅ maxlength 制約が効く
- ✅ type に応じて input type が変わる

SubscriptionCard：
- ✅ subscription データを正しく表示
- ✅ status に応じてバッジの色が変わる
- ✅ emit: edit, delete, cancel イベントを発火

SubscriptionFormContainer：
- ✅ 新規作成時にフォームが空で開始
- ✅ 編集時に初期値が設定される
- ✅ バリデーションエラーを表示
- ✅ submit で API を呼び出す
- ✅ 成功時に success イベント発火
- ✅ キャンセル時に cancel イベント発火

SubscriptionsPage：
- ✅ マウント時に全件取得
- ✅ 「新規追加」ボタンでフォーム表示
- ✅ 一覧に card が表示される
- ✅ edit, delete, cancel イベントで対応する処理実行

#### Store テスト（Pinia）

useSubscriptionStore：
- ✅ `fetchPayments()` で全件取得、状態更新
- ✅ `createPayment()` で作成、状態に追加
- ✅ `updatePayment()` で更新、状態を置き換え
- ✅ `deletePayment()` で削除、状態から削除
- ✅ `cancelPayment()` で解約、状態を更新

#### E2E テスト（jsdom）

- ✅ ページロード時に一覧を取得・表示
- ✅ 「新規追加」クリック → フォーム表示
- ✅ フォーム入力 → 送信 → 一覧に追加
- ✅ カード編集ボタン → フォーム表示、初期値設定
- ✅ カード削除ボタン → 確認ダイアログ → 削除
- ✅ カード解約ボタン → 確認ダイアログ → ステータス変更

---

## 7. テストコマンド

### Backend

```bash
# ユニットテスト
pnpm run test:unit

# 統合テスト
pnpm run test:integration

# 全テスト
pnpm run test

# カバレッジレポート
pnpm run test:coverage
```

### Frontend

```bash
# ユニット + E2E テスト
pnpm run test

# カバレッジレポート
pnpm run test:coverage
```

### 全体

```bash
# モノレポ全体のテスト
pnpm run test --recursive

# 全体のカバレッジ
pnpm run test:coverage --recursive
```

---

## 8. package.json の設定例

### Root package.json

```json
{
  "name": "subscription-app",
  "version": "0.0.1",
  "private": true,
  "workspaces": {
    "packages": [
      "packages/backend",
      "packages/frontend",
      "packages/shared"
    ]
  },
  "scripts": {
    "dev": "pnpm -r run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "test:coverage": "pnpm -r run test:coverage"
  }
}
```

### Backend package.json

```json
{
  "name": "@subscription-app/backend",
  "version": "0.0.1",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "test": "vitest",
    "test:unit": "vitest test/unit",
    "test:integration": "vitest test/integration",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "drizzle-orm": "^0.30.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "tsx": "^4.7.0"
  }
}
```

### Frontend package.json

```json
{
  "name": "@subscription-app/frontend",
  "version": "0.0.1",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "pinia": "^2.1.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "vite": "^5.0.0"
  }
}
```

### Shared package.json

```json
{
  "name": "@subscription-app/shared",
  "version": "0.0.1",
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

---

## 9. まとめ

**ディレクトリ構成の原則：**
1. DDD レイヤー分けを明確に
2. テストは src/ に並行して配置
3. Shared で型・スキーマを共有
4. モノレポで一元管理

**テスト計画の原則：**
1. Domain Layer → ユニットテスト（ビジネスルール）
2. Application Layer → ユニット + Mock テスト
3. Infrastructure Layer → 統合テスト（実 DB）
4. Presentation Layer → 統合テスト（API / コンポーネント）
5. **全体で C1 100% を目指す**

このアーキテクチャにより、テストしやすく、チーム展開可能な設計が実現される。
