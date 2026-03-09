import { describe, it, expect, beforeEach } from 'vitest';
import { GetAllRecurringPaymentsUseCase } from '../../../../src/application/usecases/GetAllRecurringPaymentsUseCase.js';
import { MockRecurringPaymentRepository } from '../../../fixtures/MockRecurringPaymentRepository.js';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams, validYearlyCreateParams } from '../../../fixtures/recurringPayment.fixtures.js';

describe('GetAllRecurringPaymentsUseCase', () => {
  let repository: MockRecurringPaymentRepository;
  let sut: GetAllRecurringPaymentsUseCase;

  beforeEach(() => {
    repository = new MockRecurringPaymentRepository();
    sut = new GetAllRecurringPaymentsUseCase(repository);
  });

  describe('#execute', () => {
    describe('データが存在しない場合', () => {
      it('空配列を返すこと', async () => {
        const result = await sut.execute();

        expect(result).toEqual([]);
      });
    });

    describe('データが存在する場合', () => {
      it('全件を nextBillingDate 付きで返すこと', async () => {
        const entity1 = RecurringPayment.create(validCreateParams());
        const entity2 = RecurringPayment.create(validYearlyCreateParams());
        await repository.save(entity1);
        await repository.save(entity2);

        const result = await sut.execute();

        expect(result).toHaveLength(2);
        expect(result[0].nextBillingDate).toBeDefined();
        expect(result[1].nextBillingDate).toBeDefined();
      });

      it('解約済みのエンティティは nextBillingDate が null であること', async () => {
        const entity = RecurringPayment.create(validCreateParams()).cancel();
        await repository.save(entity);

        const result = await sut.execute();

        expect(result[0].nextBillingDate).toBeNull();
      });
    });
  });
});
