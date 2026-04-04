import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId';
import { calculateNextBillingDate } from '@/domain/services/NextBillingDateCalculator';
import type { UpdateRecurringPaymentRequest, RecurringPaymentDetail } from '@subscription-note/shared';
import { NotFoundError } from './GetRecurringPaymentByIdUseCase';

export class UpdateRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(id: string, params: UpdateRecurringPaymentRequest): Promise<RecurringPaymentDetail> {
    const paymentId = RecurringPaymentId.reconstruct(id);
    const existing = await this.repository.findById(paymentId);

    if (existing === null) {
      throw new NotFoundError('RecurringPayment not found');
    }

    const updated = existing.update({
      name: params.name,
      price: params.price,
      billingInterval: {
        intervalType: params.billingInterval.intervalType,
        frequency: params.billingInterval.frequency,
        day: params.billingInterval.day,
        month: params.billingInterval.month ?? null,
      },
      status: params.status,
      memo: params.memo,
    });

    await this.repository.update(updated);

    const today = new Date();
    const nextBillingDate = calculateNextBillingDate(updated, today);

    return {
      id: updated.id.value,
      name: updated.name,
      price: updated.price.value,
      billingInterval: {
        intervalType: updated.billingInterval.intervalType,
        frequency: updated.billingInterval.frequency,
        day: updated.billingInterval.day,
        ...(updated.billingInterval.month !== null
          ? { month: updated.billingInterval.month }
          : {}),
      },
      status: updated.status.value,
      memo: updated.memo,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      nextBillingDate: nextBillingDate ? nextBillingDate.toISOString() : null,
    };
  }
}
