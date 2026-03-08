import { InvalidValueError } from '../errors/DomainError.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class RecurringPaymentId {
  private constructor(readonly value: string) {}

  static generate(): RecurringPaymentId {
    return new RecurringPaymentId(crypto.randomUUID());
  }

  static reconstruct(value: string): RecurringPaymentId {
    if (!UUID_REGEX.test(value)) {
      throw new InvalidValueError(`Invalid UUID format: ${value}`);
    }
    return new RecurringPaymentId(value);
  }

  equals(other: RecurringPaymentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
