import { InvalidValueError } from '../errors/DomainError.js';

const VALID_INTERVAL_TYPES = ['month', 'year', 'quarter'] as const;
type IntervalType = typeof VALID_INTERVAL_TYPES[number];

export class BillingInterval {
  private constructor(
    readonly intervalType: IntervalType,
    readonly frequency: number,
    readonly day: number,
    readonly month: number | null,
  ) {}

  static create(params: {
    intervalType: string;
    frequency: number;
    day: number;
    month?: number | null;
  }): BillingInterval {
    return BillingInterval.validate(params);
  }

  static reconstruct(params: {
    intervalType: string;
    frequency: number;
    day: number;
    month: number | null;
  }): BillingInterval {
    return BillingInterval.validate(params);
  }

  private static validate(params: {
    intervalType: string;
    frequency: number;
    day: number;
    month?: number | null;
  }): BillingInterval {
    if (!VALID_INTERVAL_TYPES.includes(params.intervalType as IntervalType)) {
      throw new InvalidValueError(`Invalid interval type: ${params.intervalType}`);
    }

    if (!Number.isInteger(params.frequency) || params.frequency < 1) {
      throw new InvalidValueError('Frequency must be a positive integer');
    }

    if (!Number.isInteger(params.day) || params.day < 1 || params.day > 31) {
      throw new InvalidValueError('Day must be an integer between 1 and 31');
    }

    const intervalType = params.intervalType as IntervalType;
    const month = params.month ?? null;

    if (intervalType === 'year') {
      if (month === null) {
        throw new InvalidValueError('Month is required for yearly billing interval');
      }
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw new InvalidValueError('Month must be an integer between 1 and 12');
      }
    } else {
      if (month !== null) {
        throw new InvalidValueError('Month must not be specified for non-yearly billing interval');
      }
    }

    return new BillingInterval(intervalType, params.frequency, params.day, month);
  }

  equals(other: BillingInterval): boolean {
    return (
      this.intervalType === other.intervalType &&
      this.frequency === other.frequency &&
      this.day === other.day &&
      this.month === other.month
    );
  }
}
