"use client";
import { createContext, useContext } from "react";
import type { Company } from "@/lib/admin-store";

const FALLBACK: Company = {
  name: "Atelier Supply Group Pty Ltd", abn: "ABN 99 696 292 001", acn: "ACN 696 292 001",
  email: "info@ateliersupplygroup.com.au", phone: "+61 449 513 614", website: "ateliersupplygroup.com.au",
  instagram: "@ateliersupplygroup", location: "Sydney based · Delivering Australia Wide",
  bankName: "", bankAccountName: "Atelier Supply Group Pty Ltd", bankBsb: "", bankAccount: "",
};

const CompanyCtx = createContext<Company>(FALLBACK);

export function CompanyProvider({ company, children }: { company: Company; children: React.ReactNode }) {
  return <CompanyCtx.Provider value={company}>{children}</CompanyCtx.Provider>;
}

/** Company details for client components (footer, contact, etc.). */
export function useCompany() {
  return useContext(CompanyCtx);
}
