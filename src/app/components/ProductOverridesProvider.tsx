"use client";
import { createContext, useContext } from "react";
import type { ProductOverrides } from "@/lib/product-content";

const Ctx = createContext<ProductOverrides>({});

export function ProductOverridesProvider({ overrides, children }: { overrides: ProductOverrides; children: React.ReactNode }) {
  return <Ctx.Provider value={overrides}>{children}</Ctx.Provider>;
}

/** Read the product overrides map in client components. */
export function useProductOverrides(): ProductOverrides {
  return useContext(Ctx);
}
