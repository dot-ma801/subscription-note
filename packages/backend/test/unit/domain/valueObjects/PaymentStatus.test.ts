import { describe, it, expect } from 'vitest';
import { PaymentStatus } from '@/domain/valueObjects/PaymentStatus';

describe('PaymentStatus', () => {
  describe('create()', () => {
    describe('有効なステータス値を渡した場合', () => {
      it('"active" で PaymentStatus インスタンスを返す', () => {
        // Arrange & Act
        const status = PaymentStatus.create('active');

        // Assert
        expect(status.value).toBe('active');
      });

      it('"cancelled" で PaymentStatus インスタンスを返す', () => {
        // Arrange & Act
        const status = PaymentStatus.create('cancelled');

        // Assert
        expect(status.value).toBe('cancelled');
      });
    });

    describe('無効なステータス値を渡した場合', () => {
      it('エラーをスローする', () => {
        // Arrange
        const invalid = 'unknown';

        // Act
        const act = () => PaymentStatus.create(invalid);

        // Assert
        expect(act).toThrow('無効なステータス値です: unknown');
      });
    });
  });

  describe('reconstruct()', () => {
    it('バリデーションなしで PaymentStatus インスタンスを返す', () => {
      // Arrange & Act
      const status = PaymentStatus.reconstruct('cancelled');

      // Assert
      expect(status.value).toBe('cancelled');
    });
  });

  describe('isActive()', () => {
    it('active のとき true を返す', () => {
      // Arrange
      const status = PaymentStatus.create('active');

      // Act & Assert
      expect(status.isActive()).toBe(true);
    });

    it('cancelled のとき false を返す', () => {
      // Arrange
      const status = PaymentStatus.create('cancelled');

      // Act & Assert
      expect(status.isActive()).toBe(false);
    });
  });

  describe('isCancelled()', () => {
    it('cancelled のとき true を返す', () => {
      // Arrange
      const status = PaymentStatus.create('cancelled');

      // Act & Assert
      expect(status.isCancelled()).toBe(true);
    });

    it('active のとき false を返す', () => {
      // Arrange
      const status = PaymentStatus.create('active');

      // Act & Assert
      expect(status.isCancelled()).toBe(false);
    });
  });

  describe('equals()', () => {
    it('同じステータスのとき true を返す', () => {
      // Arrange
      const a = PaymentStatus.create('active');
      const b = PaymentStatus.create('active');

      // Act & Assert
      expect(a.equals(b)).toBe(true);
    });

    it('異なるステータスのとき false を返す', () => {
      // Arrange
      const a = PaymentStatus.create('active');
      const b = PaymentStatus.create('cancelled');

      // Act & Assert
      expect(a.equals(b)).toBe(false);
    });
  });
});
