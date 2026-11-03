// lib/pdf/legal-footer.ts
//
// Construit la ligne légale affichée en bas des devis, factures et bordereaux :
//   "RCCM : XXXX  ·  N° IFU : YYYY"
//
// Règle : on n'affiche que ce que l'utilisateur a réellement renseigné.
//  - les deux renseignés  → "RCCM : … · N° IFU : …"
//  - un seul renseigné    → uniquement celui-là
//  - aucun renseigné      → null (les templates n'affichent alors rien du tout)
//
// Les numéros IFU sont stockés sous forme de tableau (profiles.tax_ids) ;
// s'il y en a plusieurs, ils sont séparés par une virgule.

import type { DocumentData } from "./types";

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

// Version en morceaux : un élément par information, pour que les modèles
// puissent les afficher côte à côte avec un vrai espace entre les deux.
export function buildLegalParts(
  data: Pick<DocumentData, "companyRccm" | "companyTaxIds">
): string[] {
  const rccm = clean(data.companyRccm);
  const taxIds = (data.companyTaxIds ?? []).map(clean).filter(Boolean);

  const parts: string[] = [];
  if (rccm) parts.push(`RCCM : ${rccm}`);
  if (taxIds.length > 0) parts.push(`N° IFU : ${taxIds.join(", ")}`);
  return parts;
}

export function buildLegalLine(
  data: Pick<DocumentData, "companyRccm" | "companyTaxIds">
): string | null {
  const rccm = clean(data.companyRccm);
  const taxIds = (data.companyTaxIds ?? []).map(clean).filter(Boolean);

  const parts: string[] = [];
  if (rccm) parts.push(`RCCM : ${rccm}`);
  if (taxIds.length > 0) parts.push(`N° IFU : ${taxIds.join(", ")}`);

  return parts.length > 0 ? parts.join("  ·  ") : null;
}
