import { describe, it, expect } from 'vitest';
import { BillingInterval } from '../../../../src/domain/valueObjects/BillingInterval.js';

describe('BillingInterval', () => {
  describe('create', () => {
    it('should create a monthly interval', () => {
      const interval = BillingInterval.create({
        intervalType: 'month',
        frequency: 1,
        day: 15,
      });
      expect(interval.intervalType).toBe('month');
      expect(interval.frequency).toBe(1);
      expect(interval.day).toBe(15);
      expect(interval.month).toBeNull();
    });

    it('should create a quarterly interval', () => {
      const interval = BillingInterval.create({
        intervalType: 'quarter',
        frequency: 1,
        day: 1,
      });
      expect(interval.intervalType).toBe('quarter');
      expect(interval.month).toBeNull();
    });

    it('should create a yearly interval with month', () => {
      const interval = BillingInterval.create({
        intervalType: 'year',
        frequency: 1,
        day: 15,
        month: 1,
      });
      expect(interval.intervalType).toBe('year');
      expect(interval.month).toBe(1);
    });

    it('should throw for yearly without month', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'year',
          frequency: 1,
          day: 15,
        }),
      ).toThrow('Month is required for yearly billing interval');
    });

    it('should throw for monthly with month specified', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'month',
          frequency: 1,
          day: 15,
          month: 3,
        }),
      ).toThrow('Month must not be specified for non-yearly billing interval');
    });

    it('should throw for invalid intervalType', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'weekly',
          frequency: 1,
          day: 15,
        }),
      ).toThrow('Invalid interval type');
    });

    it('should throw for non-positive frequency', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'month',
          frequency: 0,
          day: 15,
        }),
      ).toThrow('Frequency must be a positive integer');
    });

    it('should throw for non-integer frequency', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'month',
          frequency: 1.5,
          day: 15,
        }),
      ).toThrow('Frequency must be a positive integer');
    });

    it('should throw for day below 1', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'month',
          frequency: 1,
          day: 0,
        }),
      ).toThrow('Day must be an integer between 1 and 31');
    });

    it('should throw for day above 31', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'month',
          frequency: 1,
          day: 32,
        }),
      ).toThrow('Day must be an integer between 1 and 31');
    });

    it('should throw for month below 1', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'year',
          frequency: 1,
          day: 15,
          month: 0,
        }),
      ).toThrow('Month must be an integer between 1 and 12');
    });

    it('should throw for month above 12', () => {
      expect(() =>
        BillingInterval.create({
          intervalType: 'year',
          frequency: 1,
          day: 15,
          month: 13,
        }),
      ).toThrow('Month must be an integer between 1 and 12');
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct from valid params', () => {
      const interval = BillingInterval.reconstruct({
        intervalType: 'month',
        frequency: 1,
        day: 15,
        month: null,
      });
      expect(interval.intervalType).toBe('month');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const a = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const b = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const b = BillingInterval.create({ intervalType: 'month', frequency: 2, day: 15 });
      expect(a.equals(b)).toBe(false);
    });
  });
});
