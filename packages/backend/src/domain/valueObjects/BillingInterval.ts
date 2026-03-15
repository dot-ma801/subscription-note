export type IntervalType = 'month' | 'year' | 'quarter';

export class BillingInterval {
  private constructor(
    readonly intervalType: IntervalType,
    readonly frequency: number,
    readonly day: number,
    readonly month: number | null,
  ) {}

  static create(
    intervalType: IntervalType,
    frequency: number,
    day: number,
    month: number | null,
  ): BillingInterval {
    if (!Number.isInteger(frequency) || frequency < 1) {
      throw new Error('周期は1以上の整数である必要があります');
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new Error('日は1〜31の整数である必要があります');
    }
    if (intervalType === 'year') {
      if (month === null || month === undefined) {
        throw new Error('年払いの場合は month が必須です');
      }
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw new Error('月は1〜12の整数である必要があります');
      }
    } else {
      if (month !== null && month !== undefined) {
        throw new Error('月払い・四半期払いでは month は不要です');
      }
    }
    return new BillingInterval(intervalType, frequency, day, month ?? null);
  }

  static reconstruct(
    intervalType: IntervalType,
    frequency: number,
    day: number,
    month: number | null,
  ): BillingInterval {
    return new BillingInterval(intervalType, frequency, day, month);
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
