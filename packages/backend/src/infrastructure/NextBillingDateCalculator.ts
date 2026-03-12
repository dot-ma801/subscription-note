import type { RecurringPayment } from '../domain/entities/RecurringPayment.js';

/**
 * 次回の支払い日を計算する
 * - status が cancelled の場合は null を返す
 * - month/quarter/year タイプに応じて次回の支払日を計算
 */
export function calculateNextBillingDate(entity: RecurringPayment, today: Date): Date | null {
  if (entity.status.isCancelled()) {
    return null;
  }

  const { billingInterval } = entity;
  const { intervalType, frequency, day, month } = billingInterval;

  if (intervalType === 'year') {
    return calcNextYearly(today, frequency, month!, day);
  }

  const monthsPerInterval = intervalType === 'quarter' ? frequency * 3 : frequency;
  return calcNextMonthly(today, monthsPerInterval, day);
}

function calcNextMonthly(today: Date, monthsPerInterval: number, day: number): Date {
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  // 今月の支払い候補日
  const candidate = new Date(todayYear, todayMonth, day);

  if (todayDay <= day) {
    // 今月の支払い日がまだ来ていない（もしくは今日）
    return candidate;
  }

  // 次の周期
  const next = new Date(todayYear, todayMonth + monthsPerInterval, day);
  return next;
}

function calcNextYearly(today: Date, frequency: number, month: number, day: number): Date {
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // 1-indexed
  const todayDay = today.getDate();

  // 今年の支払い候補日
  const candidate = new Date(todayYear, month - 1, day);

  const isPastThisYear =
    todayMonth > month || (todayMonth === month && todayDay > day);

  if (!isPastThisYear) {
    return candidate;
  }

  // 次の周期（frequency 年後）
  const next = new Date(todayYear + frequency, month - 1, day);
  return next;
}
