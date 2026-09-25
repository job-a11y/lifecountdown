import { motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { type Countdown, type TimeParts, elapsedInfo, formatTarget, getAccent, pad } from "@/lib/countdown-utils";

interface Props {
  cd: Countdown;
  parts: TimeParts;
  now: number;
  onClose: () => void;
}

export function FullscreenView({ cd, parts, now, onClose }: Props) {
  const accent = getAccent(cd.accent);
  const elapsed = cd.show_elapsed_time ? elapsedInfo(cd.created_at, cd.target_at, now) : null;
  return (
    <motion.div
      layoutId={`card-${cd.id}`}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-zinc-950"
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full blur-3xl opacity-70"
          style={{ background: `radial-gradient(closest-side, rgba(${accent.rgb}, 0.55), transparent)` }}
        />
        <div
          className="absolute -bottom-48 -right-24 h-[500px] w-[500px] rounded-full blur-3xl opacity-50"
          style={{ background: `radial-gradient(closest-side, rgba(${accent.rgb}, 0.4), transparent)` }}
        />
      </div>

      <div className="relative flex items-center justify-between px-6 pt-6">
        <div />
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 backdrop-blur-xl hover:bg-white/10 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.h2
          layoutId={`header-${cd.id}`}
          className="text-3xl sm:text-4xl font-semibold text-zinc-100 tracking-tight"
        >
          {cd.title}
        </motion.h2>
        <p className="mt-2 text-sm text-zinc-400">Target: {formatTarget(cd.target_at)}</p>
        {elapsed && (
          <span className="mt-0.5 block text-xs text-zinc-400 tabular-nums">
            Elapsed: {elapsed.elapsedDays} days ({elapsed.progressPercentage}%)
          </span>
        )}

        <motion.div layoutId={`digits-${cd.id}`} className="mt-12 w-full max-w-4xl">
          {parts.reached ? (
            <div className="text-6xl sm:text-8xl font-semibold" style={{ color: accent.hex }}>
              Event Reached!
            </div>
          ) : (
            <div className="flex items-baseline justify-between gap-1 sm:gap-3">
              <Big label="Days" value={parts.days} size={bigSizeClass(parts.days)} days />
              <Big label="Hours" value={parts.hours} size={bigSizeClass(parts.days)} />
              <Big label="Minutes" value={parts.minutes} size={bigSizeClass(parts.days)} />
              <Big label="Seconds" value={parts.seconds} size={bigSizeClass(parts.days)} />
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function bigSizeClass(days: number) {
  const digits = Math.abs(days).toString().length;
  if (digits >= 4) return "text-[9vw] sm:text-[6vw]";
  if (digits === 3) return "text-[11vw] sm:text-[7.5vw]";
  return "text-[15vw] sm:text-[10vw]";
}

function Big({ label, value, size, days }: { label: string; value: number; size: string; days?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className={"leading-none font-bold tabular-nums tracking-tighter text-zinc-50 " + size}>
        {days ? value.toLocaleString() : pad(value)}
      </div>
      <div className="mt-3 text-xs sm:text-sm uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}