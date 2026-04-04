import { describe, it, expect, vi } from 'vitest';
import { CancelRecurringPaymentUseCase, AlreadyCancelledError } from '@/usecases/CancelRecurringPaymentUseCase';
import { NotFoundError } from '@/usecases/GetRecurringPaymentByIdUseCase';
import { RecurringPayment } from '@/domain/entities/RecurringPayment';
import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';

const EXISTING_ID = '01900000-0000-7000-8000-000000000001';
const NON_EXISTING_ID = '01900000-0000-7000-8000-000000000999';

function makeRepository(payment: RecurringPayment | null): IRecurringPaymentRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(payment),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
  };
}

function makeActivePayment(): RecurringPayment {
  return RecurringPayment.reconstruct({
    id: EXISTING_ID,
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
  });
}

function makeCancelledPayment(): RecurringPayment {
  return RecurringPayment.reconstruct({
    id: EXISTING_ID,
    name: 'Netflix',
    price: 1490,
    billingIntervalType: 'month',
    billingFrequency: 1,
    billingDay: 15,
    billingMonth: null,
    status: 'cancelled',
    memo: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
  });
}

describe('CancelRecurringPaymentUseCase', () => {
  describe('active な支払いを解約する場合', () => {
    it('repository.update が1回呼ばれる', async () => {
      // Arrange
      const repository = makeRepository(makeActivePayment());
      const useCase = new CancelRecurringPaymentUseCase(repository);

      // Act
      await useCase.execute(EXISTING_ID);

      // Assert
      expect(repository.update).toHaveBeenCalledTimes(1);
    });

    it('cancelled ステータスのエンティティで update が呼ばれる', async () => {
      // Arrange
      const repository = makeRepository(makeActivePayment());
      const useCase = new CancelRecurringPaymentUseCase(repository);

      // Act
      await useCase.execute(EXISTING_ID);

      // Assert
      const updatedPayment = vi.mocked(repository.update).mock.calls[0]?.[0];
      expect(updatedPayment?.status.value).toBe('cancelled');
    });
  });

  describe('存在しない ID を指定した場合', () => {
    it('NotFoundError をスローする', async () => {
      // Arrange
      const repository = makeRepository(null);
      const useCase = new CancelRecurringPaymentUseCase(repository);

      // Act
      const act = () => useCase.execute(NON_EXISTING_ID);

      // Assert
      await expect(act()).rejects.toThrow(NotFoundError);
    });
  });

  describe('すでに解約済みの支払いを解約する場合', () => {
    it('AlreadyCancelledError をスローする', async () => {
      // Arrange
      const repository = makeRepository(makeCancelledPayment());
      const useCase = new CancelRecurringPaymentUseCase(repository);

      // Act
      const act = () => useCase.execute(EXISTING_ID);

      // Assert
      await expect(act()).rejects.toThrow(AlreadyCancelledError);
    });

    it('repository.update が呼ばれない', async () => {
      // Arrange
      const repository = makeRepository(makeCancelledPayment());
      const useCase = new CancelRecurringPaymentUseCase(repository);

      // Act
      await useCase.execute(EXISTING_ID).catch(() => {});

      // Assert
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
