import type { IRecurringPaymentRepository } from '../../domain/repositories/IRecurringPaymentRepository.js';
import type { RecurringPaymentListItem } from '@subscription-note/shared';
import { RecurringPaymentMapper } from '../mappers/RecurringPaymentMapper.js';
import { calculateNextBillingDate } from '../services/NextBillingDateCalculator.js';

export class GetAllRecurringPaymentsUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(): Promise<RecurringPaymentListItem[]> {
    const entities = await this.repository.findAll();

    return entities.map((entity) => {
      const nextBillingDate = calculateNextBillingDate(
        entity.billingInterval,
        entity.status,
      );
      return RecurringPaymentMapper.toListItemResponse(entity, nextBillingDate);
    });
  }
}
