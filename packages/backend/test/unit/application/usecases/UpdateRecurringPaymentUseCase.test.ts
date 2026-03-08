import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateRecurringPaymentUseCase } from '../../../../src/application/usecases/UpdateRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams, validUpdateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('UpdateRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let useCase: UpdateRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    useCase = new UpdateRecurringPaymentUseCase(repository);
  });

  it('should update an existing entity', async () => {
    const entity = RecurringPayment.create(validCreateParams());
    await repository.save(entity);

    const result = await useCase.execute(entity.id.value, validUpdateParams());

    expect(result.name).toBe('Netflix Premium');
    expect(result.price).toBe(1990);
    expect(result.status).toBe('active');
  });

  it('should persist the updated entity', async () => {
    const entity = RecurringPayment.create(validCreateParams());
    await repository.save(entity);

    await useCase.execute(entity.id.value, validUpdateParams());
    const stored = await repository.findById(entity.id);

    expect(stored!.name).toBe('Netflix Premium');
  });

  it('should allow status change to cancelled', async () => {
    const entity = RecurringPayment.create(validCreateParams());
    await repository.save(entity);

    const result = await useCase.execute(entity.id.value, {
      ...validUpdateParams(),
      status: 'cancelled',
    });

    expect(result.status).toBe('cancelled');
  });

  it('should allow reactivation from cancelled to active', async () => {
    const entity = RecurringPayment.create(validCreateParams()).cancel();
    await repository.save(entity);

    const result = await useCase.execute(entity.id.value, {
      ...validUpdateParams(),
      status: 'active',
    });

    expect(result.status).toBe('active');
  });

  it('should throw for non-existent id', async () => {
    await expect(
      useCase.execute('550e8400-e29b-41d4-a716-446655440000', validUpdateParams()),
    ).rejects.toThrow('RecurringPayment not found');
  });
});
