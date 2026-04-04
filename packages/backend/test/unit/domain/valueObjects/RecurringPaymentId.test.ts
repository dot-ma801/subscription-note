import { describe, it, expect } from 'vitest';
import { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId';

describe('RecurringPaymentId', () => {
  describe('generate()', () => {
    it('UUID 形式の ID を生成する', () => {
      // Arrange & Act
      const id = RecurringPaymentId.generate();

      // Assert
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('呼び出すたびに異なる ID を生成する', () => {
      // Arrange & Act
      const a = RecurringPaymentId.generate();
      const b = RecurringPaymentId.generate();

      // Assert
      expect(a.value).not.toBe(b.value);
    });
  });

  describe('reconstruct()', () => {
    it('渡した文字列をそのまま保持する', () => {
      // Arrange
      const value = '01900000-0000-7000-8000-000000000001';

      // Act
      const id = RecurringPaymentId.reconstruct(value);

      // Assert
      expect(id.value).toBe(value);
    });
  });

  describe('equals()', () => {
    it('同じ値のとき true を返す', () => {
      // Arrange
      const a = RecurringPaymentId.reconstruct('01900000-0000-7000-8000-000000000001');
      const b = RecurringPaymentId.reconstruct('01900000-0000-7000-8000-000000000001');

      // Act & Assert
      expect(a.equals(b)).toBe(true);
    });

    it('異なる値のとき false を返す', () => {
      // Arrange
      const a = RecurringPaymentId.reconstruct('01900000-0000-7000-8000-000000000001');
      const b = RecurringPaymentId.reconstruct('01900000-0000-7000-8000-000000000002');

      // Act & Assert
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('value と同じ文字列を返す', () => {
      // Arrange
      const value = '01900000-0000-7000-8000-000000000001';
      const id = RecurringPaymentId.reconstruct(value);

      // Act & Assert
      expect(id.toString()).toBe(value);
    });
  });
});
