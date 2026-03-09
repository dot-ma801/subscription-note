import { describe, it, expect, beforeEach } from 'vitest';
import { GetRecurringPaymentUseCase } from '../../../../src/application/usecases/GetRecurringPaymentUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('GetRecurringPaymentUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let sut: GetRecurringPaymentUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    sut = new GetRecurringPaymentUseCase(repository);
  });

  describe('#execute', () => {
    describe('存在する ID が渡された場合', () => {
      it('nextBillingDate を含む詳細情報を返すこと', async () => {
        const entity = RecurringPayment.create(validCreateParams());
        await repository.save(entity);

        const result = await sut.execute(entity.id.value);

        expect(result.id).toBe(entity.id.value);
        expect(result.name).toBe('Netflix');
        expect(result.nextBillingDate).toBeDefined();
        expect(result.billingInterval).toBeDefined();
        expect(result.memo).toBe('映画・ドラマ見放題');
      });

      it('解約済みの場合は nextBillingDate が null であること', async () => {
        const entity = RecurringPayment.create(validCreateParams()).cancel();
        await repository.save(entity);

        const result = await sut.execute(entity.id.value);

        expect(result.nextBillingDate).toBeNull();
      });
    });

    describe('存在しない ID が渡された場合', () => {
      it('EntityNotFoundError を投げること', async () => {
        await expect(
          sut.execute('550e8400-e29b-41d4-a716-446655440000'),
        ).rejects.toThrow('RecurringPayment not found');
      });
    });

    describe('無効な UUID が渡された場合', () => {
      it('例外を投げること', async () => {
        await expect(sut.execute('invalid')).rejects.toThrow('Invalid UUID format');
      });
    });
  });
});
