// lib/pdf/templates/index.ts
import TemplateAko from "./template-ako";

export const TEMPLATES = {
  "template-ako": TemplateAko,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function getTemplateComponent(_id?: string | null) {
  // Un seul modèle disponible pour l'instant : AKO
  return TemplateAko;
}
