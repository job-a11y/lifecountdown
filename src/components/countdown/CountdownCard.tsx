import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Maximize2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type Countdown, type TimeParts, elapsedInfo, formatTarget, getAccent, pad } from "@/lib/countdown-utils";

interface Props {
  cd: Countdown;
  parts: TimeParts;
  now: number;
  view: "grid" | "list";
  pulsing: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDismissPulse: () => void;
}

export function CountdownCard({ cd, parts, now, view, pulsing, onOpen, onEdit, onDelete, onDismissPulse }: Props) {
  const accent = getAccent(cd.accent);
  const elapsed = cd.show_elapsed_time ? elapsedInfo(cd.created_at, cd.target_at, now) : null;

  return (
    <motion.div
      layoutId={`card-${cd.id}`}
      onClick={() => (pulsing ? onDismissPulse() : onOpen())}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={
        "group relative cursor-pointer overflow-hidden rounded-3xl border bg-white/5 backdrop-blur-xl transition-shadow " +
        (view === "list" ? "p-7 sm:p-8" : "p-6") +
        (pulsing ? " animate-pulse" : "")
      }
      style={{
        borderColor: `rgba(${accent.rgb}, 0.35)`,
        boxShadow: `0 0 0 1px rgba(${accent.rgb}, 0.15), 0 20px 60px -30px rgba(${accent.rgb}, 0.5)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-40"
        style={{ background: `radial-gradient(closest-side, rgba(${accent.rgb}, 0.7), transparent)` }}
      />

      <motion.div layoutId={`header-${cd.id}`} className="relative flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-zinc-100">{cd.title}</h3>
          <p className="mt-1 text-xs text-zinc-400">Target: {formatTarget(cd.target_at)}</p>
          {elapsed && (
            <span className="mt-0.5 block text-xs text-zinc-400 tabular-nums">
              Elapsed: {elapsed.elapsedDays} days ({elapsed.progressPercentage}%)
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onOpen}
            className="rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl border-white/10 bg-zinc-900/95 backdrop-blur-xl text-zinc-100">
              <DropdownMenuItem onClick={onEdit} className="gap-2 focus:bg-white/10">
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-300">
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {parts.reached ? (
        <motion.div layoutId={`digits-${cd.id}`} className="relative">
          <div
            className={"font-semibold tracking-tight " + (view === "list" ? "text-5xl sm:text-6xl" : "text-4xl")}
            style={{ color: accent.hex }}
          >
            Event Reached!
          </div>
          {pulsing && (
            <p className="mt-2 text-xs text-zinc-400">Tap card to dismiss glow</p>
          )}
        </motion.div>
      ) : (
        <motion.div layoutId={`digits-${cd.id}`} className="relative">
          {(() => {
            const size = cardSizeClass(parts.days);
            return (
              <div className="flex items-baseline justify-between gap-1 sm:gap-3">
                <Unit label="Days" value={parts.days} size={size} days />
                <Unit label="Hours" value={parts.hours} size={size} />
                <Unit label="Min" value={parts.minutes} size={size} />
                <Unit label="Sec" value={parts.seconds} size={size} />
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}

function cardSizeClass(days: number) {
  const digits = Math.abs(days).toString().length;
  if (digits >= 4) return "text-2xl sm:text-3xl";
  if (digits === 3) return "text-3xl sm:text-4xl";
  return "text-4xl sm:text-5xl";
}

function Unit({ label, value, size, days }: { label: string; value: number; size: string; days?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className={"font-bold tabular-nums tracking-tight text-zinc-50 " + size}>
        {days ? value.toLocaleString() : pad(value)}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}