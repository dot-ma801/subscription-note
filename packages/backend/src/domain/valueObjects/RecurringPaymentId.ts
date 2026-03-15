import { v7 as uuidv7 } from 'uuid';

export class RecurringPaymentId {
  private constructor(readonly value: string) {}

  static generate(): RecurringPaymentId {
    return new RecurringPaymentId(uuidv7());
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
