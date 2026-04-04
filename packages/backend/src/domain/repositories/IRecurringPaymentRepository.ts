import type { RecurringPayment } from '@/domain/entities/RecurringPayment';
import type { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId';

export interface IRecurringPaymentRepository {
  findById(id: RecurringPaymentId): Promise<RecurringPayment | null>;
  findAll(): Promise<RecurringPayment[]>;
  save(payment: RecurringPayment): Promise<void>;
  update(payment: RecurringPayment): Promise<void>;
}
