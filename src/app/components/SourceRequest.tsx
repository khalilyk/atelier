"use client";
import { useState, useRef } from "react";

export default function SourceRequest({ defaultProduct = "", variant = "section" }: { defaultProduct?: string; variant?: "section" | "inline" }) {
  const inline = variant === "inline";
  const [form, setForm] = useState({ name: "", email: "", phone: "", productName: defaultProduct, message: "" });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function pickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrorMsg("Please choose an image file."); return; }
    setErrorMsg("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.message) { setErrorMsg("Email and a short description are required."); return; }
    setErrorMsg("");
    setStatus("sending");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("productName", form.productName);
    fd.append("message", form.message);
    if (image) fd.append("image", image);

    try {
      const res = await fetch("/api/source-request", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(data.error || "Something went wrong."); return; }
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't send right now. Please try again.");
    }
  }

  // Theme-aware classes - dark full-bleed section vs light compact inline card
  const inputCls = inline
    ? "border px-4 py-3 type-body outline-none transition-colors"
    : "bg-white/5 border border-white/15 px-4 py-3.5 type-body text-white placeholder:text-stone-500 outline-none focus:border-[#b8934a]/60 transition-colors";
  const inputStyle = inline ? { background: "#f5f0e8", borderColor: "#d4ccc0", color: "#1a1714" } : undefined;

  if (status === "done") {
    if (inline) {
      return (
        <div className="text-center py-4">
          <div className="w-10 h-10 rounded-full bg-[#b8934a]/20 text-[#b8934a] flex items-center justify-center mx-auto mb-4">✓</div>
          <p className="type-body" style={{ color: "#1a1714" }}>Thank you - we&rsquo;re on it. Our sourcing team will be in touch.</p>
        </div>
      );
    }
    return (
      <section className="bg-[#2c1f14] py-20 md:py-24 px-6 md:px-8 border-t border-stone-200">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-[#b8934a]/20 text-[#b8934a] flex items-center justify-center text-xl mx-auto mb-6">✓</div>
          <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 300, lineHeight: 1.1 }}>
            Thank you - we&rsquo;re on it.
          </h2>
          <p className="type-body text-stone-400" style={{ lineHeight: 1.9 }}>
            Our sourcing team will review your reference and be in touch shortly.
          </p>
        </div>
      </section>
    );
  }

  const formInner = (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Your name" value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} style={inputStyle} />
        <input type="email" placeholder="Email address*" required value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} style={inputStyle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} style={inputStyle} />
        <input type="text" placeholder="Item name / brand (if known)" value={form.productName} onChange={e => set("productName", e.target.value)} className={inputCls} style={inputStyle} />
      </div>

      <textarea
        placeholder="Tell us about it - where you saw it, dimensions, finish, anything that helps us find it.*" required rows={4}
        value={form.message} onChange={e => set("message", e.target.value)}
        className={`${inputCls} resize-none`} style={inputStyle}
      />

      {/* Image upload */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => pickImage(e.target.files?.[0] || null)} />
      {preview ? (
        <div className="flex items-center gap-4 p-3 border" style={inline ? { background: "#f5f0e8", borderColor: "#d4ccc0" } : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Reference" className="w-20 h-20 object-cover rounded-sm shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="type-body text-sm truncate" style={{ color: inline ? "#1a1714" : "#fff" }}>{image?.name}</p>
            <button type="button" onClick={() => { setImage(null); setPreview(""); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-xs text-[#b8934a] hover:underline mt-1">Remove</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-3 border border-dashed px-4 py-5 hover:border-[#b8934a]/60 hover:text-[#b8934a] transition-colors"
          style={inline ? { borderColor: "#d4ccc0", color: "#8a7d70" } : { borderColor: "rgba(255,255,255,0.25)", color: "#a8a29e" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
          </svg>
          <span className="type-button text-sm">Attach a reference photo</span>
        </button>
      )}

      {errorMsg && <p className="type-body text-sm" style={{ color: inline ? "#c0392b" : "#fca5a5" }}>{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="arrow-link type-button bg-[#b8934a] text-white px-8 py-4 flex items-center justify-center gap-3 hover:bg-[#a07e3c] transition-colors duration-300 mt-2 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : <>Send to Our Sourcing Team &nbsp;<span className="arrow">→</span></>}
      </button>
    </form>
  );

  if (inline) {
    return (
      <div>
        <p className="type-label mb-2" style={{ letterSpacing: "0.14em", color: "#b8934a" }}>SEEN IT ELSEWHERE?</p>
        <h3 className="mb-2" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(20px, 2.4vw, 28px)", fontWeight: 300, lineHeight: 1.15, color: "#1a1714" }}>
          Found something we don&rsquo;t carry?
        </h3>
        <p className="type-body mb-6" style={{ lineHeight: 1.8, color: "#8a7d70" }}>
          Spotted a piece you love elsewhere? Tell us about it and attach a photo - we&rsquo;ll track it down.
        </p>
        {formInner}
      </div>
    );
  }

  return (
    <section className="bg-[#2c1f14] py-20 md:py-28 px-6 md:px-8 border-t border-stone-200">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="type-label text-[#b8934a] mb-5" style={{ letterSpacing: "0.18em" }}>Seen It Elsewhere?</p>
          <h2 className="text-white mb-5 mx-auto" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.1, maxWidth: "560px" }}>
            Found something we don&rsquo;t carry yet?
          </h2>
          <p className="type-body text-stone-400 mx-auto max-w-md" style={{ lineHeight: 1.9 }}>
            If you&rsquo;ve come across a piece you love - anywhere - let us know and attach a photo. Our team will track it down for you.
          </p>
        </div>
        {formInner}
      </div>
    </section>
  );
}
