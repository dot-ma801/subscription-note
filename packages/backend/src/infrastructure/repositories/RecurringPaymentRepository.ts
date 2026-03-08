import { eq } from 'drizzle-orm';
import type { IRecurringPaymentRepository } from '../../domain/repositories/IRecurringPaymentRepository.js';
import type { RecurringPayment } from '../../domain/entities/RecurringPayment.js';
import type { RecurringPaymentId } from '../../domain/valueObjects/RecurringPaymentId.js';
import type { AppDatabase } from '../database/db.js';
import { recurringPayments } from '../database/schema.js';
import { RecurringPaymentMapper } from '../../application/mappers/RecurringPaymentMapper.js';

export class RecurringPaymentRepository implements IRecurringPaymentRepository {
  constructor(private readonly db: AppDatabase) {}

  async findById(id: RecurringPaymentId): Promise<RecurringPayment | null> {
    const rows = this.db
      .select()
      .from(recurringPayments)
      .where(eq(recurringPayments.id, id.value))
      .all();

    if (rows.length === 0) return null;

    return RecurringPaymentMapper.toDomain({
      ...rows[0],
      memo: rows[0].memo ?? '',
    });
  }

  async findAll(): Promise<RecurringPayment[]> {
    const rows = this.db.select().from(recurringPayments).all();

    return rows.map((row) =>
      RecurringPaymentMapper.toDomain({
        ...row,
        memo: row.memo ?? '',
      }),
    );
  }

  async save(payment: RecurringPayment): Promise<void> {
    const row = RecurringPaymentMapper.toPersistence(payment);
    this.db.insert(recurringPayments).values(row).run();
  }

  async update(payment: RecurringPayment): Promise<void> {
    const row = RecurringPaymentMapper.toPersistence(payment);
    this.db
      .update(recurringPayments)
      .set(row)
      .where(eq(recurringPayments.id, row.id))
      .run();
  }

  async delete(id: RecurringPaymentId): Promise<void> {
    this.db
      .delete(recurringPayments)
      .where(eq(recurringPayments.id, id.value))
      .run();
  }
}
