// lib/format-short.ts
//
// Petits formats d'affichage pour les listes (Finances, Devis).

const MONTHS = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];

// Format unique des dates de l'application : "16 nov 2026".
// Accepte "2026-11-16" ou un horodatage ISO ("2026-11-16T23:30:00Z"). Pour un
// horodatage, on convertit à l'heure du Bénin (UTC+1) pour ne pas décaler le jour.
export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return "";
  let y: string, mo: string, d: string;
  if (value instanceof Date || (typeof value === "string" && /T\d{2}:\d{2}/.test(value))) {
    const t = new Date(value);
    if (Number.isNaN(t.getTime())) return typeof value === "string" ? value : "";
    const l = new Date(t.getTime() + 60 * 60 * 1000);
    y = String(l.getUTCFullYear());
    mo = String(l.getUTCMonth() + 1).padStart(2, "0");
    d = String(l.getUTCDate()).padStart(2, "0");
  } else {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return value;
    [, y, mo, d] = m;
  }
  const month = MONTHS[Number(mo) - 1];
  if (!month) return typeof value === "string" ? value : "";
  return `${d} ${month} ${y}`;
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
