# API 設計

## 概要

このドキュメントは、Hono で実装される REST API のエンドポイント定義、リクエスト/レスポンススキーマを定義します。

**重要：** Zod スキーマは、フロントエンドと共有される `packages/shared` に配置され、型の一貫性を保証します。

---

## 1. Zod スキーマ定義（packages/shared/schemas）

### 1.1 BillingInterval スキーマ

```typescript
// packages/shared/schemas/billingInterval.ts
import { z } from 'zod';

export const BillingIntervalSchema = z.object({
  intervalType: z.enum(['month', 'year', 'quarter'])
    .describe('支払い周期タイプ'),
  frequency: z.number()
    .int('周期は整数である必要があります')
    .positive('周期は1以上である必要があります')
    .describe('何ヶ月ごと、何年ごとか（例：1=毎月、3=3ヶ月ごと）'),
  day: z.number()
    .int('日は整数である必要があります')
    .min(1, '日は1以上である必要があります')
    .max(31, '日は31以下である必要があります')
    .describe('月の何日か（1-31）'),
  month: z.number()
    .int('月は整数である必要があります')
    .min(1, '月は1以上である必要があります')
    .max(12, '月は12以下である必要があります')
    .optional()
    .describe('年の場合：何月か（1-12）。月払い・四半期払いでは不要'),
}).refine((data) => {
  // 年払いの場合は month が必須
  if (data.intervalType === 'year' && data.month === undefined) {
    return false;
  }
  // 月払い・四半期払いの場合は month は不要
  if (data.intervalType !== 'year' && data.month !== undefined) {
    return false;
  }
  return true;
}, {
  message: '年払いの場合は month が必須、月払い・四半期払いでは不要です',
  path: ['month'],
});

export type BillingInterval = z.infer<typeof BillingIntervalSchema>;
```

### 1.2 RecurringPayment スキーマ

```typescript
// packages/shared/schemas/recurringPayment.ts
import { z } from 'zod';
import { BillingIntervalSchema } from './billingInterval';

// ===== Request DTO =====

export const CreateRecurringPaymentSchema = z.object({
  name: z.string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),
  price: z.number()
    .positive("価格は0より大きい値で入力してください"),
  billingInterval: BillingIntervalSchema,
  memo: z.string()
    .max(500, "メモは500文字以内で入力してください")
    .optional()
    .default(""),
});

export type CreateRecurringPaymentRequest = z.infer<typeof CreateRecurringPaymentSchema>;

export const UpdateRecurringPaymentSchema = z.object({
  name: z.string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),
  price: z.number()
    .positive("価格は0より大きい値で入力してください"),
  billingInterval: BillingIntervalSchema,
  status: z.enum(['active', 'cancelled'])
    .describe('ステータス（active=利用中、cancelled=解約済）'),
  memo: z.string()
    .max(500, "メモは500文字以内で入力してください")
    .optional()
    .default(""),
});

export type UpdateRecurringPaymentRequest = z.infer<typeof UpdateRecurringPaymentSchema>;

// ===== Response DTO =====

// 一覧用（簡易版）
export const RecurringPaymentListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  status: z.enum(['active', 'cancelled']),
  nextBillingDate: z.string().datetime()
    .nullable()
    .describe('次回の支払い日（計算値）。cancelled の場合は null'),
  createdAt: z.string().datetime(),
});

export type RecurringPaymentListItem = z.infer<typeof RecurringPaymentListItemSchema>;

// 詳細用（完全版）
export const RecurringPaymentDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  billingInterval: BillingIntervalSchema,
  status: z.enum(['active', 'cancelled']),
  memo: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  nextBillingDate: z.string().datetime()
    .nullable()
    .describe('次回の支払い日（計算値）。cancelled の場合は null'),
});

export type RecurringPaymentDetail = z.infer<typeof RecurringPaymentDetailSchema>;

export const RecurringPaymentListSchema = z.array(RecurringPaymentListItemSchema);

export type RecurringPaymentList = z.infer<typeof RecurringPaymentListSchema>;
```

---

## 2. API エンドポイント定義

### 2.1 概要

