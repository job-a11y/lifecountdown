import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ACCENTS, type AccentKey, type Countdown, toDatetimeLocal } from "@/lib/countdown-utils";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Countdown | null;
  onSubmit: (data: { title: string; target_at: string; accent: AccentKey; show_elapsed_time: boolean }) => Promise<void> | void;
}

export function AddEditDialog({ open, onOpenChange, editing, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [targetLocal, setTargetLocal] = useState("");
  const [accent, setAccent] = useState<AccentKey>("blue");
  const [showElapsed, setShowElapsed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setTargetLocal(toDatetimeLocal(editing.target_at));
        setAccent((editing.accent as AccentKey) in ACCENTS ? (editing.accent as AccentKey) : "blue");
        setShowElapsed(Boolean(editing.show_elapsed_time));
      } else {
        setTitle("");
        const d = new Date(Date.now() + 7 * 86400_000);
        d.setSeconds(0, 0);
        setTargetLocal(toDatetimeLocal(d.toISOString()));
        setAccent("blue");
        setShowElapsed(false);
      }
    }
  }, [open, editing]);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !targetLocal) return;
    setSaving(true);
    try {
      const iso = new Date(targetLocal).toISOString();
      await onSubmit({ title: title.trim(), target_at: iso, accent, show_elapsed_time: showElapsed });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-white/10 bg-zinc-900/95 backdrop-blur-2xl text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{editing ? "Edit countdown" : "New countdown"}</DialogTitle>
          <DialogDescription className="text-zinc-400">Set a title, target date and an accent color.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handle} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cd-title" className="text-xs uppercase tracking-wider text-zinc-400">Title</Label>
            <Input id="cd-title" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Trip to Tokyo"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cd-target" className="text-xs uppercase tracking-wider text-zinc-400">Target date &amp; time</Label>
            <Input id="cd-target" type="datetime-local" value={targetLocal} onChange={(e) => setTargetLocal(e.target.value)} required
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-zinc-100 [color-scheme:dark]" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-zinc-400">Accent</Label>
            <div className="flex gap-3">
              {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setAccent(key)}
                  aria-label={ACCENTS[key].name}
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{
                    background: ACCENTS[key].hex,
                    boxShadow: accent === key ? `0 0 0 2px #09090b, 0 0 0 4px ${ACCENTS[key].hex}` : undefined,
                  }}
                >
                  {accent === key && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="cd-elapsed" className="text-xs uppercase tracking-wider text-zinc-400">
              Show elapsed time
            </Label>
            <Switch id="cd-elapsed" checked={showElapsed} onCheckedChange={setShowElapsed} />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl text-zinc-300 hover:bg-white/5">Cancel</Button>
            <Button type="submit" disabled={saving}
              className="rounded-2xl bg-white text-black hover:bg-white/90 font-medium min-w-[100px]">
              {saving ? "Saving…" : editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}