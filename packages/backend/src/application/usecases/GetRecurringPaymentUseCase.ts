import type { IRecurringPaymentRepository } from '../../domain/repositories/IRecurringPaymentRepository.js';
import type { RecurringPaymentDetail } from '@subscription-note/shared';
import { RecurringPaymentId } from '../../domain/valueObjects/RecurringPaymentId.js';
import { EntityNotFoundError } from '../../domain/errors/DomainError.js';
import { RecurringPaymentMapper } from '../mappers/RecurringPaymentMapper.js';
import { calculateNextBillingDate } from '../services/NextBillingDateCalculator.js';

export class GetRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(id: string): Promise<RecurringPaymentDetail> {
    const paymentId = RecurringPaymentId.reconstruct(id);
    const entity = await this.repository.findById(paymentId);

    if (!entity) {
      throw new EntityNotFoundError('RecurringPayment', id);
    }

    const nextBillingDate = calculateNextBillingDate(
      entity.billingInterval,
      entity.status,
    );

    return RecurringPaymentMapper.toDetailResponse(entity, nextBillingDate);
  }
}
