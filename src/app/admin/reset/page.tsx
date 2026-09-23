"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    fetch(`/api/admin/reset?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => setStatus(d.valid ? "valid" : "invalid"))
      .catch(() => setStatus("invalid"));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setStatus("done"); }
    else { setError(data.error || "Something went wrong."); }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-10 lg:hidden">
        <Image src="/Atelier-logo.png" alt="Atelier" width={100} height={40} className="object-contain" />
      </div>

      {status === "checking" && <p className="text-stone-900 text-sm text-center">Checking your link…</p>}

      {status === "invalid" && (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-2xl mx-auto mb-5">!</div>
          <h1 className="text-stone-900 text-2xl font-light mb-2">Link expired</h1>
          <p className="text-stone-900 text-sm mb-6 leading-relaxed">This reset link is invalid or has expired. Request a new one from the sign-in page.</p>
          <a href="/admin/login" className="text-sm text-[#b8934a] hover:underline">Back to sign in</a>
        </div>
      )}

      {status === "done" && (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center text-2xl mx-auto mb-5">✓</div>
          <h1 className="text-stone-900 text-2xl font-light mb-2">Password updated</h1>
          <p className="text-stone-900 text-sm mb-6 leading-relaxed">Your password has been reset. You can now sign in with your new password.</p>
          <a href="/admin/login" className="inline-block bg-[#b8934a] text-white text-xs uppercase tracking-widest py-3 px-8 rounded-xl hover:bg-[#a07e3c] transition-colors">Sign In</a>
        </div>
      )}

      {status === "valid" && (
        <div>
          <h1 className="text-stone-900 text-2xl font-light mb-1">Set a new password</h1>
          <p className="text-stone-900 text-sm mb-8">Choose a strong password of at least 8 characters.</p>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-stone-900 text-xs uppercase tracking-widest mb-2">New password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm outline-none focus:border-[#b8934a]/60 transition-colors placeholder:text-stone-300" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-stone-900 text-xs uppercase tracking-widest mb-2">Confirm password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm outline-none focus:border-[#b8934a]/60 transition-colors placeholder:text-stone-300" placeholder="••••••••" />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#b8934a] text-white text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-50">
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AdminReset() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden" style={{ background: "#0a0908" }}>
        <Image src="/Atelier-logo.png" alt="Atelier" width={100} height={40} className="object-contain relative z-10" />
        <div className="relative z-10">
          <div className="w-10 h-px bg-[#b8934a] mb-8" />
          <p className="text-white/90 text-3xl font-light leading-snug mb-4">
            Curated with intention.<br />Delivered with precision.
          </p>
        </div>
        <p className="text-stone-700 text-xs relative z-10">© {new Date().getFullYear()} Atelier Supply Group</p>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "#f4f5f7" }}>
        <Suspense fallback={<p className="text-stone-900 text-sm">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
