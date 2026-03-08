import { describe, it, expect } from 'vitest';
import { PaymentStatus } from '../../../../src/domain/valueObjects/PaymentStatus.js';

describe('PaymentStatus', () => {
  describe('create', () => {
    it('should create with active', () => {
      const status = PaymentStatus.create('active');
      expect(status.value).toBe('active');
    });

    it('should create with cancelled', () => {
      const status = PaymentStatus.create('cancelled');
      expect(status.value).toBe('cancelled');
    });

    it('should throw on invalid status', () => {
      expect(() => PaymentStatus.create('pending')).toThrow('Invalid payment status');
    });
  });

  describe('isActive', () => {
    it('should return true for active', () => {
      expect(PaymentStatus.create('active').isActive()).toBe(true);
    });

    it('should return false for cancelled', () => {
      expect(PaymentStatus.create('cancelled').isActive()).toBe(false);
    });
  });

  describe('isCancelled', () => {
    it('should return true for cancelled', () => {
      expect(PaymentStatus.create('cancelled').isCancelled()).toBe(true);
    });

    it('should return false for active', () => {
      expect(PaymentStatus.create('active').isCancelled()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const a = PaymentStatus.create('active');
      const b = PaymentStatus.create('active');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = PaymentStatus.create('active');
      const b = PaymentStatus.create('cancelled');
      expect(a.equals(b)).toBe(false);
    });
  });
});
