import { describe, it, expect } from 'vitest';
import { calculateNextBillingDate } from '../../../../src/application/services/NextBillingDateCalculator.js';
import { BillingInterval } from '../../../../src/domain/valueObjects/BillingInterval.js';
import { PaymentStatus } from '../../../../src/domain/valueObjects/PaymentStatus.js';

describe('calculateNextBillingDate', () => {
  const active = PaymentStatus.create('active');
  const cancelled = PaymentStatus.create('cancelled');

  describe('ステータスが cancelled の場合', () => {
    it('null を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });

      const result = calculateNextBillingDate(interval, cancelled);

      expect(result).toBeNull();
    });
  });

  describe('月次払いの場合', () => {
    it('今日が請求日より前なら今月の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 10); // 1月10日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 0, 15));
    });

    it('今日が請求日と同じなら今月の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 15); // 1月15日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 0, 15));
    });

    it('今日が請求日を過ぎていたら翌月の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 20); // 1月20日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 1, 15));
    });

    it('frequency に応じて月をスキップすること', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 3, day: 15 });
      const ref = new Date(2024, 0, 20); // 1月20日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 3, 15)); // 4月15日
    });

    it('請求日が月末を超える場合、月末日に丸めること（2月の31日→29日）', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 31 });
      const ref = new Date(2024, 1, 1); // 2月1日（うるう年）

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 1, 29));
    });

    it('年をまたいで翌年1月の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 11, 20); // 12月20日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2025, 0, 15));
    });
  });

  describe('年次払いの場合', () => {
    it('今年の請求日がまだなら今年の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'year', frequency: 1, day: 15, month: 6 });
      const ref = new Date(2024, 0, 10); // 1月10日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 5, 15)); // 6月15日
    });

    it('今年の請求日を過ぎていたら翌年の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'year', frequency: 1, day: 15, month: 1 });
      const ref = new Date(2024, 0, 20); // 1月20日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2025, 0, 15));
    });

    it('請求日が月末を超える場合、月末日に丸めること（2月29日→28日）', () => {
      const interval = BillingInterval.create({ intervalType: 'year', frequency: 1, day: 29, month: 2 });
      const ref = new Date(2025, 0, 1); // 2025年1月1日（うるう年ではない）

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2025, 1, 28));
    });
  });

  describe('四半期払いの場合', () => {
    it('今四半期の請求日を過ぎていたら次の四半期の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'quarter', frequency: 1, day: 1 });
      const ref = new Date(2024, 0, 15); // 1月15日（Q1の1日を過ぎている）

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 3, 1)); // 4月1日
    });

    it('今四半期の請求日がまだなら今四半期の請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'quarter', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 10); // 1月10日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2024, 0, 15)); // 1月15日
    });

    it('全四半期の請求日を過ぎていたら翌年の Q1 請求日を返すこと', () => {
      const interval = BillingInterval.create({ intervalType: 'quarter', frequency: 1, day: 1 });
      const ref = new Date(2024, 9, 15); // 10月15日

      const result = calculateNextBillingDate(interval, active, ref);

      expect(result).toEqual(new Date(2025, 0, 1));
    });
  });
});
