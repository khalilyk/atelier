"use client";
import { useEffect } from "react";
import Image from "next/image";

export default function ImageLightbox({
  images, index, setIndex, alt = "",
}: {
  images: string[];
  index: number | null;
  setIndex: (i: number | null) => void;
  alt?: string;
}) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      else if (e.key === "ArrowRight") setIndex((index + 1) % images.length);
      else if (e.key === "ArrowLeft") setIndex((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, images.length, setIndex]);

  if (index === null) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10" onClick={() => setIndex(null)}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <button onClick={() => setIndex(null)} aria-label="Close" className="absolute top-5 right-6 z-20 text-white/70 hover:text-white text-3xl leading-none transition-colors">✕</button>
      {images.length > 1 && (
        <>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + images.length) % images.length); }} className="absolute left-4 md:left-8 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors">←</button>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % images.length); }} className="absolute right-4 md:right-8 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors">→</button>
        </>
      )}
      <div className="relative z-10 w-full max-w-5xl pointer-events-none" style={{ height: "80vh" }}>
        <Image src={images[index]} alt={`${alt} ${index + 1}`} fill className="object-contain" priority />
      </div>
      {images.length > 1 && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 type-label text-white/60" style={{ letterSpacing: "0.12em", fontSize: "11px" }}>{index + 1} / {images.length}</span>
      )}
    </div>
  );
}
