import type { IRecurringPaymentRepository } from '../../domain/repositories/IRecurringPaymentRepository.js';
import { RecurringPaymentId } from '../../domain/valueObjects/RecurringPaymentId.js';
import { EntityNotFoundError } from '../../domain/errors/DomainError.js';

export class DeleteRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(id: string): Promise<void> {
    const paymentId = RecurringPaymentId.reconstruct(id);
    const existing = await this.repository.findById(paymentId);

    if (!existing) {
      throw new EntityNotFoundError('RecurringPayment', id);
    }

    await this.repository.delete(paymentId);
  }
}
