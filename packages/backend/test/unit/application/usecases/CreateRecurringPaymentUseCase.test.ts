import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRecurringPaymentUseCase } from '../../../../src/application/usecases/CreateRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { validCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('CreateRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let useCase: CreateRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    useCase = new CreateRecurringPaymentUseCase(repository);
  });

  it('should create and save a recurring payment', async () => {
    const result = await useCase.execute(validCreateParams());

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Netflix');
    expect(result.price).toBe(1490);
    expect(result.status).toBe('active');
    expect(result.memo).toBe('映画・ドラマ見放題');
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
  });

  it('should persist the entity in the repository', async () => {
    const result = await useCase.execute(validCreateParams());
    const all = await repository.findAll();

    expect(all).toHaveLength(1);
    expect(all[0].id.value).toBe(result.id);
  });

  it('should throw on invalid data (empty name)', async () => {
    await expect(
      useCase.execute({ ...validCreateParams(), name: '' }),
    ).rejects.toThrow('Name must not be empty');
  });

  it('should throw on invalid data (negative price)', async () => {
    await expect(
      useCase.execute({ ...validCreateParams(), price: -100 }),
    ).rejects.toThrow('Price must be positive');
  });
});
