import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRecurringPaymentUseCase } from '../../../../src/application/usecases/CreateRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { validCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('CreateRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let sut: CreateRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    sut = new CreateRecurringPaymentUseCase(repository);
  });

  describe('#execute', () => {
    it('定期支払いを作成してレスポンスを返すこと', async () => {
      const result = await sut.execute(validCreateParams());

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Netflix');
      expect(result.price).toBe(1490);
      expect(result.status).toBe('active');
      expect(result.memo).toBe('映画・ドラマ見放題');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('リポジトリにエンティティを永続化すること', async () => {
      const result = await sut.execute(validCreateParams());

      const all = await repository.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].id.value).toBe(result.id);
    });

    describe('無効なデータが渡された場合', () => {
      it('空の名前で例外を投げること', async () => {
        await expect(
          sut.execute({ ...validCreateParams(), name: '' }),
        ).rejects.toThrow('Name must not be empty');
      });

      it('負の価格で例外を投げること', async () => {
        await expect(
          sut.execute({ ...validCreateParams(), price: -100 }),
        ).rejects.toThrow('Price must be positive');
      });
    });
  });
});
