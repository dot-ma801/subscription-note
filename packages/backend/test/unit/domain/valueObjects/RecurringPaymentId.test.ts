import { describe, it, expect } from 'vitest';
import { RecurringPaymentId } from '../../../../src/domain/valueObjects/RecurringPaymentId.js';

describe('RecurringPaymentId', () => {
  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const id = RecurringPaymentId.generate();
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique IDs', () => {
      const id1 = RecurringPaymentId.generate();
      const id2 = RecurringPaymentId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct from a valid UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = RecurringPaymentId.reconstruct(uuid);
      expect(id.value).toBe(uuid);
    });

    it('should throw on invalid UUID format', () => {
      expect(() => RecurringPaymentId.reconstruct('invalid')).toThrow(
        'Invalid UUID format',
      );
    });

    it('should throw on empty string', () => {
      expect(() => RecurringPaymentId.reconstruct('')).toThrow(
        'Invalid UUID format',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = RecurringPaymentId.reconstruct(uuid);
      const id2 = RecurringPaymentId.reconstruct(uuid);
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = RecurringPaymentId.generate();
      const id2 = RecurringPaymentId.generate();
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = RecurringPaymentId.reconstruct(uuid);
      expect(id.toString()).toBe(uuid);
    });
  });
});
