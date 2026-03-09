import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../../../src/presentation/app.js';
import { createInMemoryDb } from '../../../src/infrastructure/database/db.js';

function createTestApp() {
  const db = createInMemoryDb();
  return createApp(db);
}

const validBody = {
  name: 'Netflix',
  price: 1490,
  billingInterval: {
    intervalType: 'month',
    frequency: 1,
    day: 15,
  },
  memo: '映画・ドラマ見放題',
};

async function createPayment(app: ReturnType<typeof createTestApp>, body = validBody) {
  const res = await app.request('/api/recurring-payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

describe('定期支払い API', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/recurring-payments', () => {
    it('定期支払いを作成して 201 を返すこと', async () => {
      const res = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBeDefined();
      expect(body.name).toBe('Netflix');
      expect(body.price).toBe(1490);
      expect(body.status).toBe('active');
      expect(body.memo).toBe('映画・ドラマ見放題');
      expect(body.billingInterval.intervalType).toBe('month');
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it('レスポンスに nextBillingDate を含まないこと', async () => {
      const res = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      const body = await res.json();
      expect(body.nextBillingDate).toBeUndefined();
    });

    it('年次払いで作成できること', async () => {
      const res = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validBody,
          billingInterval: { intervalType: 'year', frequency: 1, day: 15, month: 1 },
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.billingInterval.intervalType).toBe('year');
      expect(body.billingInterval.month).toBe(1);
    });

    describe('無効なリクエストの場合', () => {
      it('空の名前で 400 を返すこと', async () => {
        const res = await app.request('/api/recurring-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validBody, name: '' }),
        });

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.errors).toBeDefined();
      });

      it('負の価格で 400 を返すこと', async () => {
        const res = await app.request('/api/recurring-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validBody, price: -100 }),
        });

        expect(res.status).toBe(400);
      });
    });
  });

  describe('GET /api/recurring-payments', () => {
    it('データが存在しない場合、空配列を返すこと', async () => {
      const res = await app.request('/api/recurring-payments');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it('全件を nextBillingDate 付きで返すこと', async () => {
      await createPayment(app);

      const res = await app.request('/api/recurring-payments');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].nextBillingDate).toBeDefined();
      expect(body[0].name).toBe('Netflix');
    });
  });

  describe('GET /api/recurring-payments/:id', () => {
    it('nextBillingDate を含む詳細情報を返すこと', async () => {
      const created = await createPayment(app);

      const res = await app.request(`/api/recurring-payments/${created.id}`);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(created.id);
      expect(body.nextBillingDate).toBeDefined();
      expect(body.billingInterval).toBeDefined();
      expect(body.memo).toBe('映画・ドラマ見放題');
    });

    describe('存在しない ID が渡された場合', () => {
      it('404 を返すこと', async () => {
        const res = await app.request(
          '/api/recurring-payments/550e8400-e29b-41d4-a716-446655440000',
        );

        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.message).toContain('not found');
      });
    });
  });

  describe('PUT /api/recurring-payments/:id', () => {
    it('定期支払いを更新して 200 を返すこと', async () => {
      const created = await createPayment(app);

      const res = await app.request(`/api/recurring-payments/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Netflix Premium',
          price: 1990,
          billingInterval: { intervalType: 'month', frequency: 1, day: 20 },
          status: 'active',
          memo: '4K対応プラン',
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.name).toBe('Netflix Premium');
      expect(body.price).toBe(1990);
    });

    it('レスポンスに nextBillingDate を含まないこと', async () => {
      const created = await createPayment(app);

      const res = await app.request(`/api/recurring-payments/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, status: 'active' }),
      });

      const body = await res.json();
      expect(body.nextBillingDate).toBeUndefined();
    });

    it('ステータスを cancelled に変更できること', async () => {
      const created = await createPayment(app);

      const res = await app.request(`/api/recurring-payments/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, status: 'cancelled' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('cancelled');
    });

    describe('存在しない ID が渡された場合', () => {
      it('404 を返すこと', async () => {
        const res = await app.request(
          '/api/recurring-payments/550e8400-e29b-41d4-a716-446655440000',
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...validBody, status: 'active' }),
          },
        );

        expect(res.status).toBe(404);
      });
    });

    describe('無効なリクエストの場合', () => {
      it('400 を返すこと', async () => {
        const created = await createPayment(app);

        const res = await app.request(`/api/recurring-payments/${created.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '' }),
        });

        expect(res.status).toBe(400);
      });
    });
  });

  describe('DELETE /api/recurring-payments/:id', () => {
    it('定期支払いを削除して 204 を返すこと', async () => {
      const created = await createPayment(app);

      const res = await app.request(`/api/recurring-payments/${created.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(204);
    });

    it('削除後に GET すると 404 を返すこと', async () => {
      const created = await createPayment(app);
      await app.request(`/api/recurring-payments/${created.id}`, { method: 'DELETE' });

      const getRes = await app.request(`/api/recurring-payments/${created.id}`);

      expect(getRes.status).toBe(404);
    });

    describe('存在しない ID が渡された場合', () => {
      it('404 を返すこと', async () => {
        const res = await app.request(
          '/api/recurring-payments/550e8400-e29b-41d4-a716-446655440000',
          { method: 'DELETE' },
        );

        expect(res.status).toBe(404);
      });
    });
  });
});
