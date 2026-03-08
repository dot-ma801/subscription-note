import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteRecurringPaymentUseCase } from '../../../../src/application/usecases/DeleteRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('DeleteRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let useCase: DeleteRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    useCase = new DeleteRecurringPaymentUseCase(repository);
  });

  it('should delete an existing entity', async () => {
    const entity = RecurringPayment.create(validCreateParams());
    await repository.save(entity);

    await useCase.execute(entity.id.value);

    const found = await repository.findById(entity.id);
    expect(found).toBeNull();
  });

  it('should throw for non-existent id', async () => {
    await expect(
      useCase.execute('550e8400-e29b-41d4-a716-446655440000'),
    ).rejects.toThrow('RecurringPayment not found');
  });
});
