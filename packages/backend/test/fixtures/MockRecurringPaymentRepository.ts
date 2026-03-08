import type { IRecurringPaymentRepository } from '../../src/domain/repositories/IRecurringPaymentRepository.js';
import type { RecurringPayment } from '../../src/domain/entities/RecurringPayment.js';
import type { RecurringPaymentId } from '../../src/domain/valueObjects/RecurringPaymentId.js';

export class MockRecurringPaymentRepository implements IRecurringPaymentRepository {
  private store = new Map<string, RecurringPayment>();

  async findById(id: RecurringPaymentId): Promise<RecurringPayment | null> {
    return this.store.get(id.value) ?? null;
  }

  async findAll(): Promise<RecurringPayment[]> {
    return Array.from(this.store.values());
  }

  async save(payment: RecurringPayment): Promise<void> {
    this.store.set(payment.id.value, payment);
  }

  async update(payment: RecurringPayment): Promise<void> {
    this.store.set(payment.id.value, payment);
  }

  async delete(id: RecurringPaymentId): Promise<void> {
    this.store.delete(id.value);
  }

  clear(): void {
    this.store.clear();
  }
}
