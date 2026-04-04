import { describe, it, expect } from 'vitest';
import { Price } from '@/domain/valueObjects/Price';

describe('Price', () => {
  describe('create()', () => {
    describe('有効な価格を渡した場合', () => {
      it('Price インスタンスを返す', () => {
        // Arrange
        const value = 980;

        // Act
        const price = Price.create(value);

        // Assert
        expect(price.value).toBe(value);
      });
    });

    describe('0 以下の価格を渡した場合', () => {
      it('エラーをスローする', () => {
        // Arrange
        const value = 0;

        // Act
        const act = () => Price.create(value);

        // Assert
        expect(act).toThrow('価格は0より大きい有限値である必要があります');
      });
    });

    describe('Infinity を渡した場合', () => {
      it('エラーをスローする', () => {
        // Arrange
        const value = Infinity;

        // Act
        const act = () => Price.create(value);

        // Assert
        expect(act).toThrow('価格は0より大きい有限値である必要があります');
      });
    });
  });

  describe('reconstruct()', () => {
    it('バリデーションなしで Price インスタンスを返す', () => {
      // Arrange
      const value = 1490;

      // Act
      const price = Price.reconstruct(value);

      // Assert
      expect(price.value).toBe(value);
    });
  });

  describe('equals()', () => {
    it('同じ価格のとき true を返す', () => {
      // Arrange
      const a = Price.reconstruct(1490);
      const b = Price.reconstruct(1490);

      // Act & Assert
      expect(a.equals(b)).toBe(true);
    });

    it('異なる価格のとき false を返す', () => {
      // Arrange
      const a = Price.reconstruct(1490);
      const b = Price.reconstruct(980);

      // Act & Assert
      expect(a.equals(b)).toBe(false);
    });
  });
});
