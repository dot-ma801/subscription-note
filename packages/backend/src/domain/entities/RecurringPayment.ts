import { RecurringPaymentId } from '../valueObjects/RecurringPaymentId.js';
import { Price } from '../valueObjects/Price.js';
import { BillingInterval } from '../valueObjects/BillingInterval.js';
import { PaymentStatus } from '../valueObjects/PaymentStatus.js';
import { InvalidValueError, InvalidStatusTransitionError } from '../errors/DomainError.js';

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
      intervalType: string;
      frequency: number;
      day: number;
      month?: number | null;
    };
    memo?: string;
  }): RecurringPayment {
    RecurringPayment.validateName(params.name);
    const memo = params.memo ?? '';
    RecurringPayment.validateMemo(memo);

    const now = new Date();
    return new RecurringPayment(
      RecurringPaymentId.generate(),
      params.name,
      Price.create(params.price),
      BillingInterval.create(params.billingInterval),
      PaymentStatus.create('active'),
      memo,
      now,
      now,
    );
  }

  static reconstruct(params: {
    id: string;
    name: string;
    price: number;
    billingInterval: {
      intervalType: string;
      frequency: number;
      day: number;
      month: number | null;
    };
    status: string;
    memo: string;
    createdAt: Date;
    updatedAt: Date;
  }): RecurringPayment {
    return new RecurringPayment(
      RecurringPaymentId.reconstruct(params.id),
      params.name,
      Price.reconstruct(params.price),
      BillingInterval.reconstruct(params.billingInterval),
      PaymentStatus.reconstruct(params.status),
      params.memo,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: {
    name: string;
    price: number;
    billingInterval: {
      intervalType: string;
      frequency: number;
      day: number;
      month?: number | null;
    };
    status: string;
    memo: string;
  }): RecurringPayment {
    RecurringPayment.validateName(params.name);
    RecurringPayment.validateMemo(params.memo);

    return new RecurringPayment(
      this.id,
      params.name,
      Price.create(params.price),
      BillingInterval.create(params.billingInterval),
      PaymentStatus.create(params.status),
      params.memo,
      this.createdAt,
      new Date(),
    );
  }

  cancel(): RecurringPayment {
    if (this.status.isCancelled()) {
      throw new InvalidStatusTransitionError('cancelled', 'cancelled');
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

  private static validateName(name: string): void {
    if (name.length === 0) {
      throw new InvalidValueError('Name must not be empty');
    }
    if (name.length > 100) {
      throw new InvalidValueError('Name must be 100 characters or less');
    }
  }

  private static validateMemo(memo: string): void {
    if (memo.length > 500) {
      throw new InvalidValueError('Memo must be 500 characters or less');
    }
  }
}
