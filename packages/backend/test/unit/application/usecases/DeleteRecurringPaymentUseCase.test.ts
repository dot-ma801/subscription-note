import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteRecurringPaymentUseCase } from '../../../../src/application/usecases/DeleteRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('DeleteRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let sut: DeleteRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    sut = new DeleteRecurringPaymentUseCase(repository);
  });

  describe('#execute', () => {
    describe('存在する ID が渡された場合', () => {
      it('エンティティを削除すること', async () => {
        const entity = RecurringPayment.create(validCreateParams());
        await repository.save(entity);

        await sut.execute(entity.id.value);

        const found = await repository.findById(entity.id);
        expect(found).toBeNull();
      });
    });

    describe('存在しない ID が渡された場合', () => {
      it('EntityNotFoundError を投げること', async () => {
        await expect(
          sut.execute('550e8400-e29b-41d4-a716-446655440000'),
        ).rejects.toThrow('RecurringPayment not found');
      });
    });
  });
});
