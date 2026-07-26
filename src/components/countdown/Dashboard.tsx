import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Grid2x2, List, LogOut, Bell, BellOff, Loader2, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  type AccentKey,
  type Countdown,
  diffParts,
  fireNotification,
  playChime,
  requestNotifPermission,
} from "@/lib/countdown-utils";
import { CountdownCard } from "./CountdownCard";
import { AddEditDialog } from "./AddEditDialog";
import { FullscreenView } from "./FullscreenView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Dashboard({ user }: { user: User }) {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">(() =>
    (typeof localStorage !== "undefined" && (localStorage.getItem("cd_view") as "grid" | "list")) || "grid",
  );
  const [now, setNow] = useState(Date.now());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Countdown | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pulsing, setPulsing] = useState<Set<string>>(new Set());
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied",
  );

  const firedRef = useRef<Set<string>>(new Set());

  // View persistence
  useEffect(() => {
    localStorage.setItem("cd_view", view);
  }, [view]);

  // Ticker
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load + realtime
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("countdowns")
        .select("*")
        .order("target_at", { ascending: true });
      if (!cancelled) {
        if (error) toast.error(error.message);
        else setCountdowns((data as Countdown[]) ?? []);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("countdowns_rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "countdowns", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setCountdowns((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Countdown;
              if (prev.some((c) => c.id === row.id)) return prev;
              return [...prev, row].sort(
                (a, b) => new Date(a.target_at).getTime() - new Date(b.target_at).getTime(),
              );
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Countdown;
              return prev
                .map((c) => (c.id === row.id ? row : c))
                .sort((a, b) => new Date(a.target_at).getTime() - new Date(b.target_at).getTime());
            }
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id: string }).id;
              return prev.filter((c) => c.id !== oldId);
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  // Detect "zero" moment
  useEffect(() => {
    for (const cd of countdowns) {
      const parts = diffParts(cd.target_at, now);
      if (parts.reached && !firedRef.current.has(cd.id)) {
        firedRef.current.add(cd.id);
        // Only fire if we've been mounted past the target (not for old ones on load)
        const target = new Date(cd.target_at).getTime();
        if (Math.abs(now - target) < 5 * 60 * 1000) {
          playChime();
          fireNotification("CountDown", `${cd.title} — the moment is here!`);
          setPulsing((prev) => {
            const next = new Set(prev);
            next.add(cd.id);
            return next;
          });
        }
      }
    }
  }, [countdowns, now]);

  const focused = useMemo(
    () => countdowns.find((c) => c.id === focusedId) ?? null,
    [countdowns, focusedId],
  );

  async function handleSubmit(data: { title: string; target_at: string; accent: AccentKey }) {
    if (editing) {
      const { error } = await supabase.from("countdowns").update(data).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("countdowns").insert({ ...data, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Countdown added");
    }
    setEditing(null);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("countdowns").delete().eq("id", id);
    if (error) toast.error(error.message);
  }

  async function toggleNotif() {
    const p = await requestNotifPermission();
    setNotifPerm(p);
    if (p === "granted") toast.success("Notifications enabled");
    else if (p === "denied") toast.error("Notifications blocked in browser settings");
  }

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-30"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(10,132,255,0.25), transparent)" }} />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
        <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight sm:text-4xl">
          Countdowns
        </h1>

        <div className="flex shrink-0 items-center gap-1.5">
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
            <TabsList className="h-10 rounded-full border border-white/10 bg-white/5 p-1">
              <TabsTrigger value="grid" className="h-8 w-8 rounded-full p-0 data-[state=active]:bg-white data-[state=active]:text-black">
                <Grid2x2 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="h-8 w-8 rounded-full p-0 data-[state=active]:bg-white data-[state=active]:text-black">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={toggleNotif}
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            title={notifPerm === "granted" ? "Notifications on" : "Enable notifications"}
          >
            {notifPerm === "granted" ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>

          <Button
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            aria-label="Add countdown"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-0 font-medium text-black hover:bg-white/90 sm:w-auto sm:px-4"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">New</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main
        className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8"
        style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-32 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : countdowns.length === 0 ? (
          <EmptyState onCreate={() => { setEditing(null); setDialogOpen(true); }} />
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5" : "flex flex-col gap-5"}>
            {countdowns.map((cd) => (
              <CountdownCard
                key={cd.id}
                cd={cd}
                parts={diffParts(cd.target_at, now)}
                view={view}
                pulsing={pulsing.has(cd.id)}
                onOpen={() => setFocusedId(cd.id)}
                onEdit={() => { setEditing(cd); setDialogOpen(true); }}
                onDelete={() => handleDelete(cd.id)}
                onDismissPulse={() =>
                  setPulsing((prev) => {
                    const next = new Set(prev);
                    next.delete(cd.id);
                    return next;
                  })
                }
              />
            ))}
          </div>
        )}
      </main>

      <AddEditDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editing={editing}
        onSubmit={handleSubmit}
      />

      <AnimatePresence>
        {focused && (
          <FullscreenView
            cd={focused}
            parts={diffParts(focused.target_at, now)}
            onClose={() => setFocusedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-20 max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center"
    >
      <h2 className="text-xl font-semibold text-zinc-100">No countdowns yet</h2>
      <p className="mt-2 text-sm text-zinc-400">Add your first event and watch time fly.</p>
      <Button onClick={onCreate} className="mt-6 rounded-full bg-white text-black hover:bg-white/90">
        <Plus className="h-4 w-4 mr-1" /> New countdown
      </Button>
    </motion.div>
  );
}