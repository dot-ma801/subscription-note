import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import { recurringPayments } from '@/infrastructure/db/schema';
import { DrizzleRecurringPaymentRepository } from '@/infrastructure/repositories/DrizzleRecurringPaymentRepository';
import { createRecurringPaymentsRoute } from '@/presentation/routes/recurringPayments';
import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import * as schema from '@/infrastructure/db/schema';
import type { RecurringPaymentListItem, RecurringPaymentDetail, CreateRecurringPaymentRequest } from '@subscription-note/shared';

function createInMemoryDb() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });

  db.run(sql`
    CREATE TABLE recurring_payments (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      billing_interval_type TEXT NOT NULL,
      billing_frequency INTEGER NOT NULL,
      billing_day INTEGER NOT NULL,
      billing_month INTEGER,
      status TEXT NOT NULL,
      memo TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  return db;
}

function createRepository(db: ReturnType<typeof createInMemoryDb>) {
  return new DrizzleRecurringPaymentRepository(db);
}

const SAMPLE_PAYMENT = {
  id: '01900000-0000-7000-8000-000000000001',
  name: 'Netflix',
  price: 1490,
  billingIntervalType: 'month',
  billingFrequency: 1,
  billingDay: 15,
  billingMonth: null,
  status: 'active',
  memo: 'スタンダードプラン',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
} as const;

describe('GET /api/recurring-payments', () => {
  let app: Hono;

  beforeEach(() => {
    const db = createInMemoryDb();
    app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(createRepository(db)));
  });

  describe('データが存在しない場合', () => {
    it('200 と空配列を返す', async () => {
      // Arrange
      // (データなし)

      // Act
      const response = await app.request('/api/recurring-payments');

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
    });
  });

  describe('データが存在する場合', () => {
    it('200 とデータ一覧を返す', async () => {
      // Arrange
      const db = createInMemoryDb();
      await db.insert(recurringPayments).values(SAMPLE_PAYMENT);
      app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(createRepository(db)));

      // Act
      const response = await app.request('/api/recurring-payments');

      // Assert
      expect(response.status).toBe(200);
      // Fetch API の response.json() は Promise<unknown> を返すため、明示的にキャストする
      const body = await response.json() as RecurringPaymentListItem[];
      expect(body).toHaveLength(1);
    });

    it('レスポンスに必要なフィールドが含まれる', async () => {
      // Arrange
      const db = createInMemoryDb();
      await db.insert(recurringPayments).values(SAMPLE_PAYMENT);
      app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(createRepository(db)));

      // Act
      const response = await app.request('/api/recurring-payments');

      // Assert
      const [item] = await response.json() as RecurringPaymentListItem[];
      expect(item).toMatchObject({
        id: SAMPLE_PAYMENT.id,
        name: 'Netflix',
        price: 1490,
        status: 'active',
      });
      expect(item!.nextBillingDate).not.toBeNull();
      expect(item!.createdAt).toBeDefined();
    });
  });
});

describe('GET /api/recurring-payments/:id', () => {
  let db: ReturnType<typeof createInMemoryDb>;
  let app: Hono;

  beforeEach(() => {
    db = createInMemoryDb();
    app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(createRepository(db)));
  });

  describe('存在する ID を指定した場合', () => {
    it('200 と詳細データを返す', async () => {
      // Arrange
      await db.insert(recurringPayments).values(SAMPLE_PAYMENT);

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json() as RecurringPaymentDetail;
      expect(body).toMatchObject({
        id: SAMPLE_PAYMENT.id,
        name: 'Netflix',
        price: 1490,
        status: 'active',
        memo: 'スタンダードプラン',
      });
    });

    it('billingInterval の詳細が含まれる', async () => {
      // Arrange
      await db.insert(recurringPayments).values(SAMPLE_PAYMENT);

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`);

      // Assert
      const body = await response.json() as RecurringPaymentDetail;
      expect(body.billingInterval).toEqual({
        intervalType: 'month',
        frequency: 1,
        day: 15,
      });
    });
  });

  describe('存在しない ID を指定した場合', () => {
    it('404 を返す', async () => {
      // Arrange
      const nonExistingId = '01900000-0000-7000-8000-000000000999';

      // Act
      const response = await app.request(`/api/recurring-payments/${nonExistingId}`);

      // Assert
      expect(response.status).toBe(404);
    });

    it('エラーメッセージが含まれる', async () => {
      // Arrange
      const nonExistingId = '01900000-0000-7000-8000-000000000999';

      // Act
      const response = await app.request(`/api/recurring-payments/${nonExistingId}`);

      // Assert
      const body = await response.json() as { message: string };
      expect(body.message).toBe('RecurringPayment not found');
    });
  });
});

