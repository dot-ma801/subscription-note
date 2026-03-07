# フロントエンド設計（Vue 3 + TypeScript）

## 概要

このドキュメントは、フロントエンド開発における **設計思想** を記述します。

具体的な実装パターンや詳細なコード例は、試行錯誤の過程で変わる可能性があるため、ここでは原則と考え方のみを記載します。

---

## 1. DomainModel と InputModel

### 1.1 命名の問題

**注意：** この設計では「DomainModel」という言葉を使っていますが、Backend の DDD における DomainModel とは異なる概念です。

- **Backend DomainModel** → Entity, ValueObject（ビジネスロジック）
- **Frontend DomainModel** → UI に渡す「正しい状態」のデータ

命名が被っているため、将来的には別名に変更する可能性があります。

---

### 1.2 DomainModel の本質

**DomainModel は「送り出すときに真価を発揮する」**

#### 受け取る時（API から）

```
API Response（JSON）
    ↓
   （特に型チェックしない）
    ↓
必要に応じて加工・保存
```

**重要：** 受け取る時点では、厳密な型チェックや正規化は不要です。

#### 送り出す時（UI に渡す）

```
UI に渡すデータ
    ↓
【DomainModel に統一】
    ↓
コンポーネント（確実に正しい状態のデータ）
```

**重要：** UI に渡す瞬間に DomainModel として統一します。

---

### 1.3 DomainModel の役割

#### ビジネスロジック
- メソッドを持つ
- 状態判定（`isActive()`, `isCancelled()` など）
- 表示用フォーマット（`priceFormatted()`, `statusLabel()` など）

#### 比較・変更検知
```
元データ（DomainModel）vs 編集中データ（DomainModel）
    ↓
equals() メソッドで比較
    ↓
変更があれば「保存ダイアログ表示」
```

**DomainModel 同士の比較により、安全に変更検知できます。**

#### 型安全性
```
API から JSON → DomainModel に変換
    ↓
【ここで型チェック完了】
    ↓
UI は常に「正しい型」のデータを扱える
```

---

### 1.4 InputModel

**役割：** フォーム入力途中の「壊れた状態」を許容する。

```
ユーザー入力
    ↓
InputModel（部分的・不正な状態もOK）
    ↓
【送信時】Zod で検証
    ↓
DomainModel に変換
```

**特徴：**
- ❌ ビジネスロジックは持たない
- ❌ 不正な値も許容
- ✅ フォーム入力の「途中状態」を表現

---

## 2. コンポーネント設計

### 2.1 設計原則

**「UI ライブラリとして提供されているような分け方」**

つまり：
- **I/O コンポーネント** → Input, Textarea, Select など（汎用）
- **表示コンポーネント** → Card, List, Badge など（汎用）
- **ビジネスロジックコンポーネント** → SubscriptionForm など（専用）

**汎用コンポーネントは、別プロジェクトでも使える設計を目指す。**

---

### 2.2 I/O コンポーネント（入力）

**責務：** UI を提供する（フォーム部品）

**特徴：**
- `v-model` のみでデータを受け渡す
- props: `modelValue`, `label`, `error` など最小限
- emit: `update:modelValue` のみ
- ビジネスロジックは持たない
- **再利用可能** → 別プロジェクトでも使える

**例：**
- `FormInput.vue`（text/number/email など）
- `FormSelect.vue`
- `FormCheckbox.vue`

---

### 2.3 表示コンポーネント（Output）

**責務：** データを表示する

**特徴：**
- props でデータを受け取る
- emit でイベント発火（`@edit`, `@delete` など）
- ビジネスロジックは持たない
- **再利用可能** → 別プロジェクトでも使える

**例：**
- `SubscriptionCard.vue`（サブスク情報を表示）
- `StatusBadge.vue`（ステータスを表示）
- `PriceDisplay.vue`（金額を表示）

---

### 2.4 取りまとめコンポーネント（ビジネスロジック）

**責備：** フォーム全体、API 通信、状態管理

**特徴：**
- 複数の I/O コンポーネント、表示コンポーネントを組み合わせる
- バリデーション・API 通信・イベント処理
- **再利用性は低い** → ビジネス専用

**例：**
- `SubscriptionForm.vue`（登録・編集フォーム）
- `SubscriptionList.vue`（一覧 + フィルタ + ソート）

---

### 2.5 ページコンポーネント

**責備：** ページ全体の構成

**特徴：**
- 複数の取りまとめコンポーネントを配置
- Store（Pinia）とのインテグレーション（必要時のみ）
- ルーティング

**例：**
- `SubscriptionsPage.vue`
- `SubscriptionDetailPage.vue`

---

### 3.1 基本方針

**「あんまり使いたくない。でも必要な時はある。」**

つまり：
- **デフォルト：** local state（`ref`）を使用
- **必要になったら：** Store へ移行

---

### 3.2 Store が必要なケース

**グローバルな状態が必要な場合：**

- ❌ 単一ページ内のフォームデータ → local state で十分
- ✅ タブ間での共有データ → Store 検討
- ✅ ページ遷移後も保持すべきデータ → Store 検討
- ✅ 複数のコンポーネントツリーから同じデータにアクセス → Store 検討

---

### 3.3 Store の実装

**最小限の実装：**

```
Store
├── state: データ
├── actions: 非同期操作（API 通信）
└── getters: 計算プロパティ
```

**APIレスポンス → DomainModel への変換は Store の責務。**