| メソッド | パス | 説明 | 用途 |
|---------|------|------|------|
| `POST` | `/api/recurring-payments` | リソース作成 | 新規登録 |
| `GET` | `/api/recurring-payments` | リソース一覧取得 | 一覧表示 |
| `GET` | `/api/recurring-payments/:id` | リソース詳細取得 | 詳細表示・編集初期値 |
| `PUT` | `/api/recurring-payments/:id` | リソース全体更新 | 編集・解約・再契約 |
| `DELETE` | `/api/recurring-payments/:id` | リソース削除 | 物理削除 |

### 2.2 詳細

#### POST /api/recurring-payments

**説明：** 新しい定期支払いを作成します。

**リクエスト（毎月支払い）：**

```json
{
  "name": "Netflix",
  "price": 1490,
  "billingInterval": {
    "intervalType": "month",
    "frequency": 1,
    "month": null,
    "day": 15
  },
  "memo": "映画・ドラマ見放題"
}
```

**リクエスト（毎年支払い）：**

```json
{
  "name": "Adobe Creative Cloud",
  "price": 98000,
  "billingInterval": {
    "intervalType": "year",
    "frequency": 1,
    "month": 1,
    "day": 15
  },
  "memo": "Photoshop, Illustrator"
}
```

**レスポンス（201 Created）：**

作成されたリソース本体を返します。nextBillingDate は計算値のため含めません。

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Netflix",
  "price": 1490,
  "billingInterval": {
    "intervalType": "month",
    "frequency": 1,
    "day": 15
  },
  "status": "active",
  "memo": "映画・ドラマ見放題",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**次回支払い日が必要な場合：** `GET /api/recurring-payments/:id` を叩いてください。

**エラーレスポンス（400 Bad Request）：**

```json
{
  "errors": [
    {
      "field": "name",
      "message": "名前は必須です"
    },
    {
      "field": "price",
      "message": "価格は0より大きい値で入力してください"
    }
  ]
}
```

---

#### GET /api/recurring-payments

**説明：** 全定期支払い一覧を取得します。

**クエリパラメータ：** なし（将来的にページネーション対応予定）

**レスポンス（200 OK）：**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Netflix",
    "price": 1490,
    "status": "active",
    "nextBillingDate": "2024-02-15T00:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "ChatGPT Plus",
    "price": 2000,
    "status": "active",
    "nextBillingDate": "2024-02-20T00:00:00Z",
    "createdAt": "2024-01-20T14:20:00Z"
  }
]
```

---

#### GET /api/recurring-payments/:id

**説明：** 特定の定期支払いを ID で取得します（詳細情報）。

**パスパラメータ：**
- `id` (string): UUID

**レスポンス（200 OK）：**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Netflix",
  "price": 1490,
  "billingInterval": {
    "intervalType": "month",
    "frequency": 1,
    "day": 15
  },
  "status": "active",
  "memo": "映画・ドラマ見放題",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "nextBillingDate": "2024-02-15T00:00:00Z"
}
```

**エラーレスポンス（404 Not Found）：**

```json
{
  "message": "RecurringPayment not found"
}
```

---

#### PUT /api/recurring-payments/:id

**説明：** 定期支払いを更新します。status で解約・再契約も可能です。

**パスパラメータ：**
- `id` (string): UUID

**リクエスト（通常更新）：**

```json
{
  "name": "Netflix Premium",
  "price": 1990,
  "billingInterval": {
    "intervalType": "month",
    "frequency": 1,
    "month": null,
    "day": 20
  },
  "status": "active",
  "memo": "4K対応プラン"
}
```

**リクエスト（解約）：**

```json
{
  "name": "Netflix Premium",
  "price": 1990,
  "billingInterval": {
    "intervalType": "month",
    "frequency": 1,
    "month": null,
    "day": 20
  },
  "status": "cancelled",
  "memo": "4K対応プラン"
}
```

**リクエスト（再契約）：**

```json
{
  "name": "Netflix Premium",
  "price": 1990,
  "billingInterval": {
    "intervalType": "month",
    "frequency": 1,
    "month": null,
    "day": 20
  },
  "status": "active",
  "memo": "4K対応プラン"
}
```

**レスポンス（200 OK）：**

更新されたリソース本体を返します。nextBillingDate は計算値のため含めません。

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Netflix Premium",
  "price": 1990,
  "billingInterval": {
    "intervalType": "month",
    "frequency": 1,
    "day": 20
  },
  "status": "active",
  "memo": "4K対応プラン",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

**次回支払い日が必要な場合：** `GET /api/recurring-payments/:id` を叩いてください。

