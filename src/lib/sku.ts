// Deterministic Atelier SKU generation.
// Format: ATL-<3-letter category code>-<3-digit sequence>, e.g. ATL-VAN-001.

export function categoryCode(categoryId: string): string {
  const letters = categoryId.replace(/[^a-zA-Z]/g, "");
  return (letters.slice(0, 3) || "GEN").toUpperCase();
}

export function makeSku(categoryId: string, index: number): string {
  return `ATL-${categoryCode(categoryId)}-${String(index + 1).padStart(3, "0")}`;
}
