"use client";
import { createContext, useContext } from "react";
import type { CustomCategory } from "@/lib/categories";

const Ctx = createContext<CustomCategory[]>([]);

export function CategoriesProvider({ categories, children }: { categories: CustomCategory[]; children: React.ReactNode }) {
  return <Ctx.Provider value={categories}>{children}</Ctx.Provider>;
}

/** Published admin-created categories, in display order. */
export function useCustomCategories() {
  return useContext(Ctx);
}

export function useCustomCategory(slug: string) {
  return useContext(Ctx).find((c) => c.slug === slug);
}
