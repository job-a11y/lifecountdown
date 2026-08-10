import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DAY_LABELS, type SalarySettings } from "@/lib/salary-utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  settings: SalarySettings;
  onSave: (s: Omit<SalarySettings, "user_id">) => Promise<void> | void;
}

export function SalarySettingsDialog({ open, onOpenChange, settings, onSave }: Props) {
  const [monthly, setMonthly] = useState(String(settings.monthly_net));
  const [currency, setCurrency] = useState(settings.currency);
  const [start, setStart] = useState(settings.work_start);
  const [end, setEnd] = useState(settings.work_end);
  const [hours, setHours] = useState(String(settings.hours_per_week));
  const [days, setDays] = useState<number[]>(settings.workdays);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMonthly(String(settings.monthly_net));
    setCurrency(settings.currency);
    setStart(settings.work_start);
    setEnd(settings.work_end);
    setHours(String(settings.hours_per_week));
    setDays(settings.workdays);
  }, [open, settings]);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function submit() {
    setSaving(true);
    await onSave({
      monthly_net: Number(monthly) || 0,
      currency: currency.trim().toUpperCase() || "EUR",
      work_start: start,
      work_end: end,
      hours_per_week: Number(hours) || 0,
      workdays: days.length ? days : [1, 2, 3, 4, 5],
    });
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-white/10 bg-zinc-900/90 text-zinc-100 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>Salary counter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-zinc-400">Monthly net salary</Label>
              <Input
                inputMode="decimal"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="rounded-xl border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Currency</Label>
              <Input
                value={currency}
                maxLength={3}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-xl border-white/10 bg-white/5 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="min-w-0 space-y-1.5">
              <Label className="text-xs text-zinc-400">Work starts</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl border-white/10 bg-white/5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label className="text-xs text-zinc-400">Work ends</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl border-white/10 bg-white/5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label className="text-xs text-zinc-400">Hours/week</Label>
              <Input
                inputMode="decimal"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="rounded-xl border-white/10 bg-white/5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Active workdays</Label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={
                    "h-10 min-w-0 w-full rounded-full border px-0 text-xs font-medium transition " +
                    (days.includes(i)
                      ? "border-transparent bg-white text-black"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="rounded-full bg-white text-black hover:bg-white/90">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}