---

#### DELETE /api/recurring-payments/:id

**説明：** 定期支払いを削除します（物理削除）。

**パスパラメータ：**
- `id` (string): UUID

**レスポンス（204 No Content）：**

```
（本体なし）
```

**エラーレスポンス（404 Not Found）：**

```json
{
  "message": "RecurringPayment not found"
}
```

---

## 3. エラーハンドリング

### 3.1 標準的なエラーレスポンス

| ステータス | 意味 | レスポンス例 |
|----------|------|-----------|
| `400` | Bad Request（Zod バリデーションエラー） | `{ errors: [...] }` |
| `404` | Not Found | `{ message: "RecurringPayment not found" }` |
| `500` | Internal Server Error | `{ message: "Internal server error" }` |

### 3.2 Hono グローバルエラーハンドラ

```typescript
app.onError((err, c) => {
  console.error(err);

  if (err instanceof z.ZodError) {
    return c.json({
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    }, 400);
  }

  return c.json(
    { message: 'Internal server error' },
    500
  );
});
```

---

## 4. ステータス遷移

```
【新規作成】
POST /api/recurring-payments
  → status: "active"

【通常の編集】
PUT /api/recurring-payments/:id
  → status: "active" のまま

【解約】
PUT /api/recurring-payments/:id
  → status を "cancelled" に変更
  → nextBillingDate は null になる

【再契約】
PUT /api/recurring-payments/:id
  → status を "active" に変更
  → nextBillingDate が再計算される

【削除】
DELETE /api/recurring-payments/:id
  → データベースから完全削除
```

---

## 5. 実装上の注意点

### 5.1 PUT リクエストの全フィールド要件

PUT は「リソース全体を置き換える」操作のため、**全フィールドの指定が必須**です。

❌ 部分更新（これは PATCH の役割）：
```json
{
  "price": 1990
}
```

✅ 全フィールド指定：
```json
{
  "name": "Netflix",
  "price": 1990,
  "billingInterval": { ... },
  "status": "active",
  "memo": "..."
}
```

### 5.2 status 変更時の UseCase ロジック

status が `cancelled` → `active` に変わった場合、UseCase で nextBillingDate を再計算して返す。

status が `active` → `cancelled` に変わった場合、nextBillingDate は `null` で返す。

### 5.3 一覧 vs 詳細

**一覧取得（GET /api/recurring-payments）：**
- シンプルな情報のみ（id, name, price, status, createdAt）
- 画面表示用

**詳細取得（GET /api/recurring-payments/:id）：**
- 完全な情報（billingInterval, memo, nextBillingDate を含む）
- 編集画面の初期値、詳細表示用

---

## 6. Hono RPC による型安全性

### 6.1 Hono RPC とは

**Backend のハンドラの型定義から、Frontend が自動的に型を推論する仕組み。**

```typescript
// Backend（app.ts）
export const app = new Hono();

app.post('/api/recurring-payments', async (c) => {
  // ...
});

export type AppType = typeof app;  // ← これで型をエクスポート
```

```typescript
// Frontend（api/client.ts）
import { hc } from 'hono/client';
import type { AppType } from '@backend/app';

export const client = hc<AppType>('http://localhost:3000');
```

### 6.2 Frontend での使用

```typescript
// コンポーネント内
const response = await client.api['recurring-payments'].$post({
  json: {
    name: 'Netflix',
    price: 1490,
    billingInterval: { ... }
  }
});

// response の型は自動推論される ✨
// IntelliSense でプロパティが補完される
```

### 6.3 メリット

- ✅ **型安全性** → リクエスト・レスポンスの型が自動推論
- ✅ **IDE サポート** → 補完、型チェック、エラー検出
- ✅ **同期が自動** → Backend 変更 → Frontend に反映（型レベルで）
- ✅ **ツール不要** → OpenAPI 生成ツール（orval など）が不要

### 6.4 注意点

- **モノレポ推奨** → Backend と Frontend が同じプロジェクト
- **ビルド時に型チェック** → Backend の変更が即座に Frontend に影響

---

## 7. 次のフェーズ

- Backend: Hono Routes でエンドポイント実装
- Backend: UseCase で nextBillingDate の計算ロジック実装
- Backend: `export type AppType = typeof app` でハンドラの型をエクスポート
- Frontend: `hc<AppType>` で型安全な API クライアント生成
