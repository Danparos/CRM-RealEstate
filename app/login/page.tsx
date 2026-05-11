"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 flex-col justify-between p-12">
        <div>
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#B8960C] to-[#CD853F] mb-8" />
          <p className="font-serif text-4xl font-semibold tracking-wide text-white leading-tight">
            Real Estate CRM
          </p>
          <p className="mt-2 text-[13px] uppercase tracking-[0.22em] text-stone-400 font-medium">
            Authorised agents only
          </p>
        </div>

        <blockquote className="font-serif text-2xl text-stone-300 italic leading-relaxed">
          "Real estate is about relationships, trust, and finding the right place to call home."
        </blockquote>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-stone-800" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-600 font-medium">Internal CRM</span>
          <div className="h-px flex-1 bg-stone-800" />
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center bg-stone-50 p-8">
        <div className="w-full max-w-sm">

          <div className="lg:hidden text-center mb-10">
            <p className="font-serif text-3xl font-semibold tracking-wide text-stone-900">Real Estate CRM</p>
          </div>

          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">Welcome back</h2>
          <p className="text-sm text-stone-400 mb-8">Sign in to access the CRM</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Email</label>
              <input
                type="email" required autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all placeholder:text-stone-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 pr-11 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all placeholder:text-stone-300"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <><LogIn size={15} strokeWidth={2} /> Sign In</>
              }
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-stone-400">
            Having trouble? Contact your office manager.
          </p>
        </div>
      </div>
    </div>
  );
}
