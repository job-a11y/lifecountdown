export interface SalarySettings {
  user_id: string;
  monthly_net: number;
  currency: string;
  work_start: string; // "09:00"
  work_end: string; // "17:00"
  hours_per_week: number;
  workdays: number[]; // 0=Sun .. 6=Sat
}

export const DEFAULT_SALARY: Omit<SalarySettings, "user_id"> = {
  monthly_net: 5000,
  currency: "EUR",
  work_start: "09:00",
  work_end: "17:00",
  hours_per_week: 36,
  workdays: [1, 2, 3, 4, 5],
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function countWorkdaysInRange(start: Date, end: Date, workdays: number[]) {
  let n = 0;
  for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    if (workdays.includes(d.getDay())) n++;
  }
  return n;
}

export interface SalaryState {
  earned: number;
  monthTotal: number;
  working: boolean;
  progress: number;
  perSecond: number;
  earned247: number;
  perSecond247: number;
  progress247: number;
}

export function computeSalary(s: SalarySettings, nowMs: number): SalaryState {
  const now = new Date(nowMs);
  const periodStart = now.getDate() >= 25
    ? new Date(now.getFullYear(), now.getMonth(), 25, 0, 0, 0, 0)
    : new Date(now.getFullYear(), now.getMonth() - 1, 25, 0, 0, 0, 0);
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 25, 0, 0, 0, 0);
  const workdays = s.workdays.length ? s.workdays : DEFAULT_SALARY.workdays;

  const startMin = toMinutes(s.work_start);
  const endMin = Math.max(toMinutes(s.work_end), startMin);
  const windowSec = (endMin - startMin) * 60;
  const weeklySec = Math.max(0, s.hours_per_week) * 3600;
  const perDayFromWeek = weeklySec / workdays.length;
  const dailySec = Math.min(windowSec, perDayFromWeek) || 0;

  const workdayCount = countWorkdaysInRange(periodStart, periodEnd, workdays);
  const monthSec = dailySec * workdayCount;
  const perSecond = monthSec > 0 ? s.monthly_net / monthSec : 0;

  // seconds worked so far this salary period
  let workedSec = 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const d = new Date(periodStart); d < today; d.setDate(d.getDate() + 1)) {
    if (workdays.includes(d.getDay())) workedSec += dailySec;
  }
  let working = false;
  if (workdays.includes(now.getDay())) {
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
    const startSec = startMin * 60;
    const elapsed = Math.min(Math.max(nowSec - startSec, 0), dailySec);
    workedSec += elapsed;
    working = elapsed > 0 && elapsed < dailySec;
  }

  const earned = Math.min(s.monthly_net, workedSec * perSecond);

  // Continuous 24/7 accrual across all calendar seconds of the salary period
  const periodCalendarSec = (periodEnd.getTime() - periodStart.getTime()) / 1000;
  const perSecond247 = periodCalendarSec > 0 ? s.monthly_net / periodCalendarSec : 0;
  const elapsedSec = (nowMs - periodStart.getTime()) / 1000;
  const earned247 = Math.min(s.monthly_net, Math.max(0, elapsedSec) * perSecond247);

  return {
    earned,
    monthTotal: s.monthly_net,
    working,
    progress: s.monthly_net > 0 ? earned / s.monthly_net : 0,
    perSecond,
    earned247,
    perSecond247,
    progress247: s.monthly_net > 0 ? earned247 / s.monthly_net : 0,
  };
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}