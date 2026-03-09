import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateRecurringPaymentUseCase } from '../../../../src/application/usecases/UpdateRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams, validUpdateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('UpdateRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let sut: UpdateRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    sut = new UpdateRecurringPaymentUseCase(repository);
  });

  describe('#execute', () => {
    describe('存在する ID が渡された場合', () => {
      it('更新されたレスポンスを返すこと', async () => {
        const entity = RecurringPayment.create(validCreateParams());
        await repository.save(entity);

        const result = await sut.execute(entity.id.value, validUpdateParams());

        expect(result.name).toBe('Netflix Premium');
        expect(result.price).toBe(1990);
        expect(result.status).toBe('active');
      });

      it('リポジトリのエンティティを更新すること', async () => {
        const entity = RecurringPayment.create(validCreateParams());
        await repository.save(entity);

        await sut.execute(entity.id.value, validUpdateParams());

        const stored = await repository.findById(entity.id);
        expect(stored!.name).toBe('Netflix Premium');
      });

      it('ステータスを cancelled に変更できること', async () => {
        const entity = RecurringPayment.create(validCreateParams());
        await repository.save(entity);

        const result = await sut.execute(entity.id.value, {
          ...validUpdateParams(),
          status: 'cancelled',
        });

        expect(result.status).toBe('cancelled');
      });

      it('cancelled から active に再契約できること', async () => {
        const entity = RecurringPayment.create(validCreateParams()).cancel();
        await repository.save(entity);

        const result = await sut.execute(entity.id.value, {
          ...validUpdateParams(),
          status: 'active',
        });

        expect(result.status).toBe('active');
      });
    });

    describe('存在しない ID が渡された場合', () => {
      it('EntityNotFoundError を投げること', async () => {
        await expect(
          sut.execute('550e8400-e29b-41d4-a716-446655440000', validUpdateParams()),
        ).rejects.toThrow('RecurringPayment not found');
      });
    });
  });
});