describe('POST /api/recurring-payments', () => {
  let db: ReturnType<typeof createInMemoryDb>;
  let app: Hono;

  beforeEach(() => {
    db = createInMemoryDb();
    app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(createRepository(db)));
  });

  const VALID_BODY: CreateRecurringPaymentRequest = {
    name: 'Spotify',
    price: 980,
    billingInterval: {
      intervalType: 'month',
      frequency: 1,
      day: 1,
    },
    memo: 'ファミリープラン',
  };

  describe('有効なリクエストボディの場合', () => {
    it('201 と作成した支払い詳細を返す', async () => {
      // Arrange
      // (DBは空)

      // Act
      const response = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_BODY),
      });

      // Assert
      expect(response.status).toBe(201);
      const body = await response.json() as RecurringPaymentDetail;
      expect(body).toMatchObject({
        name: VALID_BODY.name,
        price: VALID_BODY.price,
        status: 'active',
        memo: VALID_BODY.memo,
      });
    });

    it('レスポンスに ID が含まれる', async () => {
      // Arrange
      // (DBは空)

      // Act
      const response = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_BODY),
      });

      // Assert
      const body = await response.json() as RecurringPaymentDetail;
      expect(body.id).toBeDefined();
    });

    it('billingInterval が正しく返る', async () => {
      // Arrange
      // (DBは空)

      // Act
      const response = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_BODY),
      });

      // Assert
      const body = await response.json() as RecurringPaymentDetail;
      expect(body.billingInterval).toEqual(VALID_BODY.billingInterval);
    });
  });

  describe('バリデーションエラーの場合', () => {
    it('name が空文字のとき 400 を返す', async () => {
      // Arrange
      const invalidBody = { ...VALID_BODY, name: '' };

      // Act
      const response = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBody),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    it('price が 0 以下のとき 400 を返す', async () => {
      // Arrange
      const invalidBody = { ...VALID_BODY, price: 0 };

      // Act
      const response = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBody),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });
});

