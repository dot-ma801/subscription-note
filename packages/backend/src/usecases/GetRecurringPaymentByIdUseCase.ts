import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId';
import { calculateNextBillingDate } from '@/domain/services/NextBillingDateCalculator';
import type { RecurringPaymentDetail } from '@subscription-note/shared';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class GetRecurringPaymentByIdUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(id: string): Promise<RecurringPaymentDetail> {
    const paymentId = RecurringPaymentId.reconstruct(id);
    const payment = await this.repository.findById(paymentId);

    if (payment === null) {
      throw new NotFoundError('RecurringPayment not found');
    }

    const today = new Date();
    const nextBillingDate = calculateNextBillingDate(payment, today);

    return {
      id: payment.id.value,
      name: payment.name,
      price: payment.price.value,
      billingInterval: {
        intervalType: payment.billingInterval.intervalType,
        frequency: payment.billingInterval.frequency,
        day: payment.billingInterval.day,
        ...(payment.billingInterval.month !== null
          ? { month: payment.billingInterval.month }
          : {}),
      },
      status: payment.status.value,
      memo: payment.memo,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      nextBillingDate: nextBillingDate ? nextBillingDate.toISOString() : null,
    };
  }
}
