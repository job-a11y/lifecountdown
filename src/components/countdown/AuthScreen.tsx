import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center px-6 overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(10,132,255,0.35), transparent)" }} />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(191,90,242,0.30), transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">CountDown</h1>
          <p className="mt-1 text-sm text-zinc-400">Elegant timers, synced everywhere.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300 text-xs uppercase tracking-wider">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300 text-xs uppercase tracking-wider">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500" />
          </div>

          <Button type="submit" disabled={loading}
            className="h-12 w-full rounded-2xl bg-white text-black hover:bg-white/90 font-medium">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-zinc-500">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleLoading}
          variant="outline"
          className="h-12 w-full rounded-2xl border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10 hover:text-white font-medium"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.68 4.1-5.5 4.1-3.3 0-6-2.73-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.48l2.63-2.53C16.8 3.4 14.62 2.5 12 2.5 6.98 2.5 2.9 6.58 2.9 11.6S6.98 20.7 12 20.7c6.93 0 9.2-4.87 9.2-7.35 0-.5-.05-.87-.12-1.25H12z"/>
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-center text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}