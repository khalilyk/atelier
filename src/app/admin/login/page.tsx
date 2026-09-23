"use client";
import { useState } from "react";
import Image from "next/image";

type View = "login" | "forgot";

export default function AdminLogin() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      setError(data.error || "Invalid credentials");
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetch("/api/admin/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
    } catch { /* always show the same confirmation - no account enumeration */ }
    setForgotSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden"
        style={{ background: "#0a0908" }}
      >
        {/* subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo */}
        <a href="/" aria-label="Atelier Supply Group home" title="Go to the website" className="relative z-10 w-fit">
          <Image src="/Atelier-logo.png" alt="Atelier" width={100} height={40} className="object-contain" />
        </a>

        {/* Centre quote */}
        <div className="relative z-10">
          <div className="w-10 h-px bg-[#b8934a] mb-8" />
          <p className="text-white/90 text-3xl font-light leading-snug mb-4">
            Curated with intention.<br />Delivered with precision.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
            Manage your content, enquiries, and team from one unified workspace.
          </p>
        </div>

        {/* Bottom */}
        <p className="text-stone-700 text-xs relative z-10">
          © {new Date().getFullYear()} Atelier Supply Group
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "#f4f5f7" }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <a href="/" aria-label="Atelier Supply Group home" title="Go to the website">
              <Image src="/Atelier-logo.png" alt="Atelier" width={100} height={40} className="object-contain" />
            </a>
          </div>

          {view === "login" ? (
            <div>
              <h1 className="text-stone-900 text-2xl font-light mb-1">
                Welcome back
              </h1>
              <p className="text-stone-900 text-sm mb-8">Sign in to your admin portal.</p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-stone-900 text-xs uppercase tracking-widest mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm outline-none focus:border-[#b8934a]/60 transition-colors placeholder:text-stone-300"
                    placeholder="you@atelier.com"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-stone-900 text-xs uppercase tracking-widest">Password</label>
                    <button
                      type="button"
                      onClick={() => { setView("forgot"); setError(""); }}
                      className="text-xs text-[#b8934a] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 pr-11 text-stone-900 text-sm outline-none focus:border-[#b8934a]/60 transition-colors placeholder:text-stone-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#b8934a] text-white text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <p className="text-stone-900 text-xs text-center mt-6">
                First login? Your password is set on first use.
              </p>
            </div>
          ) : (
            <div>
              <button
                onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }}
                className="flex items-center gap-2 text-stone-900 text-xs hover:text-[#b8934a] transition-colors mb-8"
              >
                ← Back to sign in
              </button>

              {forgotSent ? (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center text-2xl mx-auto mb-5">
                    ✓
                  </div>
                  <h1 className="text-stone-900 text-2xl font-light mb-2">
                    Check your inbox
                  </h1>
                  <p className="text-stone-900 text-sm mb-6 leading-relaxed">
                    If an account exists for <strong className="text-stone-600">{forgotEmail}</strong>, you'll receive a reset link shortly.
                  </p>
                  <button
                    onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }}
                    className="text-sm text-[#b8934a] hover:underline"
                  >
                    Return to sign in
                  </button>
                </div>
              ) : (
                <div>
                  <h1 className="text-stone-900 text-2xl font-light mb-1">
                    Reset password
                  </h1>
                  <p className="text-stone-900 text-sm mb-8">
                    Enter your email and we'll send you a reset link.
                  </p>

                  <form onSubmit={handleForgot} className="space-y-5">
                    <div>
                      <label className="block text-stone-900 text-xs uppercase tracking-widest mb-2">Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm outline-none focus:border-[#b8934a]/60 transition-colors placeholder:text-stone-300"
                        placeholder="you@atelier.com"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#b8934a] text-white text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-50"
                    >
                      {loading ? "Sending…" : "Send Reset Link"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
