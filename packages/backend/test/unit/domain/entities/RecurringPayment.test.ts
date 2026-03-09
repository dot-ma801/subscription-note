import { describe, it, expect } from 'vitest';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import {
  validCreateParams,
  validYearlyCreateParams,
  validReconstructParams,
  validUpdateParams,
} from '../../../fixtures/recurringPayment.fixtures.js';

describe('RecurringPayment', () => {
  describe('.create', () => {
    it('正しい属性値を持つエンティティを生成すること', () => {
      const params = validCreateParams();

      const sut = RecurringPayment.create(params);

      expect(sut.name).toBe('Netflix');
      expect(sut.price.value).toBe(1490);
      expect(sut.billingInterval.intervalType).toBe('month');
      expect(sut.billingInterval.frequency).toBe(1);
      expect(sut.billingInterval.day).toBe(15);
      expect(sut.status.isActive()).toBe(true);
      expect(sut.memo).toBe('映画・ドラマ見放題');
      expect(sut.id.value).toBeDefined();
      expect(sut.createdAt).toBeInstanceOf(Date);
      expect(sut.updatedAt).toBeInstanceOf(Date);
    });

    it('UUID 形式の ID を自動生成すること', () => {
      const sut = RecurringPayment.create(validCreateParams());

      expect(sut.id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('ステータスを active に設定すること', () => {
      const sut = RecurringPayment.create(validCreateParams());

      expect(sut.status.value).toBe('active');
    });

    it('memo が省略された場合、空文字列をデフォルト値とすること', () => {
      const params = { ...validCreateParams(), memo: undefined };

      const sut = RecurringPayment.create(params);

      expect(sut.memo).toBe('');
    });

    it('年次の支払い周期で生成できること', () => {
      const sut = RecurringPayment.create(validYearlyCreateParams());

      expect(sut.billingInterval.intervalType).toBe('year');
      expect(sut.billingInterval.month).toBe(1);
    });

    describe('無効な値が渡された場合', () => {
      it('空の名前で例外を投げること', () => {
        expect(() =>
          RecurringPayment.create({ ...validCreateParams(), name: '' }),
        ).toThrow('Name must not be empty');
      });

      it('100文字超の名前で例外を投げること', () => {
        expect(() =>
          RecurringPayment.create({ ...validCreateParams(), name: 'a'.repeat(101) }),
        ).toThrow('Name must be 100 characters or less');
      });

      it('500文字超のメモで例外を投げること', () => {
        expect(() =>
          RecurringPayment.create({ ...validCreateParams(), memo: 'a'.repeat(501) }),
        ).toThrow('Memo must be 500 characters or less');
      });
    });
  });

  describe('.reconstruct', () => {
    it('生の値からエンティティを復元できること', () => {
      const params = validReconstructParams();

      const sut = RecurringPayment.reconstruct(params);

      expect(sut.id.value).toBe(params.id);
      expect(sut.name).toBe(params.name);
      expect(sut.price.value).toBe(params.price);
      expect(sut.status.value).toBe(params.status);
      expect(sut.createdAt).toEqual(params.createdAt);
      expect(sut.updatedAt).toEqual(params.updatedAt);
    });
  });

  describe('#update', () => {
    it('更新された値を持つ新しいインスタンスを返すこと', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());

      const sut = original.update(validUpdateParams());

      expect(sut).not.toBe(original);
      expect(sut.name).toBe('Netflix Premium');
      expect(sut.price.value).toBe(1990);
      expect(sut.billingInterval.day).toBe(20);
      expect(sut.memo).toBe('4K対応プラン');
    });

    it('元のエンティティを変更しないこと（不変性）', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());

      original.update(validUpdateParams());

      expect(original.name).toBe('Netflix');
      expect(original.price.value).toBe(1490);
    });

    it('updatedAt を更新すること', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());

      const sut = original.update(validUpdateParams());

      expect(sut.updatedAt.getTime()).toBeGreaterThanOrEqual(
        original.updatedAt.getTime(),
      );
    });

    it('createdAt を変更しないこと', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());

      const sut = original.update(validUpdateParams());

      expect(sut.createdAt).toEqual(original.createdAt);
    });

    it('id を変更しないこと', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());

      const sut = original.update(validUpdateParams());

      expect(sut.id.equals(original.id)).toBe(true);
    });

    describe('ステータス遷移', () => {
      it('active から cancelled に変更できること', () => {
        const original = RecurringPayment.reconstruct(validReconstructParams());

        const sut = original.update({
          ...validUpdateParams(),
          status: 'cancelled',
        });

        expect(sut.status.isCancelled()).toBe(true);
      });

      it('cancelled から active に再契約できること', () => {
        const cancelled = RecurringPayment.reconstruct({
          ...validReconstructParams(),
          status: 'cancelled',
        });

        const sut = cancelled.update({
          ...validUpdateParams(),
          status: 'active',
        });

        expect(sut.status.isActive()).toBe(true);
      });
    });
  });

  describe('#cancel', () => {
    it('cancelled ステータスの新しいインスタンスを返すこと', () => {
      const entity = RecurringPayment.create(validCreateParams());

      const sut = entity.cancel();

      expect(sut).not.toBe(entity);
      expect(sut.status.isCancelled()).toBe(true);
    });

    it('既に解約済みの場合は例外を投げること', () => {
      const entity = RecurringPayment.create(validCreateParams());
      const cancelled = entity.cancel();

      expect(() => cancelled.cancel()).toThrow('Invalid status transition');
    });

    it('ステータス以外のフィールドを変更しないこと', () => {
      const entity = RecurringPayment.create(validCreateParams());

      const sut = entity.cancel();

      expect(sut.name).toBe(entity.name);
      expect(sut.price.equals(entity.price)).toBe(true);
      expect(sut.id.equals(entity.id)).toBe(true);
    });
  });
});
