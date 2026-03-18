import { describe, it, expect } from 'vitest';
import { calculateNextBillingDate } from '@/domain/services/NextBillingDateCalculator';
import { RecurringPayment } from '@/domain/entities/RecurringPayment';

function makeActivePayment(overrides: {
  intervalType: 'month' | 'year' | 'quarter';
  frequency: number;
  day: number;
  month?: number;
}): RecurringPayment {
  return RecurringPayment.reconstruct({
    id: '01900000-0000-7000-8000-000000000001',
    name: 'Test Service',
    price: 1000,
    billingIntervalType: overrides.intervalType,
    billingFrequency: overrides.frequency,
    billingDay: overrides.day,
    billingMonth: overrides.month ?? null,
    status: 'active',
    memo: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });
}

function makeCancelledPayment(): RecurringPayment {
  return RecurringPayment.reconstruct({
    id: '01900000-0000-7000-8000-000000000002',
    name: 'Cancelled Service',
    price: 500,
    billingIntervalType: 'month',
    billingFrequency: 1,
    billingDay: 15,
    billingMonth: null,
    status: 'cancelled',
    memo: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });
}

describe('calculateNextBillingDate', () => {
  describe('cancelled ステータスのサブスクリプション', () => {
    it('null を返す', () => {
      // Arrange
      const payment = makeCancelledPayment();
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('月払い (month)', () => {
    it('今日が支払日より前の場合、今月の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'month', frequency: 1, day: 20 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2025, 2, 20)); // 3月20日
    });

    it('今日が支払日と同じ場合、今月の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'month', frequency: 1, day: 15 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2025, 2, 15)); // 3月15日
    });

    it('今日が支払日より後の場合、翌月の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'month', frequency: 1, day: 10 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2025, 3, 10)); // 4月10日
    });

    it('frequency が 2 の場合、2ヶ月後の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'month', frequency: 2, day: 10 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2025, 4, 10)); // 5月10日
    });
  });

  describe('四半期払い (quarter)', () => {
    it('今日が支払日より後の場合、frequency * 3 ヶ月後の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'quarter', frequency: 1, day: 10 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2025, 5, 10)); // 6月10日（3ヶ月後）
    });

    it('今日が支払日より前の場合、今月の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'quarter', frequency: 1, day: 20 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2025, 2, 20)); // 3月20日
    });
  });

  describe('年払い (year)', () => {
    it('今年の支払日がまだ来ていない場合、今年の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'year', frequency: 1, day: 20, month: 6 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2025, 5, 20)); // 2025年6月20日
    });

    it('今年の支払日が過ぎた場合、翌年の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'year', frequency: 1, day: 10, month: 2 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2026, 1, 10)); // 2026年2月10日
    });

    it('同じ月で支払日が過ぎた場合、翌年の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'year', frequency: 1, day: 10, month: 3 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2026, 2, 10)); // 2026年3月10日
    });

    it('frequency が 2 の場合、2年後の支払日を返す', () => {
      // Arrange
      const payment = makeActivePayment({ intervalType: 'year', frequency: 2, day: 10, month: 2 });
      const today = new Date(2025, 2, 15); // 3月15日

      // Act
      const result = calculateNextBillingDate(payment, today);

      // Assert
      expect(result).toEqual(new Date(2027, 1, 10)); // 2027年2月10日
    });
  });
});
