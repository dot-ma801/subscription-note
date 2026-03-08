import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const recurringPayments = sqliteTable('recurring_payments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  billingIntervalType: text('billing_interval_type').notNull(),
  billingFrequency: integer('billing_frequency').notNull(),
  billingDay: integer('billing_day').notNull(),
  billingMonth: integer('billing_month'),
  status: text('status').notNull(),
  memo: text('memo').default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
