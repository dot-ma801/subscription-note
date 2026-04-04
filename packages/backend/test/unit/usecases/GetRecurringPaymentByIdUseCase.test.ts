import { describe, it, expect, vi } from 'vitest';
import { GetRecurringPaymentByIdUseCase, NotFoundError } from '@/usecases/GetRecurringPaymentByIdUseCase';
import { RecurringPayment } from '@/domain/entities/RecurringPayment';
import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';

const EXISTING_ID = '01900000-0000-7000-8000-000000000001';
const NON_EXISTING_ID = '01900000-0000-7000-8000-000000000999';

const PAYMENT_FIXTURE = {
  name: 'Netflix',
  price: 1490,
  billingIntervalType: 'month' as const,
  billingFrequency: 1,
  billingDay: 15,
  billingMonth: null,
  status: 'active' as const,
  memo: 'スタンダードプラン',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
};

function makeRepository(payment: RecurringPayment | null): IRecurringPaymentRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(payment),
    save: vi.fn(),
    update: vi.fn(),
  };
}

function makePayment(): RecurringPayment {
  return RecurringPayment.reconstruct({ id: EXISTING_ID, ...PAYMENT_FIXTURE });
}

describe('GetRecurringPaymentByIdUseCase', () => {
  describe('存在する ID を指定した場合', () => {
    it('詳細データを返す', async () => {
      // Arrange
      const payment = makePayment();
      const repository = makeRepository(payment);
      const useCase = new GetRecurringPaymentByIdUseCase(repository);

      // Act
      const result = await useCase.execute(EXISTING_ID);

      // Assert
      expect(result).toMatchObject({
        id: EXISTING_ID,
        name: PAYMENT_FIXTURE.name,
        price: PAYMENT_FIXTURE.price,
        status: PAYMENT_FIXTURE.status,
        memo: PAYMENT_FIXTURE.memo,
      });
    });

    it('billingInterval の詳細が含まれる', async () => {
      // Arrange
      const payment = makePayment();
      const repository = makeRepository(payment);
      const useCase = new GetRecurringPaymentByIdUseCase(repository);

      // Act
      const result = await useCase.execute(EXISTING_ID);

      // Assert
      expect(result.billingInterval).toEqual({
        intervalType: 'month',
        frequency: 1,
        day: 15,
      });
    });

    it('createdAt と updatedAt が ISO 8601 文字列として含まれる', async () => {
      // Arrange
      const payment = makePayment();
      const repository = makeRepository(payment);
      const useCase = new GetRecurringPaymentByIdUseCase(repository);

      // Act
      const result = await useCase.execute(EXISTING_ID);

      // Assert
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('active ステータスの場合 nextBillingDate が null でない', async () => {
      // Arrange
      const payment = makePayment();
      const repository = makeRepository(payment);
      const useCase = new GetRecurringPaymentByIdUseCase(repository);

      // Act
      const result = await useCase.execute(EXISTING_ID);

      // Assert
      expect(result.nextBillingDate).not.toBeNull();
    });
  });

  describe('年払いの支払い情報を取得する場合', () => {
    it('billingInterval に month が含まれる', async () => {
      // Arrange
      const yearlyPayment = RecurringPayment.reconstruct({
        id: EXISTING_ID,
        name: 'Adobe CC',
        price: 72336,
        billingIntervalType: 'year',
        billingFrequency: 1,
        billingDay: 1,
        billingMonth: 4,
        status: 'active',
        memo: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      const repository = makeRepository(yearlyPayment);
      const useCase = new GetRecurringPaymentByIdUseCase(repository);

      // Act
      const result = await useCase.execute(EXISTING_ID);

      // Assert
      expect(result.billingInterval).toEqual({
        intervalType: 'year',
        frequency: 1,
        day: 1,
        month: 4,
      });
    });
  });

  describe('存在しない ID を指定した場合', () => {
    it('NotFoundError をスローする', async () => {
      // Arrange
      const repository = makeRepository(null);
      const useCase = new GetRecurringPaymentByIdUseCase(repository);

      // Act
      const act = () => useCase.execute(NON_EXISTING_ID);

      // Assert
      await expect(act()).rejects.toThrow(NotFoundError);
    });

    it('エラーメッセージが含まれる', async () => {
      // Arrange
      const repository = makeRepository(null);
      const useCase = new GetRecurringPaymentByIdUseCase(repository);

      // Act
      const act = () => useCase.execute(NON_EXISTING_ID);

      // Assert
      await expect(act()).rejects.toThrow('RecurringPayment not found');
    });
  });
});
