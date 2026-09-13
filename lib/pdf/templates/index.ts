// lib/pdf/templates/index.ts
import TemplateAko from "./template-ako";
import TemplateNuit from "./template-nuit";
import TemplateEclat from "./template-eclat";
import TemplateSignature from "./template-signature";
import TemplateJovial from "./template-jovial";
import TemplateBicolore from "./template-bicolore";
import TemplateChantier from "./template-chantier";

export const TEMPLATES = {
  "template-ako": TemplateAko,
  "template-nuit": TemplateNuit,
  "template-eclat": TemplateEclat,
  "template-signature": TemplateSignature,
  "template-jovial": TemplateJovial,
  "template-bicolore": TemplateBicolore,
  "template-chantier": TemplateChantier,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function getTemplateComponent(id?: string | null) {
  return TEMPLATES[(id as TemplateId) ?? "template-ako"] ?? TemplateAko;
}
