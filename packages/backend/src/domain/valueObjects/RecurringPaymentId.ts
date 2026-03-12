import { randomUUID } from 'node:crypto';

export class RecurringPaymentId {
  private constructor(readonly value: string) {}

  static generate(): RecurringPaymentId {
    return new RecurringPaymentId(randomUUID());
  }

  static reconstruct(value: string): RecurringPaymentId {
    return new RecurringPaymentId(value);
  }

  equals(other: RecurringPaymentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
