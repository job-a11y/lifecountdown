import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthScreen } from "@/components/countdown/AuthScreen";
import { Dashboard } from "@/components/countdown/Dashboard";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "CountDown — Elegant timers, synced everywhere" },
      { name: "description", content: "Create beautiful countdowns for the moments that matter. Real-time sync across every device." },
      { property: "og:title", content: "CountDown" },
      { property: "og:description", content: "Elegant countdowns for every moment that matters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  return <Dashboard user={session.user} />;
}
