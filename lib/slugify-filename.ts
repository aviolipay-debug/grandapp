// lib/slugify-filename.ts

// Convertit un texte (ex: l'objet d'un devis) en nom de fichier propre :
// sans accents, sans espaces ni caractères spéciaux. Retombe sur `fallback`
// si le texte est vide ou ne contient aucun caractère alphanumérique.
export function slugifyFilename(value: string | null | undefined, fallback: string): string {
  const base = value?.trim() || fallback;
  const slug = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || fallback;
}
