"use client";
import { BasketProvider as Provider } from "../context/BasketContext";
import { ReactNode } from "react";

export default function BasketProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
