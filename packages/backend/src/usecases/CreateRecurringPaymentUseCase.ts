import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import { RecurringPayment } from '@/domain/entities/RecurringPayment';
import { calculateNextBillingDate } from '@/domain/services/NextBillingDateCalculator';
import type { CreateRecurringPaymentRequest, RecurringPaymentDetail } from '@subscription-note/shared';

export class CreateRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(params: CreateRecurringPaymentRequest): Promise<RecurringPaymentDetail> {
    const payment = RecurringPayment.create({
      name: params.name,
      price: params.price,
      billingInterval: {
        intervalType: params.billingInterval.intervalType,
        frequency: params.billingInterval.frequency,
        day: params.billingInterval.day,
        month: params.billingInterval.month ?? null,
      },
      memo: params.memo,
    });

    await this.repository.save(payment);

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
