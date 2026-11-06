// lib/pdf/grayscale-logo.ts
//
// Convertit le logo de l'entreprise en niveaux de gris, pour le reçu de paiement
// uniquement (les devis et factures gardent le logo en couleur).
// @react-pdf/renderer ne sait pas filtrer une image : on la convertit donc avant.
// En cas de problème (logo introuvable, format illisible), on renvoie l'adresse
// d'origine : le reçu s'imprime alors avec le logo en couleur plutôt que de planter.

import sharp from "sharp";

export type LogoSource = string | { data: Buffer; format: "png" };

export async function grayscaleLogo(url: string): Promise<LogoSource> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Logo introuvable (${res.status})`);
    const input = Buffer.from(await res.arrayBuffer());
    const data = await sharp(input).grayscale().png().toBuffer();
    return { data, format: "png" };
  } catch {
    return url;
  }
}
