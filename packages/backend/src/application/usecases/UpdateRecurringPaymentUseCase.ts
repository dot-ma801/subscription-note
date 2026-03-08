import type { IRecurringPaymentRepository } from '../../domain/repositories/IRecurringPaymentRepository.js';
import type { RecurringPaymentMutationResponse } from '@subscription-note/shared';
import { RecurringPaymentId } from '../../domain/valueObjects/RecurringPaymentId.js';
import { EntityNotFoundError } from '../../domain/errors/DomainError.js';
import { RecurringPaymentMapper } from '../mappers/RecurringPaymentMapper.js';

export class UpdateRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(
    id: string,
    request: {
      name: string;
      price: number;
      billingInterval: {
        intervalType: string;
        frequency: number;
        day: number;
        month?: number | null;
      };
      status: string;
      memo: string;
    },
  ): Promise<RecurringPaymentMutationResponse> {
    const paymentId = RecurringPaymentId.reconstruct(id);
    const existing = await this.repository.findById(paymentId);

    if (!existing) {
      throw new EntityNotFoundError('RecurringPayment', id);
    }

    const updated = existing.update(request);
    await this.repository.update(updated);

    return RecurringPaymentMapper.toMutationResponse(updated);
  }
}
