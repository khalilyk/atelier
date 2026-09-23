"use client";
import { createContext, useContext } from "react";
import type { CustomPage } from "@/lib/custom-pages";

const Ctx = createContext<CustomPage[]>([]);

export function CustomPagesProvider({ pages, children }: { pages: CustomPage[]; children: React.ReactNode }) {
  return <Ctx.Provider value={pages}>{children}</Ctx.Provider>;
}

/** Published pages you created yourself, in display order. */
export function useCustomPages() {
  return useContext(Ctx);
}

/** Only the ones marked to show in the footer. */
export function useFooterPages() {
  return useContext(Ctx).filter((p) => p.showInNav);
}
