import { describe, it, expect, vi } from 'vitest';
import { CreateRecurringPaymentUseCase } from '@/usecases/CreateRecurringPaymentUseCase';
import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';

function makeRepository(): IRecurringPaymentRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

const MONTHLY_PARAMS = {
  name: 'Netflix',
  price: 1490,
  billingInterval: {
    intervalType: 'month' as const,
    frequency: 1,
    day: 15,
  },
  memo: 'スタンダードプラン',
};

describe('CreateRecurringPaymentUseCase', () => {
  describe('月払いの支払いを作成する場合', () => {
    it('作成した支払い詳細を返す', async () => {
      // Arrange
      const repository = makeRepository();
      const useCase = new CreateRecurringPaymentUseCase(repository);

      // Act
      const result = await useCase.execute(MONTHLY_PARAMS);

      // Assert
      expect(result).toMatchObject({
        name: MONTHLY_PARAMS.name,
        price: MONTHLY_PARAMS.price,
        status: 'active',
        memo: MONTHLY_PARAMS.memo,
      });
    });

    it('ID が自動採番される', async () => {
      // Arrange
      const repository = makeRepository();
      const useCase = new CreateRecurringPaymentUseCase(repository);

      // Act
      const result = await useCase.execute(MONTHLY_PARAMS);

      // Assert
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('billingInterval が正しく返る', async () => {
      // Arrange
      const repository = makeRepository();
      const useCase = new CreateRecurringPaymentUseCase(repository);

      // Act
      const result = await useCase.execute(MONTHLY_PARAMS);

      // Assert
      expect(result.billingInterval).toEqual({
        intervalType: 'month',
        frequency: 1,
        day: 15,
      });
    });

    it('active ステータスのため nextBillingDate が null でない', async () => {
      // Arrange
      const repository = makeRepository();
      const useCase = new CreateRecurringPaymentUseCase(repository);

      // Act
      const result = await useCase.execute(MONTHLY_PARAMS);

      // Assert
      expect(result.nextBillingDate).not.toBeNull();
    });

    it('repository.save が1回呼ばれる', async () => {
      // Arrange
      const repository = makeRepository();
      const useCase = new CreateRecurringPaymentUseCase(repository);

      // Act
      await useCase.execute(MONTHLY_PARAMS);

      // Assert
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('年払いの支払いを作成する場合', () => {
    it('billingInterval に month が含まれる', async () => {
      // Arrange
      const repository = makeRepository();
      const useCase = new CreateRecurringPaymentUseCase(repository);
      const yearlyParams = {
        name: 'Adobe CC',
        price: 72336,
        billingInterval: {
          intervalType: 'year' as const,
          frequency: 1,
          day: 1,
          month: 4,
        },
        memo: '',
      };

      // Act
      const result = await useCase.execute(yearlyParams);

      // Assert
      expect(result.billingInterval).toEqual({
        intervalType: 'year',
        frequency: 1,
        day: 1,
        month: 4,
      });
    });
  });
});
