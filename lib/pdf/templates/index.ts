// lib/pdf/templates/index.ts
import TemplateAko from "./template-ako";
import TemplateNuit from "./template-nuit";
import TemplateEclat from "./template-eclat";
import TemplateSignature from "./template-signature";
import TemplateJovial from "./template-jovial";
import TemplateBicolore from "./template-bicolore";

// template-degrade ("La Facture") retiré du choix proposé aux clients — les
// comptes qui l'avaient déjà sélectionné basculent automatiquement sur AKO à
// leur prochaine génération de PDF, via le fallback de getTemplateComponent
// ci-dessous (aucune erreur, pas de migration de données nécessaire).
export const TEMPLATES = {
  "template-ako": TemplateAko,
  "template-nuit": TemplateNuit,
  "template-eclat": TemplateEclat,
  "template-signature": TemplateSignature,
  "template-jovial": TemplateJovial,
  "template-bicolore": TemplateBicolore,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function getTemplateComponent(id?: string | null) {
  return TEMPLATES[(id as TemplateId) ?? "template-ako"] ?? TemplateAko;
}
