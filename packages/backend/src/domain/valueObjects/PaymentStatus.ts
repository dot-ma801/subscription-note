export type StatusValue = 'active' | 'cancelled';

export class PaymentStatus {
  private constructor(readonly value: StatusValue) {}

  static create(value: string): PaymentStatus {
    if (value !== 'active' && value !== 'cancelled') {
      throw new Error(`無効なステータス値です: ${value}`);
    }
    return new PaymentStatus(value);
  }

  static reconstruct(value: StatusValue): PaymentStatus {
    return new PaymentStatus(value);
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
