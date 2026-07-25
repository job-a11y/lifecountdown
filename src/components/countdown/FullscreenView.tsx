import { motion } from "framer-motion";
import { X } from "lucide-react";
import { type Countdown, type TimeParts, formatTarget, getAccent, pad } from "@/lib/countdown-utils";

interface Props {
  cd: Countdown;
  parts: TimeParts;
  onClose: () => void;
}

export function FullscreenView({ cd, parts, onClose }: Props) {
  const accent = getAccent(cd.accent);
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

        <motion.div layoutId={`digits-${cd.id}`} className="mt-12 w-full max-w-4xl">
          {parts.reached ? (
            <div className="text-6xl sm:text-8xl font-semibold" style={{ color: accent.hex }}>
              Event Reached!
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:gap-8">
              <Big label="Days" value={parts.days} />
              <Big label="Hours" value={parts.hours} />
              <Big label="Minutes" value={parts.minutes} />
              <Big label="Seconds" value={parts.seconds} />
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function Big({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[15vw] sm:text-[10vw] leading-none font-semibold tabular-nums tracking-tighter text-zinc-50">
        {pad(value)}
      </div>
      <div className="mt-3 text-xs sm:text-sm uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}