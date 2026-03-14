import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { RecurringPayment } from '@/domain/entities/RecurringPayment';
import type { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId';
import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import { recurringPayments, type RecurringPaymentRow } from '@/infrastructure/db/schema';
import type * as schema from '@/infrastructure/db/schema';
import type { IntervalType } from '@/domain/valueObjects/BillingInterval';

export class DrizzleRecurringPaymentRepository implements IRecurringPaymentRepository {
  constructor(private readonly db: BetterSQLite3Database<typeof schema>) {}

  async findById(id: RecurringPaymentId): Promise<RecurringPayment | null> {
    const rows = await this.db
      .select()
      .from(recurringPayments)
      .where(eq(recurringPayments.id, id.value));
    if (rows.length === 0) return null;
    return this.rowToEntity(rows[0]!);
  }

  async findAll(): Promise<RecurringPayment[]> {
    const rows = await this.db.select().from(recurringPayments);
    return rows.map((row) => this.rowToEntity(row));
  }

  async save(payment: RecurringPayment): Promise<void> {
    await this.db.insert(recurringPayments).values(this.entityToRow(payment));
  }

  async update(payment: RecurringPayment): Promise<void> {
    await this.db
      .update(recurringPayments)
      .set(this.entityToRow(payment))
      .where(eq(recurringPayments.id, payment.id.value));
  }

  async delete(id: RecurringPaymentId): Promise<void> {
    await this.db.delete(recurringPayments).where(eq(recurringPayments.id, id.value));
  }

  private rowToEntity(row: RecurringPaymentRow): RecurringPayment {
    return RecurringPayment.reconstruct({
      id: row.id,
      name: row.name,
      price: row.price,
      billingIntervalType: row.billingIntervalType as IntervalType,
      billingFrequency: row.billingFrequency,
      billingDay: row.billingDay,
      billingMonth: row.billingMonth ?? null,
      status: row.status as 'active' | 'cancelled',
      memo: row.memo,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private entityToRow(payment: RecurringPayment): RecurringPaymentRow {
    return {
      id: payment.id.value,
      name: payment.name,
      price: payment.price.value,
      billingIntervalType: payment.billingInterval.intervalType,
      billingFrequency: payment.billingInterval.frequency,
      billingDay: payment.billingInterval.day,
      billingMonth: payment.billingInterval.month,
      status: payment.status.value,
      memo: payment.memo,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}
