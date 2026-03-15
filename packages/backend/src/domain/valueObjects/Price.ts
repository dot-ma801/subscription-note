export class Price {
  private constructor(readonly value: number) {}

  static create(value: number): Price {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('価格は0より大きい有限値である必要があります');
    }
    return new Price(value);
  }

  static reconstruct(value: number): Price {
    return new Price(value);
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }
}
