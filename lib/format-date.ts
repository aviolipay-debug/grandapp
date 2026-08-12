// lib/format-date.ts

// Convertit une date stockée (format ISO "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss...")
// en format français "JJ/MM/AAAA". Retourne une chaîne vide si la date est absente/invalide.
export function formatDateFR(value: string | null | undefined): string {
  if (!value) return "";

  // Cas "YYYY-MM-DD" (le plus courant ici, colonnes date de Supabase) — on évite
  // de passer par `new Date()` pour ne pas subir de décalage de fuseau horaire.
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDateOnly) {
    const [, year, month, day] = isoDateOnly;
    return `${day}/${month}/${year}`;
  }

  // Cas timestamp complet (ex: "2026-08-10T14:32:00.000Z")
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
