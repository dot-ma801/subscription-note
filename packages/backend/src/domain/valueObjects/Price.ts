import { InvalidValueError } from '../errors/DomainError.js';

export class Price {
  private constructor(readonly value: number) {}

  static create(value: number): Price {
    if (!Number.isFinite(value)) {
      throw new InvalidValueError('Price must be a finite number');
    }
    if (value <= 0) {
      throw new InvalidValueError('Price must be positive');
    }
    const rounded = Math.round(value * 100) / 100;
    return new Price(rounded);
  }

  static reconstruct(value: number): Price {
    return Price.create(value);
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }
}
