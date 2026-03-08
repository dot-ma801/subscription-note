import { describe, it, expect } from 'vitest';
import { RecurringPayment } from '../../../../src/domain/entities/RecurringPayment.js';
import {
  validCreateParams,
  validYearlyCreateParams,
  validReconstructParams,
  validUpdateParams,
} from '../../../fixtures/recurringPayment.fixtures.js';

describe('RecurringPayment', () => {
  describe('create', () => {
    it('should create an entity with correct values', () => {
      const params = validCreateParams();
      const entity = RecurringPayment.create(params);

      expect(entity.name).toBe('Netflix');
      expect(entity.price.value).toBe(1490);
      expect(entity.billingInterval.intervalType).toBe('month');
      expect(entity.billingInterval.frequency).toBe(1);
      expect(entity.billingInterval.day).toBe(15);
      expect(entity.status.isActive()).toBe(true);
      expect(entity.memo).toBe('映画・ドラマ見放題');
      expect(entity.id.value).toBeDefined();
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-generate a UUID id', () => {
      const entity = RecurringPayment.create(validCreateParams());
      expect(entity.id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should set status to active', () => {
      const entity = RecurringPayment.create(validCreateParams());
      expect(entity.status.value).toBe('active');
    });

    it('should default memo to empty string', () => {
      const params = { ...validCreateParams(), memo: undefined };
      const entity = RecurringPayment.create(params);
      expect(entity.memo).toBe('');
    });

    it('should create with yearly billing interval', () => {
      const entity = RecurringPayment.create(validYearlyCreateParams());
      expect(entity.billingInterval.intervalType).toBe('year');
      expect(entity.billingInterval.month).toBe(1);
    });

    it('should throw on empty name', () => {
      expect(() =>
        RecurringPayment.create({ ...validCreateParams(), name: '' }),
      ).toThrow('Name must not be empty');
    });

    it('should throw on name over 100 chars', () => {
      expect(() =>
        RecurringPayment.create({ ...validCreateParams(), name: 'a'.repeat(101) }),
      ).toThrow('Name must be 100 characters or less');
    });

    it('should throw on memo over 500 chars', () => {
      expect(() =>
        RecurringPayment.create({ ...validCreateParams(), memo: 'a'.repeat(501) }),
      ).toThrow('Memo must be 500 characters or less');
    });
  });

  describe('reconstruct', () => {
    it('should restore entity from raw values', () => {
      const params = validReconstructParams();
      const entity = RecurringPayment.reconstruct(params);

      expect(entity.id.value).toBe(params.id);
      expect(entity.name).toBe(params.name);
      expect(entity.price.value).toBe(params.price);
      expect(entity.status.value).toBe(params.status);
      expect(entity.createdAt).toEqual(params.createdAt);
      expect(entity.updatedAt).toEqual(params.updatedAt);
    });
  });

  describe('update', () => {
    it('should return a new instance with updated fields', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());
      const updated = original.update(validUpdateParams());

      expect(updated).not.toBe(original);
      expect(updated.name).toBe('Netflix Premium');
      expect(updated.price.value).toBe(1990);
      expect(updated.billingInterval.day).toBe(20);
      expect(updated.memo).toBe('4K対応プラン');
    });

    it('should preserve the original entity (immutability)', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());
      original.update(validUpdateParams());

      expect(original.name).toBe('Netflix');
      expect(original.price.value).toBe(1490);
    });

    it('should update updatedAt', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());
      const updated = original.update(validUpdateParams());

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        original.updatedAt.getTime(),
      );
    });

    it('should preserve createdAt', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());
      const updated = original.update(validUpdateParams());

      expect(updated.createdAt).toEqual(original.createdAt);
    });

    it('should preserve id', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());
      const updated = original.update(validUpdateParams());

      expect(updated.id.equals(original.id)).toBe(true);
    });

    it('should allow status change from active to cancelled', () => {
      const original = RecurringPayment.reconstruct(validReconstructParams());
      const updated = original.update({
        ...validUpdateParams(),
        status: 'cancelled',
      });

      expect(updated.status.isCancelled()).toBe(true);
    });

    it('should allow status change from cancelled to active (reactivation)', () => {
      const cancelled = RecurringPayment.reconstruct({
        ...validReconstructParams(),
        status: 'cancelled',
      });
      const reactivated = cancelled.update({
        ...validUpdateParams(),
        status: 'active',
      });

      expect(reactivated.status.isActive()).toBe(true);
    });
  });

  describe('cancel', () => {
    it('should return a new instance with cancelled status', () => {
      const entity = RecurringPayment.create(validCreateParams());
      const cancelled = entity.cancel();

      expect(cancelled).not.toBe(entity);
      expect(cancelled.status.isCancelled()).toBe(true);
    });

    it('should throw if already cancelled', () => {
      const entity = RecurringPayment.create(validCreateParams());
      const cancelled = entity.cancel();

      expect(() => cancelled.cancel()).toThrow('Invalid status transition');
    });

    it('should preserve other fields', () => {
      const entity = RecurringPayment.create(validCreateParams());
      const cancelled = entity.cancel();

      expect(cancelled.name).toBe(entity.name);
      expect(cancelled.price.equals(entity.price)).toBe(true);
      expect(cancelled.id.equals(entity.id)).toBe(true);
    });
  });
});
