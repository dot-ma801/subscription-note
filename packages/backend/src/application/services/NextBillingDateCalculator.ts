import type { BillingInterval } from '../../domain/valueObjects/BillingInterval.js';
import type { PaymentStatus } from '../../domain/valueObjects/PaymentStatus.js';

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampDay(year: number, month: number, day: number): number {
  const lastDay = getLastDayOfMonth(year, month);
  return Math.min(day, lastDay);
}

export function calculateNextBillingDate(
  billingInterval: BillingInterval,
  status: PaymentStatus,
  referenceDate: Date = new Date(),
): Date | null {
  if (status.isCancelled()) return null;

  const { intervalType, frequency, day, month } = billingInterval;
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1; // 1-indexed
  const refDay = referenceDate.getDate();

  if (intervalType === 'year') {
    const billingMonth = month!;
    // Try this year first
    const clampedDay = clampDay(refYear, billingMonth, day);
    const candidateThisYear = new Date(refYear, billingMonth - 1, clampedDay);

    if (candidateThisYear >= referenceDate) {
      return candidateThisYear;
    }

    // Next occurrence based on frequency
    const nextYear = refYear + frequency;
    const nextClampedDay = clampDay(nextYear, billingMonth, day);
    return new Date(nextYear, billingMonth - 1, nextClampedDay);
  }

  if (intervalType === 'quarter') {
    // Quarterly: find the next quarter boundary month (1,4,7,10) then apply day
    const quarterMonths = [1, 4, 7, 10];

    for (const qMonth of quarterMonths) {
      const clampedD = clampDay(refYear, qMonth, day);
      const candidate = new Date(refYear, qMonth - 1, clampedD);
      if (candidate >= referenceDate) {
        return candidate;
      }
    }

    // Next year's first quarter
    const nextClampedDay = clampDay(refYear + 1, 1, day);
    return new Date(refYear + 1, 0, nextClampedDay);
  }

  // Monthly
  // Try current month
  const clampedDayThisMonth = clampDay(refYear, refMonth, day);
  const candidateThisMonth = new Date(refYear, refMonth - 1, clampedDayThisMonth);

  if (candidateThisMonth >= referenceDate) {
    return candidateThisMonth;
  }

  // Next billing month based on frequency
  let nextMonth = refMonth + frequency;
  let nextYear = refYear;
  while (nextMonth > 12) {
    nextMonth -= 12;
    nextYear += 1;
  }
  const nextClampedDay = clampDay(nextYear, nextMonth, day);
  return new Date(nextYear, nextMonth - 1, nextClampedDay);
}
