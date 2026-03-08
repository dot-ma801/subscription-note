import { describe, it, expect } from 'vitest';
import { Price } from '../../../../src/domain/valueObjects/Price.js';

describe('Price', () => {
  describe('create', () => {
    it('should create with a positive number', () => {
      const price = Price.create(1490);
      expect(price.value).toBe(1490);
    });

    it('should round to 2 decimal places', () => {
      const price = Price.create(19.999);
      expect(price.value).toBe(20);
    });

    it('should round to 2 decimal places (down)', () => {
      const price = Price.create(19.994);
      expect(price.value).toBe(19.99);
    });

    it('should throw on zero', () => {
      expect(() => Price.create(0)).toThrow('Price must be positive');
    });

    it('should throw on negative number', () => {
      expect(() => Price.create(-100)).toThrow('Price must be positive');
    });

    it('should throw on Infinity', () => {
      expect(() => Price.create(Infinity)).toThrow('Price must be a finite number');
    });

    it('should throw on NaN', () => {
      expect(() => Price.create(NaN)).toThrow('Price must be a finite number');
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct from a valid value', () => {
      const price = Price.reconstruct(1490);
      expect(price.value).toBe(1490);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const price1 = Price.create(1490);
      const price2 = Price.create(1490);
      expect(price1.equals(price2)).toBe(true);
    });

    it('should return false for different values', () => {
      const price1 = Price.create(1490);
      const price2 = Price.create(1990);
      expect(price1.equals(price2)).toBe(false);
    });
  });
});
