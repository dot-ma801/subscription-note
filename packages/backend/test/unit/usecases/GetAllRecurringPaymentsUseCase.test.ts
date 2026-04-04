// vi は Vitest のモックユーティリティ。vi.fn() でモック関数を生成できる
import { describe, it, expect, vi } from 'vitest';
import { GetAllRecurringPaymentsUseCase } from '@/usecases/GetAllRecurringPaymentsUseCase';
import { RecurringPayment } from '@/domain/entities/RecurringPayment';
import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';

const ACTIVE_PAYMENT_FIXTURE = {
  name: 'Netflix',
  price: 1490,
  billingIntervalType: 'month' as const,
  billingFrequency: 1,
  billingDay: 15,
  billingMonth: null,
  status: 'active' as const,
  memo: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const CANCELLED_PAYMENT_FIXTURE = {
  name: 'Spotify',
  price: 980,
  billingIntervalType: 'month' as const,
  billingFrequency: 1,
  billingDay: 20,
  billingMonth: null,
  status: 'cancelled' as const,
  memo: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
};

function makeRepository(payments: RecurringPayment[]): IRecurringPaymentRepository {
  return {
    findAll: vi.fn().mockResolvedValue(payments),
    findById: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };
}

function makeActivePayment(id: string): RecurringPayment {
  return RecurringPayment.reconstruct({ id, ...ACTIVE_PAYMENT_FIXTURE });
}

function makeCancelledPayment(id: string): RecurringPayment {
  return RecurringPayment.reconstruct({ id, ...CANCELLED_PAYMENT_FIXTURE });
}

describe('GetAllRecurringPaymentsUseCase', () => {
  describe('データが存在する場合', () => {
    it('全件のリストアイテムを返す', async () => {
      // Arrange
      const payment = makeActivePayment('01900000-0000-7000-8000-000000000001');
      const repository = makeRepository([payment]);
      const useCase = new GetAllRecurringPaymentsUseCase(repository);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '01900000-0000-7000-8000-000000000001',
        name: ACTIVE_PAYMENT_FIXTURE.name,
        price: ACTIVE_PAYMENT_FIXTURE.price,
        status: ACTIVE_PAYMENT_FIXTURE.status,
      });
    });

    it('nextBillingDate が ISO 8601 文字列として含まれる', async () => {
      // Arrange
      const payment = makeActivePayment('01900000-0000-7000-8000-000000000001');
      const repository = makeRepository([payment]);
      const useCase = new GetAllRecurringPaymentsUseCase(repository);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]!.nextBillingDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('複数件のデータをすべて返す', async () => {
      // Arrange
      const payment1 = makeActivePayment('01900000-0000-7000-8000-000000000001');
      const payment2 = makeActivePayment('01900000-0000-7000-8000-000000000002');
      const repository = makeRepository([payment1, payment2]);
      const useCase = new GetAllRecurringPaymentsUseCase(repository);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  describe('データが0件の場合', () => {
    it('空配列を返す', async () => {
      // Arrange
      const repository = makeRepository([]);
      const useCase = new GetAllRecurringPaymentsUseCase(repository);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('cancelled ステータスのデータが含まれる場合', () => {
    it('nextBillingDate が null になる', async () => {
      // Arrange
      const payment = makeCancelledPayment('01900000-0000-7000-8000-000000000003');
      const repository = makeRepository([payment]);
      const useCase = new GetAllRecurringPaymentsUseCase(repository);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]!.nextBillingDate).toBeNull();
    });

    it('status が "cancelled" になる', async () => {
      // Arrange
      const payment = makeCancelledPayment('01900000-0000-7000-8000-000000000003');
      const repository = makeRepository([payment]);
      const useCase = new GetAllRecurringPaymentsUseCase(repository);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]!.status).toBe('cancelled');
    });
  });
});
