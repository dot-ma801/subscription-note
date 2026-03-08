import { RecurringPayment } from '../../domain/entities/RecurringPayment.js';
import type {
  RecurringPaymentListItem,
  RecurringPaymentDetail,
  RecurringPaymentMutationResponse,
} from '@subscription-note/shared';

export interface RecurringPaymentRow {
  id: string;
  name: string;
  price: number;
  billingIntervalType: string;
  billingFrequency: number;
  billingDay: number;
  billingMonth: number | null;
  status: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export class RecurringPaymentMapper {
  static toMutationResponse(entity: RecurringPayment): RecurringPaymentMutationResponse {
    return {
      id: entity.id.value,
      name: entity.name,
      price: entity.price.value,
      billingInterval: {
        intervalType: entity.billingInterval.intervalType,
        frequency: entity.billingInterval.frequency,
        day: entity.billingInterval.day,
        ...(entity.billingInterval.month !== null
          ? { month: entity.billingInterval.month }
          : {}),
      },
      status: entity.status.value,
      memo: entity.memo,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toDetailResponse(
    entity: RecurringPayment,
    nextBillingDate: Date | null,
  ): RecurringPaymentDetail {
    return {
      id: entity.id.value,
      name: entity.name,
      price: entity.price.value,
      billingInterval: {
        intervalType: entity.billingInterval.intervalType,
        frequency: entity.billingInterval.frequency,
        day: entity.billingInterval.day,
        ...(entity.billingInterval.month !== null
          ? { month: entity.billingInterval.month }
          : {}),
      },
      status: entity.status.value,
      memo: entity.memo,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      nextBillingDate: nextBillingDate?.toISOString() ?? null,
    };
  }

  static toListItemResponse(
    entity: RecurringPayment,
    nextBillingDate: Date | null,
  ): RecurringPaymentListItem {
    return {
      id: entity.id.value,
      name: entity.name,
      price: entity.price.value,
      status: entity.status.value,
      nextBillingDate: nextBillingDate?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  static toPersistence(entity: RecurringPayment): RecurringPaymentRow {
    return {
      id: entity.id.value,
      name: entity.name,
      price: entity.price.value,
      billingIntervalType: entity.billingInterval.intervalType,
      billingFrequency: entity.billingInterval.frequency,
      billingDay: entity.billingInterval.day,
      billingMonth: entity.billingInterval.month,
      status: entity.status.value,
      memo: entity.memo,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toDomain(row: RecurringPaymentRow): RecurringPayment {
    return RecurringPayment.reconstruct({
      id: row.id,
      name: row.name,
      price: row.price,
      billingInterval: {
        intervalType: row.billingIntervalType,
        frequency: row.billingFrequency,
        day: row.billingDay,
        month: row.billingMonth,
      },
      status: row.status,
      memo: row.memo ?? '',
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
