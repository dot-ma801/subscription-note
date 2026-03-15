import { RecurringPaymentId } from '@/domain/valueObjects/RecurringPaymentId';
import { Price } from '@/domain/valueObjects/Price';
import { BillingInterval, type IntervalType } from '@/domain/valueObjects/BillingInterval';
import { PaymentStatus } from '@/domain/valueObjects/PaymentStatus';

export class RecurringPayment {
  private constructor(
    readonly id: RecurringPaymentId,
    readonly name: string,
    readonly price: Price,
    readonly billingInterval: BillingInterval,
    readonly status: PaymentStatus,
    readonly memo: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(params: {
    name: string;
    price: number;
    billingInterval: {
      intervalType: IntervalType;
      frequency: number;
      day: number;
      month: number | null;
    };
    memo: string;
  }): RecurringPayment {
    const now = new Date();
    return new RecurringPayment(
      RecurringPaymentId.generate(),
      params.name,
      Price.create(params.price),
      BillingInterval.create(
        params.billingInterval.intervalType,
        params.billingInterval.frequency,
        params.billingInterval.day,
        params.billingInterval.month,
      ),
      PaymentStatus.create('active'),
      params.memo,
      now,
      now,
    );
  }

  static reconstruct(params: {
    id: string;
    name: string;
    price: number;
    billingIntervalType: IntervalType;
    billingFrequency: number;
    billingDay: number;
    billingMonth: number | null;
    status: 'active' | 'cancelled';
    memo: string;
    createdAt: string;
    updatedAt: string;
  }): RecurringPayment {
    return new RecurringPayment(
      RecurringPaymentId.reconstruct(params.id),
      params.name,
      Price.reconstruct(params.price),
      BillingInterval.reconstruct(
        params.billingIntervalType,
        params.billingFrequency,
        params.billingDay,
        params.billingMonth,
      ),
      PaymentStatus.reconstruct(params.status),
      params.memo,
      new Date(params.createdAt),
      new Date(params.updatedAt),
    );
  }

  cancel(): RecurringPayment {
    if (this.status.isCancelled()) {
      throw new Error('すでに解約済みです');
    }
    return new RecurringPayment(
      this.id,
      this.name,
      this.price,
      this.billingInterval,
      PaymentStatus.create('cancelled'),
      this.memo,
      this.createdAt,
      new Date(),
    );
  }

  update(params: {
    name: string;
    price: number;
    billingInterval: {
      intervalType: IntervalType;
      frequency: number;
      day: number;
      month: number | null;
    };
    status: 'active' | 'cancelled';
    memo: string;
  }): RecurringPayment {
    return new RecurringPayment(
      this.id,
      params.name,
      Price.create(params.price),
      BillingInterval.create(
        params.billingInterval.intervalType,
        params.billingInterval.frequency,
        params.billingInterval.day,
        params.billingInterval.month,
      ),
      PaymentStatus.create(params.status),
      params.memo,
      this.createdAt,
      new Date(),
    );
  }
}
