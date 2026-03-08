export function validCreateParams() {
  return {
    name: 'Netflix',
    price: 1490,
    billingInterval: {
      intervalType: 'month' as const,
      frequency: 1,
      day: 15,
    },
    memo: '映画・ドラマ見放題',
  };
}

export function validYearlyCreateParams() {
  return {
    name: 'Adobe Creative Cloud',
    price: 98000,
    billingInterval: {
      intervalType: 'year' as const,
      frequency: 1,
      day: 15,
      month: 1,
    },
    memo: 'Photoshop, Illustrator',
  };
}

export function validQuarterlyCreateParams() {
  return {
    name: 'Quarterly Service',
    price: 3000,
    billingInterval: {
      intervalType: 'quarter' as const,
      frequency: 1,
      day: 1,
    },
    memo: '',
  };
}

export function validReconstructParams() {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Netflix',
    price: 1490,
    billingInterval: {
      intervalType: 'month' as const,
      frequency: 1,
      day: 15,
      month: null,
    },
    status: 'active' as const,
    memo: '映画・ドラマ見放題',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  };
}

export function validUpdateParams() {
  return {
    name: 'Netflix Premium',
    price: 1990,
    billingInterval: {
      intervalType: 'month' as const,
      frequency: 1,
      day: 20,
    },
    status: 'active' as const,
    memo: '4K対応プラン',
  };
}
