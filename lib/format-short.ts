// lib/format-short.ts
//
// Petits formats d'affichage pour les listes (Finances, Devis).

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

// "2026-10-08" (ou un horodatage ISO) devient "08 oct. 2026".
export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return value;
  return `${m[3]} ${month} ${m[1]}`;
}

// "FAC-0003" devient "Facture N° 003", "DEV-0001" devient "Devis N° 001".
// Si le numéro n'a pas de préfixe, on le garde tel quel après "N°".
export function formatDocNumber(label: string, number: string | null | undefined): string {
  const raw = (number ?? "").trim();
  if (!raw) return label;
  // On retire aussi un zéro de tête : "0003" s'affiche "003".
  const digits = raw.replace(/^[A-Za-z]+[-_ ]?/, "").replace(/^0(?=\d{3,})/, "");
  return `${label} N° ${digits || raw}`;
}
