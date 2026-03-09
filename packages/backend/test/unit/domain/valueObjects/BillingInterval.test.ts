import { describe, it, expect } from 'vitest';
import { BillingInterval } from '../../../../src/domain/valueObjects/BillingInterval.js';

describe('BillingInterval', () => {
  describe('#create', () => {
    describe('月次の場合', () => {
      it('月次の支払い周期を生成できること', () => {
        const sut = BillingInterval.create({
          intervalType: 'month',
          frequency: 1,
          day: 15,
        });

        expect(sut.intervalType).toBe('month');
        expect(sut.frequency).toBe(1);
        expect(sut.day).toBe(15);
        expect(sut.month).toBeNull();
      });

      it('month を指定すると例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'month',
            frequency: 1,
            day: 15,
            month: 3,
          }),
        ).toThrow('Month must not be specified for non-yearly billing interval');
      });
    });

    describe('四半期の場合', () => {
      it('四半期の支払い周期を生成できること', () => {
        const sut = BillingInterval.create({
          intervalType: 'quarter',
          frequency: 1,
          day: 1,
        });

        expect(sut.intervalType).toBe('quarter');
        expect(sut.month).toBeNull();
      });
    });

    describe('年次の場合', () => {
      it('month を指定して年次の支払い周期を生成できること', () => {
        const sut = BillingInterval.create({
          intervalType: 'year',
          frequency: 1,
          day: 15,
          month: 1,
        });

        expect(sut.intervalType).toBe('year');
        expect(sut.month).toBe(1);
      });

      it('month を省略すると例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'year',
            frequency: 1,
            day: 15,
          }),
        ).toThrow('Month is required for yearly billing interval');
      });

      it('month が 0 以下で例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'year',
            frequency: 1,
            day: 15,
            month: 0,
          }),
        ).toThrow('Month must be an integer between 1 and 12');
      });

      it('month が 13 以上で例外を投げること', () => {
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

    describe('無効な値が渡された場合', () => {
      it('無効な intervalType で例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'weekly',
            frequency: 1,
            day: 15,
          }),
        ).toThrow('Invalid interval type');
      });

      it('frequency が 0 以下で例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'month',
            frequency: 0,
            day: 15,
          }),
        ).toThrow('Frequency must be a positive integer');
      });

      it('frequency が小数で例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'month',
            frequency: 1.5,
            day: 15,
          }),
        ).toThrow('Frequency must be a positive integer');
      });

      it('day が 0 以下で例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'month',
            frequency: 1,
            day: 0,
          }),
        ).toThrow('Day must be an integer between 1 and 31');
      });

      it('day が 32 以上で例外を投げること', () => {
        expect(() =>
          BillingInterval.create({
            intervalType: 'month',
            frequency: 1,
            day: 32,
          }),
        ).toThrow('Day must be an integer between 1 and 31');
      });
    });
  });

  describe('#reconstruct', () => {
    it('有効なパラメータから復元できること', () => {
      const sut = BillingInterval.reconstruct({
        intervalType: 'month',
        frequency: 1,
        day: 15,
        month: null,
      });

      expect(sut.intervalType).toBe('month');
    });
  });

  describe('#equals', () => {
    it('同じ値を持つ BillingInterval 同士は等しいこと', () => {
      const a = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const b = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });

      expect(a.equals(b)).toBe(true);
    });

    it('異なる値を持つ BillingInterval 同士は等しくないこと', () => {
      const a = BillingInterval.create({ intervalType: 'month', frequency: 1, day: 15 });
      const b = BillingInterval.create({ intervalType: 'month', frequency: 2, day: 15 });

      expect(a.equals(b)).toBe(false);
    });
  });
});
