import { describe, it, expect } from 'vitest';
import { Price } from '../../../../src/domain/valueObjects/Price.js';

describe('Price', () => {
  describe('#create', () => {
    it('正の数で生成できること', () => {
      const sut = Price.create(1490);

      expect(sut.value).toBe(1490);
    });

    it('小数第2位に丸められること（切り上げ）', () => {
      const sut = Price.create(19.999);

      expect(sut.value).toBe(20);
    });

    it('小数第2位に丸められること（切り捨て）', () => {
      const sut = Price.create(19.994);

      expect(sut.value).toBe(19.99);
    });

    describe('無効な値が渡された場合', () => {
      it('0 で例外を投げること', () => {
        expect(() => Price.create(0)).toThrow('Price must be positive');
      });

      it('負の数で例外を投げること', () => {
        expect(() => Price.create(-100)).toThrow('Price must be positive');
      });

      it('Infinity で例外を投げること', () => {
        expect(() => Price.create(Infinity)).toThrow('Price must be a finite number');
      });

      it('NaN で例外を投げること', () => {
        expect(() => Price.create(NaN)).toThrow('Price must be a finite number');
      });
    });
  });

  describe('#reconstruct', () => {
    it('有効な値から復元できること', () => {
      const sut = Price.reconstruct(1490);

      expect(sut.value).toBe(1490);
    });
  });

  describe('#equals', () => {
    it('同じ値を持つ Price 同士は等しいこと', () => {
      const price1 = Price.create(1490);
      const price2 = Price.create(1490);

      expect(price1.equals(price2)).toBe(true);
    });

    it('異なる値を持つ Price 同士は等しくないこと', () => {
      const price1 = Price.create(1490);
      const price2 = Price.create(1990);

      expect(price1.equals(price2)).toBe(false);
    });
  });
});
