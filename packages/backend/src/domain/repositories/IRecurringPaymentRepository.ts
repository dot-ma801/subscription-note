import type { RecurringPayment } from '@/domain/entities/RecurringPayment.js';
import type { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId.js';

export interface IRecurringPaymentRepository {
  findById(id: RecurringPaymentId): Promise<RecurringPayment | null>;
  findAll(): Promise<RecurringPayment[]>;
  save(payment: RecurringPayment): Promise<void>;
  update(payment: RecurringPayment): Promise<void>;
  delete(id: RecurringPaymentId): Promise<void>;
}
