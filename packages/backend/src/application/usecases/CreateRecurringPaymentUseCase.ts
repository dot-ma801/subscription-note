import type { IRecurringPaymentRepository } from '../../domain/repositories/IRecurringPaymentRepository.js';
import type { RecurringPaymentMutationResponse } from '@subscription-note/shared';
import { RecurringPayment } from '../../domain/entities/RecurringPayment.js';
import { RecurringPaymentMapper } from '../mappers/RecurringPaymentMapper.js';

export class CreateRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(request: {
    name: string;
    price: number;
    billingInterval: {
      intervalType: string;
      frequency: number;
      day: number;
      month?: number | null;
    };
    memo?: string;
  }): Promise<RecurringPaymentMutationResponse> {
    const entity = RecurringPayment.create(request);
    await this.repository.save(entity);
    return RecurringPaymentMapper.toMutationResponse(entity);
  }
}
