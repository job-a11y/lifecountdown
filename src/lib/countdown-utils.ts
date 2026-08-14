export type AccentKey = "blue" | "purple" | "pink" | "orange" | "emerald";

export const ACCENTS: Record<AccentKey, { name: string; hex: string; rgb: string }> = {
  blue: { name: "Blue", hex: "#0A84FF", rgb: "10,132,255" },
  purple: { name: "Purple", hex: "#BF5AF2", rgb: "191,90,242" },
  pink: { name: "Pink", hex: "#FF375F", rgb: "255,55,95" },
  orange: { name: "Orange", hex: "#FF9F0A", rgb: "255,159,10" },
  emerald: { name: "Emerald", hex: "#30D158", rgb: "48,209,88" },
};

export function getAccent(key: string) {
  return ACCENTS[(key as AccentKey) in ACCENTS ? (key as AccentKey) : "blue"];
}

export interface Countdown {
  id: string;
  user_id: string;
  title: string;
  target_at: string;
  accent: string;
  show_elapsed_time?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  reached: boolean;
}

export function diffParts(targetIso: string, nowMs: number): TimeParts {
  const target = new Date(targetIso).getTime();
  const totalMs = target - nowMs;
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, reached: true };
  }
  const s = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalMs,
    reached: false,
  };
}

export function pad(n: number, len = 2) {
  return n.toString().padStart(len, "0");
}

export interface ElapsedInfo {
  elapsedDays: number;
  progressPercentage: number;
}

export function elapsedInfo(createdAtIso: string, targetIso: string, nowMs: number): ElapsedInfo {
  const created = new Date(createdAtIso).getTime();
  const target = new Date(targetIso).getTime();
  const total = target - created;
  const elapsed = Math.max(0, nowMs - created);
  const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))) : 100;
  return { elapsedDays: Math.floor(elapsed / 86400000), progressPercentage: pct };
}

export function formatTarget(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert an ISO datetime into a value suitable for <input type="datetime-local"> */
export function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

let audioCtx: AudioContext | null = null;
export function playChime() {
  try {
    if (typeof window === "undefined") return;
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtx!;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const notes = [880, 1108.73, 1318.51];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + i * 0.18);
      g.gain.linearRampToValueAtTime(0.18, now + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.9);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.18);
      o.stop(now + i * 0.18 + 1);
    });
  } catch {}
}

export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return await Notification.requestPermission();
}

export function fireNotification(title: string, body: string) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.showNotification(title, { body, icon: "/icon-512.png", badge: "/icon-512.png", tag: title });
        } else {
          new Notification(title, { body, icon: "/icon-512.png" });
        }
      });
    } else {
      new Notification(title, { body, icon: "/icon-512.png" });
    }
  } catch {}
}