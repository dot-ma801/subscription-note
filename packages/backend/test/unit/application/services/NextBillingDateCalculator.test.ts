import { describe, it, expect } from 'vitest';
import { calculateNextBillingDate } from '../../../../src/application/services/NextBillingDateCalculator.js';
import { BillingInterval } from '../../../../src/domain/valueObjects/BillingInterval.js';
import { PaymentStatus } from '../../../../src/domain/valueObjects/PaymentStatus.js';

describe('calculateNextBillingDate', () => {
  const active = PaymentStatus.create('active');
  const cancelled = PaymentStatus.create('cancelled');

  describe('cancelled status', () => {
    it('should return null for cancelled status', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      expect(calculateNextBillingDate(interval, cancelled)).toBeNull();
    });
  });

  describe('monthly billing', () => {
    it('should return this month if today is before billing day', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 10); // Jan 10
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 0, 15));
    });

    it('should return this month if today is the billing day', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 15); // Jan 15
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 0, 15));
    });

    it('should return next month if today is after billing day', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 20); // Jan 20
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 1, 15));
    });

    it('should skip months based on frequency', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 3, day: 15 });
      const ref = new Date(2024, 0, 20); // Jan 20
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 3, 15)); // April 15
    });

    it('should handle day overflow (31 in February)', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 31 });
      const ref = new Date(2024, 1, 1); // Feb 1 (leap year)
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 1, 29)); // Feb 29
    });

    it('should handle year rollover', () => {
      const interval = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const ref = new Date(2024, 11, 20); // Dec 20
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2025, 0, 15)); // Jan 15
    });
  });

  describe('yearly billing', () => {
    it('should return this year if the date has not passed', () => {
      const interval = BillingInterval.create({ intervalType: 'year', frequency: 1, day: 15, month: 6 });
      const ref = new Date(2024, 0, 10); // Jan 10
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 5, 15)); // Jun 15
    });

    it('should return next year if the date has passed', () => {
      const interval = BillingInterval.create({ intervalType: 'year', frequency: 1, day: 15, month: 1 });
      const ref = new Date(2024, 0, 20); // Jan 20
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2025, 0, 15)); // Jan 15 next year
    });

    it('should handle day overflow in yearly', () => {
      const interval = BillingInterval.create({ intervalType: 'year', frequency: 1, day: 29, month: 2 });
      const ref = new Date(2025, 0, 1); // Jan 1, 2025 (not leap year)
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2025, 1, 28)); // Feb 28
    });
  });

  describe('quarterly billing', () => {
    it('should return the next quarter date', () => {
      const interval = BillingInterval.create({ intervalType: 'quarter', frequency: 1, day: 1 });
      const ref = new Date(2024, 0, 15); // Jan 15 (past Q1 day 1)
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 3, 1)); // Apr 1
    });

    it('should return this quarter if the day has not passed', () => {
      const interval = BillingInterval.create({ intervalType: 'quarter', frequency: 1, day: 15 });
      const ref = new Date(2024, 0, 10); // Jan 10
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2024, 0, 15)); // Jan 15
    });

    it('should roll to next year if all quarters passed', () => {
      const interval = BillingInterval.create({ intervalType: 'quarter', frequency: 1, day: 1 });
      const ref = new Date(2024, 9, 15); // Oct 15
      const result = calculateNextBillingDate(interval, active, ref);
      expect(result).toEqual(new Date(2025, 0, 1)); // Jan 1 next year
    });
  });
});
