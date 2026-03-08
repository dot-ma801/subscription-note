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
  nextBillingDate: z.string().nullable(),
  createdAt: z.string(),
});

export type RecurringPaymentListItem = z.infer<typeof RecurringPaymentListItemSchema>;

export const RecurringPaymentDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  billingInterval: BillingIntervalSchema,
  status: z.enum(['active', 'cancelled']),
  memo: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  nextBillingDate: z.string().nullable(),
});

export type RecurringPaymentDetail = z.infer<typeof RecurringPaymentDetailSchema>;

export const RecurringPaymentListSchema = z.array(RecurringPaymentListItemSchema);

export type RecurringPaymentList = z.infer<typeof RecurringPaymentListSchema>;

// POST/PUT response (without nextBillingDate)
export const RecurringPaymentMutationResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  billingInterval: BillingIntervalSchema,
  status: z.enum(['active', 'cancelled']),
  memo: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RecurringPaymentMutationResponse = z.infer<typeof RecurringPaymentMutationResponseSchema>;
