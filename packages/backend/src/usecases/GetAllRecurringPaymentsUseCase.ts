import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import { calculateNextBillingDate } from '@/domain/services/NextBillingDateCalculator';
import type { RecurringPaymentListItem } from '@subscription-note/shared';

export class GetAllRecurringPaymentsUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(): Promise<RecurringPaymentListItem[]> {
    const payments = await this.repository.findAll();
    const today = new Date();

    return payments.map((payment) => {
      const nextBillingDate = calculateNextBillingDate(payment, today);
      return {
        id: payment.id.value,
        name: payment.name,
        price: payment.price.value,
        status: payment.status.value,
        nextBillingDate: nextBillingDate ? nextBillingDate.toISOString() : null,
        createdAt: payment.createdAt.toISOString(),
      };
    });
  }
}
