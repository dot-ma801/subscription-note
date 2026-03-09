import { describe, it, expect } from 'vitest';
import { PaymentStatus } from '../../../../src/domain/valueObjects/PaymentStatus.js';

describe('PaymentStatus', () => {
  describe('#create', () => {
    it('active で生成できること', () => {
      const sut = PaymentStatus.create('active');

      expect(sut.value).toBe('active');
    });

    it('cancelled で生成できること', () => {
      const sut = PaymentStatus.create('cancelled');

      expect(sut.value).toBe('cancelled');
    });

    describe('無効な値が渡された場合', () => {
      it('例外を投げること', () => {
        expect(() => PaymentStatus.create('pending')).toThrow('Invalid payment status');
      });
    });
  });

  describe('#isActive', () => {
    it('active の場合 true を返すこと', () => {
      expect(PaymentStatus.create('active').isActive()).toBe(true);
    });

    it('cancelled の場合 false を返すこと', () => {
      expect(PaymentStatus.create('cancelled').isActive()).toBe(false);
    });
  });

  describe('#isCancelled', () => {
    it('cancelled の場合 true を返すこと', () => {
      expect(PaymentStatus.create('cancelled').isCancelled()).toBe(true);
    });

    it('active の場合 false を返すこと', () => {
      expect(PaymentStatus.create('active').isCancelled()).toBe(false);
    });
  });

  describe('#equals', () => {
    it('同じ値を持つ PaymentStatus 同士は等しいこと', () => {
      const a = PaymentStatus.create('active');
      const b = PaymentStatus.create('active');

      expect(a.equals(b)).toBe(true);
    });

    it('異なる値を持つ PaymentStatus 同士は等しくないこと', () => {
      const a = PaymentStatus.create('active');
      const b = PaymentStatus.create('cancelled');

      expect(a.equals(b)).toBe(false);
    });
  });
});
