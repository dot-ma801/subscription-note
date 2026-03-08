import { describe, it, expect, beforeEach } from 'vitest';
import { GetRecurringPaymentUseCase } from '../../../../src/application/usecases/GetRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('GetRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let useCase: GetRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    useCase = new GetRecurringPaymentUseCase(repository);
  });

  it('should return detail with nextBillingDate for existing entity', async () => {
    const entity = RecurringPayment.create(validCreateParams());
    await repository.save(entity);

    const result = await useCase.execute(entity.id.value);

    expect(result.id).toBe(entity.id.value);
    expect(result.name).toBe('Netflix');
    expect(result.nextBillingDate).toBeDefined();
    expect(result.billingInterval).toBeDefined();
    expect(result.memo).toBe('映画・ドラマ見放題');
  });

  it('should return null nextBillingDate for cancelled entity', async () => {
    const entity = RecurringPayment.create(validCreateParams()).cancel();
    await repository.save(entity);

    const result = await useCase.execute(entity.id.value);

    expect(result.nextBillingDate).toBeNull();
  });

  it('should throw EntityNotFoundError for non-existent id', async () => {
    await expect(
      useCase.execute('550e8400-e29b-41d4-a716-446655440000'),
    ).rejects.toThrow('RecurringPayment not found');
  });

  it('should throw on invalid UUID', async () => {
    await expect(useCase.execute('invalid')).rejects.toThrow('Invalid UUID format');
  });
});
