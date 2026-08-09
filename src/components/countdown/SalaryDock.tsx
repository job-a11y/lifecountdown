import { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DEFAULT_SALARY,
  computeSalary,
  formatMoney,
  type SalarySettings,
} from "@/lib/salary-utils";
import { SalarySettingsDialog } from "./SalarySettingsDialog";

export function SalaryDock({ user }: { user: User }) {
  const [settings, setSettings] = useState<SalarySettings>({ user_id: user.id, ...DEFAULT_SALARY });
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("salary_settings").select("*").maybeSingle();
      if (!cancelled && data) {
        setSettings({
          user_id: data.user_id,
          monthly_net: Number(data.monthly_net),
          currency: data.currency,
          work_start: data.work_start.slice(0, 5),
          work_end: data.work_end.slice(0, 5),
          hours_per_week: Number(data.hours_per_week),
          workdays: (data.workdays ?? DEFAULT_SALARY.workdays) as number[],
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const state = useMemo(() => computeSalary(settings, now), [settings, now]);

  async function save(next: Omit<SalarySettings, "user_id">) {
    setSettings({ user_id: user.id, ...next });
    const { error } = await supabase
      .from("salary_settings")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) toast.error(error.message);
    else toast.success("Salary settings saved");
  }

  const amount = formatMoney(state.earned, settings.currency);
  const size = amount.length > 11 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl";

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-white/10 bg-zinc-900/60 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Earned this month</p>
              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium " +
                  (state.working
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-zinc-400")
                }
              >
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " +
                    (state.working ? "animate-pulse bg-emerald-400 shadow-[0_0_8px_2px_rgba(48,209,88,0.7)]" : "bg-zinc-500")
                  }
                />
                {state.working ? "Active (Working)" : "Off the Clock"}
              </span>
            </div>
            <div className={"mt-1 truncate font-bold tabular-nums tracking-tight text-zinc-50 " + size}>
              {amount}
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400/80 transition-[width] duration-1000 ease-linear"
                style={{ width: `${Math.min(100, state.progress * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            aria-label="Salary settings"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-zinc-100"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SalarySettingsDialog open={open} onOpenChange={setOpen} settings={settings} onSave={save} />
    </>
  );
}