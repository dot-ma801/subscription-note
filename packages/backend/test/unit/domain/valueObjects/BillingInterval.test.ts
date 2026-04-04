import { describe, it, expect } from 'vitest';
import { BillingInterval } from '@/domain/valueObjects/BillingInterval';

describe('BillingInterval', () => {
  describe('create()', () => {
    describe('有効な月払い設定を渡した場合', () => {
      it('BillingInterval インスタンスを返す', () => {
        // Arrange & Act
        const interval = BillingInterval.create('month', 1, 15, null);

        // Assert
        expect(interval.intervalType).toBe('month');
        expect(interval.frequency).toBe(1);
        expect(interval.day).toBe(15);
        expect(interval.month).toBeNull();
      });
    });

    describe('有効な年払い設定を渡した場合', () => {
      it('BillingInterval インスタンスを返す', () => {
        // Arrange & Act
        const interval = BillingInterval.create('year', 1, 1, 4);

        // Assert
        expect(interval.intervalType).toBe('year');
        expect(interval.month).toBe(4);
      });
    });

    describe('frequency が 0 以下の場合', () => {
      it('エラーをスローする', () => {
        // Arrange & Act
        const act = () => BillingInterval.create('month', 0, 15, null);

        // Assert
        expect(act).toThrow('周期は1以上の整数である必要があります');
      });
    });

    describe('day が範囲外の場合', () => {
      it('0 のときエラーをスローする', () => {
        // Arrange & Act
        const act = () => BillingInterval.create('month', 1, 0, null);

        // Assert
        expect(act).toThrow('日は1〜31の整数である必要があります');
      });

      it('32 のときエラーをスローする', () => {
        // Arrange & Act
        const act = () => BillingInterval.create('month', 1, 32, null);

        // Assert
        expect(act).toThrow('日は1〜31の整数である必要があります');
      });
    });

    describe('年払いで month が null の場合', () => {
      it('エラーをスローする', () => {
        // Arrange & Act
        const act = () => BillingInterval.create('year', 1, 1, null);

        // Assert
        expect(act).toThrow('年払いの場合は month が必須です');
      });
    });

    describe('年払いで month が範囲外の場合', () => {
      it('13 のときエラーをスローする', () => {
        // Arrange & Act
        const act = () => BillingInterval.create('year', 1, 1, 13);

        // Assert
        expect(act).toThrow('月は1〜12の整数である必要があります');
      });
    });

    describe('月払いで month を渡した場合', () => {
      it('エラーをスローする', () => {
        // Arrange & Act
        const act = () => BillingInterval.create('month', 1, 15, 4);

        // Assert
        expect(act).toThrow('月払い・四半期払いでは month は不要です');
      });
    });
  });

  describe('reconstruct()', () => {
    it('バリデーションなしで BillingInterval インスタンスを返す', () => {
      // Arrange & Act
      const interval = BillingInterval.reconstruct('month', 1, 15, null);

      // Assert
      expect(interval.intervalType).toBe('month');
      expect(interval.frequency).toBe(1);
      expect(interval.day).toBe(15);
      expect(interval.month).toBeNull();
    });
  });

  describe('equals()', () => {
    it('同じ設定のとき true を返す', () => {
      // Arrange
      const a = BillingInterval.reconstruct('month', 1, 15, null);
      const b = BillingInterval.reconstruct('month', 1, 15, null);

      // Act & Assert
      expect(a.equals(b)).toBe(true);
    });

    it('intervalType が異なるとき false を返す', () => {
      // Arrange
      const a = BillingInterval.reconstruct('month', 1, 15, null);
      const b = BillingInterval.reconstruct('quarter', 1, 15, null);

      // Act & Assert
      expect(a.equals(b)).toBe(false);
    });

    it('day が異なるとき false を返す', () => {
      // Arrange
      const a = BillingInterval.reconstruct('month', 1, 15, null);
      const b = BillingInterval.reconstruct('month', 1, 20, null);

      // Act & Assert
      expect(a.equals(b)).toBe(false);
    });
  });
});
