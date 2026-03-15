import { z } from 'zod';
import { BillingIntervalSchema } from './billingInterval.js';

// ===== Request DTO =====

export const CreateRecurringPaymentSchema = z.object({
  name: z.string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください'),
  price: z.number()
    .positive('価格は0より大きい値で入力してください'),
  billingInterval: BillingIntervalSchema,
  memo: z.string()
    .max(500, 'メモは500文字以内で入力してください')
    .optional()
    .default(''),
});

export type CreateRecurringPaymentRequest = z.infer<typeof CreateRecurringPaymentSchema>;

export const UpdateRecurringPaymentSchema = z.object({
  name: z.string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください'),
  price: z.number()
    .positive('価格は0より大きい値で入力してください'),
  billingInterval: BillingIntervalSchema,
  status: z.enum(['active', 'cancelled'])
    .describe('ステータス（active=利用中、cancelled=解約済）'),
  memo: z.string()
    .max(500, 'メモは500文字以内で入力してください')
    .optional()
    .default(''),
});

export type UpdateRecurringPaymentRequest = z.infer<typeof UpdateRecurringPaymentSchema>;

// ===== Response DTO =====

export const RecurringPaymentListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  status: z.enum(['active', 'cancelled']),
  nextBillingDate: z.string().datetime()
    .nullable()
    .describe('次回の支払い日（計算値）。cancelled の場合は null'),
  createdAt: z.string().datetime(),
});

export type RecurringPaymentListItem = z.infer<typeof RecurringPaymentListItemSchema>;

export const RecurringPaymentDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  billingInterval: BillingIntervalSchema,
  status: z.enum(['active', 'cancelled']),
  memo: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  nextBillingDate: z.string().datetime()
    .nullable()
    .describe('次回の支払い日（計算値）。cancelled の場合は null'),
});

export type RecurringPaymentDetail = z.infer<typeof RecurringPaymentDetailSchema>;

export const RecurringPaymentListSchema = z.array(RecurringPaymentListItemSchema);

export type RecurringPaymentList = z.infer<typeof RecurringPaymentListSchema>;
