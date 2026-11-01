// lib/pdf/legal-footer.ts
//
// Construit la ligne légale affichée en bas des devis, factures et bordereaux :
//   "RCCM : XXXX  ·  N° d'identification : YYYY"
//
// Règle : on n'affiche que ce que l'utilisateur a réellement renseigné.
//  - les deux renseignés  → "RCCM : … · N° d'identification : …"
//  - un seul renseigné    → uniquement celui-là
//  - aucun renseigné      → null (les templates n'affichent alors rien du tout)
//
// Les numéros d'identification sont stockés sous forme de tableau (profiles.tax_ids) ;
// s'il y en a plusieurs, ils sont séparés par une virgule.

import type { DocumentData } from "./types";

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function buildLegalLine(
  data: Pick<DocumentData, "companyRccm" | "companyTaxIds">
): string | null {
  const rccm = clean(data.companyRccm);
  const taxIds = (data.companyTaxIds ?? []).map(clean).filter(Boolean);

  const parts: string[] = [];
  if (rccm) parts.push(`RCCM : ${rccm}`);
  if (taxIds.length > 0) parts.push(`N° d'identification : ${taxIds.join(", ")}`);

  return parts.length > 0 ? parts.join("  ·  ") : null;
}
