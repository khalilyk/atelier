"use client";

export default function GoBack({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        // Only step back when the visitor came from this site; otherwise go home.
        let internal = false;
        try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch {}
        if (internal && window.history.length > 1) window.history.back();
        else window.location.href = "/";
      }}
      className={className}
    >
      Go Back
    </button>
  );
}
