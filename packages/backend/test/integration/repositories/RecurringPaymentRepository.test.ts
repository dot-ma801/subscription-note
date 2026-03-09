import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryDb } from '../../../src/infrastructure/database/db.js';
import { RecurringPaymentRepository } from '../../../src/infrastructure/repositories/RecurringPaymentRepository.js';
import { RecurringPayment } from '../../../src/domain/entities/RecurringPayment.js';
import { RecurringPaymentId } from '../../../src/domain/valueObjects/RecurringPaymentId.js';
import { validCreateParams, validYearlyCreateParams } from '../../fixtures/recurringPayment.fixtures.js';

describe('RecurringPaymentRepository', () => {
  let sut: RecurringPaymentRepository;

  beforeEach(() => {
    const db = createInMemoryDb();
    sut = new RecurringPaymentRepository(db);
  });

  describe('#save と #findById', () => {
    it('保存したエンティティを ID で取得できること', async () => {
      const entity = RecurringPayment.create(validCreateParams());

      await sut.save(entity);
      const found = await sut.findById(entity.id);

      expect(found).not.toBeNull();
      expect(found!.id.value).toBe(entity.id.value);
      expect(found!.name).toBe('Netflix');
      expect(found!.price.value).toBe(1490);
      expect(found!.billingInterval.intervalType).toBe('month');
      expect(found!.billingInterval.frequency).toBe(1);
      expect(found!.billingInterval.day).toBe(15);
      expect(found!.billingInterval.month).toBeNull();
      expect(found!.status.isActive()).toBe(true);
      expect(found!.memo).toBe('映画・ドラマ見放題');
    });

    it('年次払いのエンティティを保存・取得できること', async () => {
      const entity = RecurringPayment.create(validYearlyCreateParams());

      await sut.save(entity);
      const found = await sut.findById(entity.id);

      expect(found!.billingInterval.intervalType).toBe('year');
      expect(found!.billingInterval.month).toBe(1);
    });
  });

  describe('#findAll', () => {
    it('全エンティティを取得できること', async () => {
      const entity1 = RecurringPayment.create(validCreateParams());
      const entity2 = RecurringPayment.create(validYearlyCreateParams());
      await sut.save(entity1);
      await sut.save(entity2);

      const all = await sut.findAll();

      expect(all).toHaveLength(2);
    });

    it('データが存在しない場合、空配列を返すこと', async () => {
      const all = await sut.findAll();

      expect(all).toEqual([]);
    });
  });

  describe('#update', () => {
    it('既存のエンティティを更新できること', async () => {
      const entity = RecurringPayment.create(validCreateParams());
      await sut.save(entity);

      const updated = entity.update({
        name: 'Netflix Premium',
        price: 1990,
        billingInterval: { intervalType: 'month', frequency: 1, day: 20 },
        status: 'active',
        memo: '4K対応プラン',
      });
      await sut.update(updated);

      const found = await sut.findById(entity.id);
      expect(found!.name).toBe('Netflix Premium');
      expect(found!.price.value).toBe(1990);
      expect(found!.billingInterval.day).toBe(20);
      expect(found!.memo).toBe('4K対応プラン');
    });
  });

  describe('#delete', () => {
    it('エンティティを削除できること', async () => {
      const entity = RecurringPayment.create(validCreateParams());
      await sut.save(entity);

      await sut.delete(entity.id);

      const found = await sut.findById(entity.id);
      expect(found).toBeNull();
    });
  });

  describe('#findById（存在しない ID）', () => {
    it('null を返すこと', async () => {
      const id = RecurringPaymentId.reconstruct('550e8400-e29b-41d4-a716-446655440000');

      const found = await sut.findById(id);

      expect(found).toBeNull();
    });
  });
});
