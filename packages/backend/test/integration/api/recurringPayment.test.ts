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

describe('RecurringPayment API', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/recurring-payments', () => {
    it('should create a recurring payment (201)', async () => {
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
      // POST response should NOT include nextBillingDate
      expect(body.nextBillingDate).toBeUndefined();
    });

    it('should return 400 for invalid body (missing name)', async () => {
      const res = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, name: '' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.errors).toBeDefined();
    });

    it('should return 400 for invalid body (negative price)', async () => {
      const res = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, price: -100 }),
      });

      expect(res.status).toBe(400);
    });

    it('should create with yearly billing', async () => {
      const res = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validBody,
          billingInterval: {
            intervalType: 'year',
            frequency: 1,
            day: 15,
            month: 1,
          },
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.billingInterval.intervalType).toBe('year');
      expect(body.billingInterval.month).toBe(1);
    });
  });

  describe('GET /api/recurring-payments', () => {
    it('should return empty array initially (200)', async () => {
      const res = await app.request('/api/recurring-payments');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([]);
    });

    it('should return all payments with nextBillingDate', async () => {
      // Create one first
      await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      const res = await app.request('/api/recurring-payments');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].nextBillingDate).toBeDefined();
      expect(body[0].name).toBe('Netflix');
    });
  });

  describe('GET /api/recurring-payments/:id', () => {
    it('should return detail with nextBillingDate (200)', async () => {
      const createRes = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });
      const created = await createRes.json();

      const res = await app.request(`/api/recurring-payments/${created.id}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(created.id);
      expect(body.nextBillingDate).toBeDefined();
      expect(body.billingInterval).toBeDefined();
      expect(body.memo).toBe('映画・ドラマ見放題');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await app.request(
        '/api/recurring-payments/550e8400-e29b-41d4-a716-446655440000',
      );
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toContain('not found');
    });
  });

  describe('PUT /api/recurring-payments/:id', () => {
    it('should update a payment (200)', async () => {
      const createRes = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });
      const created = await createRes.json();

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
      // PUT response should NOT include nextBillingDate
      expect(body.nextBillingDate).toBeUndefined();
    });

    it('should cancel via status change', async () => {
      const createRes = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });
      const created = await createRes.json();

      const res = await app.request(`/api/recurring-payments/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validBody,
          status: 'cancelled',
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('cancelled');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await app.request(
        '/api/recurring-payments/550e8400-e29b-41d4-a716-446655440000',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...validBody,
            status: 'active',
          }),
        },
      );
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid body', async () => {
      const createRes = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });
      const created = await createRes.json();

      const res = await app.request(`/api/recurring-payments/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/recurring-payments/:id', () => {
    it('should delete a payment (204)', async () => {
      const createRes = await app.request('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });
      const created = await createRes.json();

      const res = await app.request(`/api/recurring-payments/${created.id}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(204);

      // Verify it's deleted
      const getRes = await app.request(`/api/recurring-payments/${created.id}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await app.request(
        '/api/recurring-payments/550e8400-e29b-41d4-a716-446655440000',
        { method: 'DELETE' },
      );
      expect(res.status).toBe(404);
    });
  });
});
