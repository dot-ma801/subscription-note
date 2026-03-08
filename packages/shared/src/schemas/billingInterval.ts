import { z } from 'zod';

export const BillingIntervalSchema = z.object({
  intervalType: z.enum(['month', 'year', 'quarter'])
    .describe('支払い周期タイプ'),
  frequency: z.number()
    .int('周期は整数である必要があります')
    .positive('周期は1以上である必要があります')
    .describe('何ヶ月ごと、何年ごとか（例：1=毎月、3=3ヶ月ごと）'),
  day: z.number()
    .int('日は整数である必要があります')
    .min(1, '日は1以上である必要があります')
    .max(31, '日は31以下である必要があります')
    .describe('月の何日か（1-31）'),
  month: z.number()
    .int('月は整数である必要があります')
    .min(1, '月は1以上である必要があります')
    .max(12, '月は12以下である必要があります')
    .optional()
    .describe('年の場合：何月か（1-12）。月払い・四半期払いでは不要'),
}).refine((data) => {
  if (data.intervalType === 'year' && data.month === undefined) {
    return false;
  }
  if (data.intervalType !== 'year' && data.month !== undefined) {
    return false;
  }
  return true;
}, {
  message: '年払いの場合は month が必須、月払い・四半期払いでは不要です',
  path: ['month'],
});

export type BillingInterval = z.infer<typeof BillingIntervalSchema>;
