import { describe, it, expect, beforeEach } from 'vitest';
import { GetAllRecurringPaymentsUseCase } from '../../../../src/application/usecases/GetAllRecurringPaymentsUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams, validYearlyCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('GetAllRecurringPaymentsUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let useCase: GetAllRecurringPaymentsUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    useCase = new GetAllRecurringPaymentsUseCase(repository);
  });

  it('should return empty array when no entities', async () => {
    const result = await useCase.execute();
    expect(result).toEqual([]);
  });

  it('should return all entities with nextBillingDate', async () => {
    const entity1 = RecurringPayment.create(validCreateParams());
    const entity2 = RecurringPayment.create(validYearlyCreateParams());
    await repository.save(entity1);
    await repository.save(entity2);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].nextBillingDate).toBeDefined();
    expect(result[1].nextBillingDate).toBeDefined();
  });

  it('should return null nextBillingDate for cancelled entities', async () => {
    const entity = RecurringPayment.create(validCreateParams()).cancel();
    await repository.save(entity);

    const result = await useCase.execute();

    expect(result[0].nextBillingDate).toBeNull();
  });
});
