"use client";
import { useEffect } from "react";
import Image from "next/image";

export type LightboxProduct = { name: string; desc: string; tag: string; image?: string; sku?: string };

export default function ProductLightbox({ product, onClose, onAdd }: { product: LightboxProduct; onClose: () => void; onAdd: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-[#f5f0e8] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Full image */}
        <div className="relative md:w-1/2 h-72 md:h-auto shrink-0 bg-stone-200">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-4xl">◫</div>
          )}
        </div>
        {/* Info */}
        <div className="flex flex-col justify-between p-8 md:p-10 flex-1 overflow-y-auto">
          <div>
            <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 text-2xl leading-none transition-colors">✕</button>
            <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.15em" }}>{product.tag}</p>
            <h2 className="text-stone-900 mb-2" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px, 2.5vw, 34px)", fontWeight: 300, lineHeight: 1.1 }}>
              {product.name}
            </h2>
            {product.sku && (
              <p className="text-stone-400 mb-4" style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.08em" }}>SKU: {product.sku}</p>
            )}
            <p className="type-body text-stone-500 mb-6" style={{ lineHeight: 1.8 }}>{product.desc}</p>
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-stone-200">
            <button
              onClick={() => { onAdd(); onClose(); }}
              className="w-full bg-[#b8934a] text-white type-button py-3.5 hover:bg-[#a07e3c] transition-colors"
            >
              Add to Source List →
            </button>
            <a href="/contact" className="w-full text-center type-button text-stone-600 border border-stone-300 py-3.5 hover:border-stone-600 transition-colors">
              Request Sample →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
