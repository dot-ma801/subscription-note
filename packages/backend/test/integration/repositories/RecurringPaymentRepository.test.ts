import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryDb } from '../../../src/infrastructure/database/db.js';
import { RecurringPaymentRepository } from '../../../src/infrastructure/repositories/RecurringPaymentRepository.js';
import { RecurringPayment } from '../../../src/domain/entities/RecurringPayment.js';
import { validCreateParams, validYearlyCreateParams } from '../../fixtures/recurringPayment.fixtures.js';

describe('RecurringPaymentRepository', () => {
  let repository: RecurringPaymentRepository;

  beforeEach(() => {
    const db = createInMemoryDb();
    repository = new RecurringPaymentRepository(db);
  });

  describe('save and findById', () => {
    it('should save and retrieve an entity', async () => {
      const entity = RecurringPayment.create(validCreateParams());
      await repository.save(entity);

      const found = await repository.findById(entity.id);

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

    it('should save and retrieve a yearly entity', async () => {
      const entity = RecurringPayment.create(validYearlyCreateParams());
      await repository.save(entity);

      const found = await repository.findById(entity.id);

      expect(found!.billingInterval.intervalType).toBe('year');
      expect(found!.billingInterval.month).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      const entity1 = RecurringPayment.create(validCreateParams());
      const entity2 = RecurringPayment.create(validYearlyCreateParams());
      await repository.save(entity1);
      await repository.save(entity2);

      const all = await repository.findAll();

      expect(all).toHaveLength(2);
    });

    it('should return empty array when no entities', async () => {
      const all = await repository.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update an existing entity', async () => {
      const entity = RecurringPayment.create(validCreateParams());
      await repository.save(entity);

      const updated = entity.update({
        name: 'Netflix Premium',
        price: 1990,
        billingInterval: { intervalType: 'month', frequency: 1, day: 20 },
        status: 'active',
        memo: '4K対応プラン',
      });
      await repository.update(updated);

      const found = await repository.findById(entity.id);
      expect(found!.name).toBe('Netflix Premium');
      expect(found!.price.value).toBe(1990);
      expect(found!.billingInterval.day).toBe(20);
      expect(found!.memo).toBe('4K対応プラン');
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      const entity = RecurringPayment.create(validCreateParams());
      await repository.save(entity);

      await repository.delete(entity.id);

      const found = await repository.findById(entity.id);
      expect(found).toBeNull();
    });
  });

  describe('findById with non-existent id', () => {
    it('should return null', async () => {
      const { RecurringPaymentId } = await import(
        '../../../src/domain/valueObjects/RecurringPaymentId.js'
      );
      const id = RecurringPaymentId.reconstruct('550e8400-e29b-41d4-a716-446655440000');
      const found = await repository.findById(id);
      expect(found).toBeNull();
    });
  });
});
