import { InvalidValueError } from '../errors/DomainError.js';

const VALID_STATUSES = ['active', 'cancelled'] as const;
type Status = typeof VALID_STATUSES[number];

export class PaymentStatus {
  private constructor(readonly value: Status) {}

  static create(value: string): PaymentStatus {
    if (!VALID_STATUSES.includes(value as Status)) {
      throw new InvalidValueError(`Invalid payment status: ${value}`);
    }
    return new PaymentStatus(value as Status);
  }

  static reconstruct(value: string): PaymentStatus {
    return PaymentStatus.create(value);
  }

  isActive(): boolean {
    return this.value === 'active';
  }

  isCancelled(): boolean {
    return this.value === 'cancelled';
  }

  equals(other: PaymentStatus): boolean {
    return this.value === other.value;
  }
}
