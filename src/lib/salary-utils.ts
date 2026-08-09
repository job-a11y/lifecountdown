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

function countWorkdaysInMonth(year: number, month: number, workdays: number[]) {
  const days = new Date(year, month + 1, 0).getDate();
  let n = 0;
  for (let d = 1; d <= days; d++) {
    if (workdays.includes(new Date(year, month, d).getDay())) n++;
  }
  return n;
}

export interface SalaryState {
  earned: number;
  monthTotal: number;
  working: boolean;
  progress: number;
  perSecond: number;
}

export function computeSalary(s: SalarySettings, nowMs: number): SalaryState {
  const now = new Date(nowMs);
  const year = now.getFullYear();
  const month = now.getMonth();
  const workdays = s.workdays.length ? s.workdays : DEFAULT_SALARY.workdays;

  const startMin = toMinutes(s.work_start);
  const endMin = Math.max(toMinutes(s.work_end), startMin);
  const windowSec = (endMin - startMin) * 60;
  const weeklySec = Math.max(0, s.hours_per_week) * 3600;
  const perDayFromWeek = weeklySec / workdays.length;
  const dailySec = Math.min(windowSec, perDayFromWeek) || 0;

  const workdayCount = countWorkdaysInMonth(year, month, workdays);
  const monthSec = dailySec * workdayCount;
  const perSecond = monthSec > 0 ? s.monthly_net / monthSec : 0;

  // seconds worked so far this month
  let workedSec = 0;
  for (let d = 1; d < now.getDate(); d++) {
    if (workdays.includes(new Date(year, month, d).getDay())) workedSec += dailySec;
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
  return {
    earned,
    monthTotal: s.monthly_net,
    working,
    progress: s.monthly_net > 0 ? earned / s.monthly_net : 0,
    perSecond,
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