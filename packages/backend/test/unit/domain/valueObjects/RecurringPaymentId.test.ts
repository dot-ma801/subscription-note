import { describe, it, expect } from 'vitest';
import { RecurringPaymentId } from '../../../../src/domain/valueObjects/RecurringPaymentId.js';

describe('RecurringPaymentId', () => {
  describe('#generate', () => {
    it('有効な UUID を生成すること', () => {
      const sut = RecurringPaymentId.generate();

      expect(sut.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('呼び出すたびに異なる ID を生成すること', () => {
      const id1 = RecurringPaymentId.generate();
      const id2 = RecurringPaymentId.generate();

      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('#reconstruct', () => {
    it('有効な UUID から復元できること', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      const sut = RecurringPaymentId.reconstruct(uuid);

      expect(sut.value).toBe(uuid);
    });

    describe('無効な値が渡された場合', () => {
      it('UUID 形式でない文字列で例外を投げること', () => {
        expect(() => RecurringPaymentId.reconstruct('invalid')).toThrow(
          'Invalid UUID format',
        );
      });

      it('空文字列で例外を投げること', () => {
        expect(() => RecurringPaymentId.reconstruct('')).toThrow(
          'Invalid UUID format',
        );
      });
    });
  });

  describe('#equals', () => {
    it('同じ値を持つ ID 同士は等しいこと', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = RecurringPaymentId.reconstruct(uuid);
      const id2 = RecurringPaymentId.reconstruct(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('異なる値を持つ ID 同士は等しくないこと', () => {
      const id1 = RecurringPaymentId.generate();
      const id2 = RecurringPaymentId.generate();

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('#toString', () => {
    it('UUID 文字列を返すこと', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      const sut = RecurringPaymentId.reconstruct(uuid);

      expect(sut.toString()).toBe(uuid);
    });
  });
});
