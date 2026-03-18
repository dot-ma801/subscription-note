import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import { recurringPayments } from '@/infrastructure/db/schema';
import { createRecurringPaymentsRoute } from '@/presentation/routes/recurringPayments';
import * as schema from '@/infrastructure/db/schema';
import type { RecurringPaymentListItem, RecurringPaymentDetail } from '@subscription-note/shared';

function createInMemoryDb() {
  const sqlite = new Database(':memory:');
  // { schema } を渡すことで db.query.* の型安全なリレーショナルクエリ API が有効になる
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
    // route() の第2引数はマウントするサブルーター。createRecurringPaymentsRoute(db) は DB をDIした Hono ルーターを返す
    app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(db));
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
      app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(db));

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
      app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(db));

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
    app = new Hono().route('/api/recurring-payments', createRecurringPaymentsRoute(db));
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
