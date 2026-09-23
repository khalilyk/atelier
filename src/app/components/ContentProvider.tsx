"use client";
import { createContext, useContext } from "react";
import { resolve } from "@/lib/content-registry";

const ContentCtx = createContext<Record<string, string>>({});

export function ContentProvider({ overrides, children }: { overrides: Record<string, string>; children: React.ReactNode }) {
  return <ContentCtx.Provider value={overrides}>{children}</ContentCtx.Provider>;
}

/** Returns a t(key) resolver for client components. */
export function useT() {
  const overrides = useContext(ContentCtx);
  return (key: string) => resolve(overrides, key);
}

/** The raw content overrides in scope. */
export function useContentOverrides() {
  return useContext(ContentCtx);
}

/** Lays a block's own text over the page content for everything inside it. */
export function BlockScope({ data, children }: { data: Record<string, string>; children: React.ReactNode }) {
  const parent = useContext(ContentCtx);
  if (!data || !Object.keys(data).length) return <>{children}</>;
  return <ContentCtx.Provider value={{ ...parent, ...data }}>{children}</ContentCtx.Provider>;
}
