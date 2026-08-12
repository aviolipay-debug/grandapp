// lib/pdf/templates/index.ts
import TemplateAko from "./template-ako";
import TemplateDegrade from "./template-degrade";

export const TEMPLATES = {
  "template-ako": TemplateAko,
  "template-degrade": TemplateDegrade,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function getTemplateComponent(id?: string | null) {
  return TEMPLATES[(id as TemplateId) ?? "template-ako"] ?? TemplateAko;
}