```
API.getPayments()
    ↓
【Store で DomainModel に変換】
    ↓
state に格納
    ↓
Component が consume
```

---

## 4. API 通信の流れ

### 4.1 Hono RPC による型安全な API クライアント

**Backend のハンドラの型から、Frontend の型が自動推論される。**

```typescript
// Backend（app.ts）
export const app = new Hono();

app.post('/api/recurring-payments', async (c) => {
  // ...
});

export type AppType = typeof app;
```

```typescript
// Frontend（api/client.ts）
import { hc } from 'hono/client';
import type { AppType } from '@backend/app';

export const client = hc<AppType>('http://localhost:3000');
```

**Frontend での使用：**

```typescript
// コンポーネント内
const response = await client.api['recurring-payments'].$post({
  json: {
    name: 'Netflix',
    price: 1490,
    billingInterval: { /* ... */ }
  }
});

// response の型は自動推論される
// IntelliSense で補完される
```

---

### 4.2 基本フロー

```
【Component（取りまとめ）】
    ↓
1. フォーム入力（InputModel）
2. Zod で検証
3. API クライアントで送信
    ↓ client.api....$post({ json: ... })
【Hono ハンドラ】
    ↓
4. リクエスト検証
5. UseCase 実行
6. レスポンス返却
    ↓
【Frontend（型自動推論）】
    ↓
7. DomainModel に変換
8. UI に渡す
    ↓
【Component（取りまとめ）】
    ↓
9. emit で親に通知（必要時）
```

---

### 4.3 変更検知の例

```
【編集画面を開く】
    ↓
API で元データを取得
    ↓
client.api['recurring-payments'].$get({ param: { id } })
    ↓
DomainModel に変換
    ↓
元データ（DomainModel）を保存
    ↓
【ユーザーが編集】
    ↓
現在のデータ（DomainModel）と元データを比較
    ↓
equals() で判定
    ↓
異なれば「保存しますか？」ダイアログ
```

**DomainModel のメリット：型安全で厳密な比較ができる。**

---

## 5. Store（Pinia）の位置づけ

### 5.1 Zod スキーマの活用

**Backend と同じ Zod スキーマを共有：**

```
packages/shared/schemas/
    ├── billingInterval.ts
    └── recurringPayment.ts
```

Frontend でも同じスキーマを使用：

```
import { CreateRecurringPaymentSchema } from '@shared/schemas';

// フォーム送信時
const validated = CreateRecurringPaymentSchema.parse(input);
```

**メリット：** Backend と Frontend の型定義が自動で同期される。

---

### 5.2 API レスポンスの型

```
API レスポンス（JSON）
    ↓
RecurringPaymentDetailSchema で検証
    ↓
【ここで型チェック完了】
    ↓
DomainModel に変換可能
```

---

## 6. 試行錯誤の余白

### 6.1 変わる可能性がある部分

以下の部分は、実装を通じて最適な形に調整されます：

1. **DomainModel の命名**
   - 現在：「DomainModel」（Backend との名前衝突）
   - 将来：`ViewModel`, `State`, `Domain` など別名に変更する可能性

2. **Store の使用範囲**
   - 「最小限」という原則だが、具体的な境界線は試行錯誤で決定

3. **コンポーネント分割の粒度**
   - UI ライブラリ的な設計を目指すが、ビジネスロジック側での調整あり

4. **InputModel と DomainModel の境界**
   - フォーム入力後、どのタイミングで DomainModel に変換するか調整可能

---

### 6.2 試行錯誤のアプローチ

**この設計は「指針」であって「固定ルール」ではありません。**

実装しながら：
- ❌ 「この分割は無駄だ」→ 統合してみる
- ❌ 「Store が必要になった」→ 導入する
- ❌ 「DomainModel が重すぎる」→ 軽くする

**都度調整して、最適な形を見つけていく。**

---

## 7. 実装時のチェックリスト

### DomainModel

- [ ] ビジネスメソッドを持つ（`isActive()` など）
- [ ] 表示用フォーマットメソッドを持つ（`priceFormatted()` など）
- [ ] `equals()` メソッドで値の比較が可能
- [ ] コンストラクタで不変条件をチェック（必要時）

### InputModel

- [ ] 不正な値も許容する構造
- [ ] ビジネスロジックは持たない
- [ ] フォーム input 用の型（string, number など）

### I/O コンポーネント

- [ ] `v-model` のみでデータを受け渡す
- [ ] 他の props は最小限（label, error など）
- [ ] emit は `update:modelValue` のみ
- [ ] 再利用可能か？（汎用性）

### 取りまとめコンポーネント

- [ ] ロジック（バリデーション、API 通信）を持つ
- [ ] 複数の子コンポーネントを組み合わせている
- [ ] 必要に応じて Store を使用

---

## 8. まとめ

### この設計の目指すもの

1. **DomainModel で型安全性を確保**
   - 受け取る時は柔軟に、送り出す時は厳密に

2. **UI ライブラリ的なコンポーネント設計**
   - 汎用 I/O コンポーネント、ビジネス専用取りまとめコンポーネントの分離

3. **Store の最小限利用**
   - 必要になるまで local state で十分

4. **試行錯誤の余白を確保**
   - 「正解」ではなく「指針」として機能

---

## 9. 次のフェーズ

実装を通じて、この設計思想がどう形になるかを試していきます。

課題や改善が見つかれば、この設計書を更新して記録します。
