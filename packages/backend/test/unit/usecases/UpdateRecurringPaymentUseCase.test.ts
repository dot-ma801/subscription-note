import { describe, it, expect, vi } from 'vitest';
import { UpdateRecurringPaymentUseCase } from '@/usecases/UpdateRecurringPaymentUseCase';
import { NotFoundError } from '@/usecases/GetRecurringPaymentByIdUseCase';
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

const UPDATE_PARAMS = {
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

function makeRepository(payment: RecurringPayment | null): IRecurringPaymentRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(payment),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
  };
}

function makePayment(): RecurringPayment {
  return RecurringPayment.reconstruct({ id: EXISTING_ID, ...PAYMENT_FIXTURE });
}

describe('UpdateRecurringPaymentUseCase', () => {
  describe('存在する ID を指定した場合', () => {
    it('更新後の支払い詳細を返す', async () => {
      // Arrange
      const repository = makeRepository(makePayment());
      const useCase = new UpdateRecurringPaymentUseCase(repository);

      // Act
      const result = await useCase.execute(EXISTING_ID, UPDATE_PARAMS);

      // Assert
      expect(result).toMatchObject({
        id: EXISTING_ID,
        name: UPDATE_PARAMS.name,
        price: UPDATE_PARAMS.price,
        status: UPDATE_PARAMS.status,
        memo: UPDATE_PARAMS.memo,
      });
    });

    it('billingInterval が更新される', async () => {
      // Arrange
      const repository = makeRepository(makePayment());
      const useCase = new UpdateRecurringPaymentUseCase(repository);

      // Act
      const result = await useCase.execute(EXISTING_ID, UPDATE_PARAMS);

      // Assert
      expect(result.billingInterval).toEqual({
        intervalType: 'month',
        frequency: 1,
        day: 20,
      });
    });

    it('repository.update が1回呼ばれる', async () => {
      // Arrange
      const repository = makeRepository(makePayment());
      const useCase = new UpdateRecurringPaymentUseCase(repository);

      // Act
      await useCase.execute(EXISTING_ID, UPDATE_PARAMS);

      // Assert
      expect(repository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('年払いに更新する場合', () => {
    it('billingInterval に month が含まれる', async () => {
      // Arrange
      const repository = makeRepository(makePayment());
      const useCase = new UpdateRecurringPaymentUseCase(repository);
      const yearlyUpdate = {
        name: 'Adobe CC',
        price: 72336,
        billingInterval: {
          intervalType: 'year' as const,
          frequency: 1,
          day: 1,
          month: 4,
        },
        status: 'active' as const,
        memo: '',
      };

      // Act
      const result = await useCase.execute(EXISTING_ID, yearlyUpdate);

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
      const useCase = new UpdateRecurringPaymentUseCase(repository);

      // Act
      const act = () => useCase.execute(NON_EXISTING_ID, UPDATE_PARAMS);

      // Assert
      await expect(act()).rejects.toThrow(NotFoundError);
    });
  });
});