describe('PUT /api/recurring-payments/:id', () => {
  let db: ReturnType<typeof createInMemoryDb>;
  let app: Hono;

  beforeEach(async () => {
    db = createInMemoryDb();
    await db.insert(recurringPayments).values(SAMPLE_PAYMENT);
    app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(createRepository(db)));
  });

  const UPDATE_BODY = {
    name: 'Netflix プレミアム',
    price: 1980,
    billingInterval: {
      intervalType: 'month' as const,
      frequency: 1,
      day: 20,
    },
    status: 'active' as const,
    memo: 'プレミアムプランに変更',
  };

  describe('存在する ID を指定した場合', () => {
    it('200 と更新後の支払い詳細を返す', async () => {
      // Arrange
      // (beforeEach でデータ挿入済み)

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(UPDATE_BODY),
      });

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json() as RecurringPaymentDetail;
      expect(body).toMatchObject({
        id: SAMPLE_PAYMENT.id,
        name: UPDATE_BODY.name,
        price: UPDATE_BODY.price,
        memo: UPDATE_BODY.memo,
      });
    });

    it('billingInterval が更新される', async () => {
      // Arrange
      // (beforeEach でデータ挿入済み)

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(UPDATE_BODY),
      });

      // Assert
      const body = await response.json() as RecurringPaymentDetail;
      expect(body.billingInterval).toEqual(UPDATE_BODY.billingInterval);
    });
  });

  describe('存在しない ID を指定した場合', () => {
    it('404 を返す', async () => {
      // Arrange
      const nonExistingId = '01900000-0000-7000-8000-000000000999';

      // Act
      const response = await app.request(`/api/recurring-payments/${nonExistingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(UPDATE_BODY),
      });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('バリデーションエラーの場合', () => {
    it('price が 0 以下のとき 400 を返す', async () => {
      // Arrange
      const invalidBody = { ...UPDATE_BODY, price: -1 };

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBody),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });
});

describe('DELETE /api/recurring-payments/:id', () => {
  let db: ReturnType<typeof createInMemoryDb>;
  let app: Hono;

  beforeEach(async () => {
    db = createInMemoryDb();
    await db.insert(recurringPayments).values(SAMPLE_PAYMENT);
    app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(createRepository(db)));
  });

  describe('active な支払いを解約する場合', () => {
    it('204 を返す', async () => {
      // Arrange
      // (beforeEach でデータ挿入済み)

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'DELETE',
      });

      // Assert
      expect(response.status).toBe(204);
    });

    it('レスポンスボディが空である', async () => {
      // Arrange
      // (beforeEach でデータ挿入済み)

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'DELETE',
      });

      // Assert
      const text = await response.text();
      expect(text).toBe('');
    });
  });

  describe('存在しない ID を指定した場合', () => {
    it('404 を返す', async () => {
      // Arrange
      const nonExistingId = '01900000-0000-7000-8000-000000000999';

      // Act
      const response = await app.request(`/api/recurring-payments/${nonExistingId}`, {
        method: 'DELETE',
      });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('すでに解約済みの支払いを解約する場合', () => {
    it('409 を返す', async () => {
      // Arrange
      // 1回目の解約
      await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'DELETE',
      });

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'DELETE',
      });

      // Assert
      expect(response.status).toBe(409);
    });

    it('エラーメッセージが含まれる', async () => {
      // Arrange
      await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'DELETE',
      });

      // Act
      const response = await app.request(`/api/recurring-payments/${SAMPLE_PAYMENT.id}`, {
        method: 'DELETE',
      });

      // Assert
      const body = await response.json() as { message: string };
      expect(body.message).toBe('すでに解約済みです');
    });
  });
});

describe('予期しないエラーの再スロー', () => {
  const unexpectedError = new Error('DB connection lost');

  function makeBrokenRepository(method: keyof IRecurringPaymentRepository): IRecurringPaymentRepository {
    return {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      update: vi.fn(),
      [method]: vi.fn().mockRejectedValue(unexpectedError),
    };
  }

  describe('GET /:id でリポジトリが予期しないエラーをスローした場合', () => {
    it('500 を返す', async () => {
      // Arrange
      const app = new Hono().route(
        '/api/recurring-payments',
        createRecurringPaymentsRoute(makeBrokenRepository('findById')),
      );

      // Act
      const response = await app.request('/api/recurring-payments/some-id');

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /:id でリポジトリが予期しないエラーをスローした場合', () => {
    it('500 を返す', async () => {
      // Arrange
      const app = new Hono().route(
        '/api/recurring-payments',
        createRecurringPaymentsRoute(makeBrokenRepository('findById')),
      );
      const body = {
        name: 'Netflix',
        price: 1490,
        billingInterval: { intervalType: 'month', frequency: 1, day: 15 },
        status: 'active',
        memo: '',
      };

      // Act
      const response = await app.request('/api/recurring-payments/some-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /:id でリポジトリが予期しないエラーをスローした場合', () => {
    it('500 を返す', async () => {
      // Arrange
      const app = new Hono().route(
        '/api/recurring-payments',
        createRecurringPaymentsRoute(makeBrokenRepository('findById')),
      );

      // Act
      const response = await app.request('/api/recurring-payments/some-id', {
        method: 'DELETE',
      });

      // Assert
      expect(response.status).toBe(500);
    });
  });
});
