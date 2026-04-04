import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId';
import { NotFoundError } from './GetRecurringPaymentByIdUseCase';

export class AlreadyCancelledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlreadyCancelledError';
  }
}

export class CancelRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(id: string): Promise<void> {
    const paymentId = RecurringPaymentId.reconstruct(id);
    const existing = await this.repository.findById(paymentId);

    if (existing === null) {
      throw new NotFoundError('RecurringPayment not found');
    }

    let cancelled;
    try {
      cancelled = existing.cancel();
    } catch {
      throw new AlreadyCancelledError('すでに解約済みです');
    }

    await this.repository.update(cancelled);
  }
}
