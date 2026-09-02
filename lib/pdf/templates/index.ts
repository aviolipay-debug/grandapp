// lib/pdf/templates/index.ts
import TemplateAko from "./template-ako";
import TemplateDegrade from "./template-degrade";
import TemplateNuit from "./template-nuit";
import TemplateEclat from "./template-eclat";
import TemplateSignature from "./template-signature";

export const TEMPLATES = {
  "template-ako": TemplateAko,
  "template-degrade": TemplateDegrade,
  "template-nuit": TemplateNuit,
  "template-eclat": TemplateEclat,
  "template-signature": TemplateSignature,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function getTemplateComponent(id?: string | null) {
  return TEMPLATES[(id as TemplateId) ?? "template-ako"] ?? TemplateAko;
}
