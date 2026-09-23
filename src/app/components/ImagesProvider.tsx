"use client";
import { createContext, useContext } from "react";

const ImagesCtx = createContext<Record<string, string>>({});

export function ImagesProvider({ images, children }: { images: Record<string, string>; children: React.ReactNode }) {
  return <ImagesCtx.Provider value={images}>{children}</ImagesCtx.Provider>;
}

/** Resolved URL for an image slot, or "" when the slot is an empty placeholder. */
export function useImage(slot: string): string {
  return useContext(ImagesCtx)[slot] || "";
}

export function useImages() {
  return useContext(ImagesCtx);
}
