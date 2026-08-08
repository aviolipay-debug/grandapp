// lib/pdf/templates/index.ts
import TemplateA from "./template-a";
import TemplateB from "./template-b";
import TemplateC from "./template-c";

export const TEMPLATES = {
  "template-a": TemplateA,
  "template-b": TemplateB,
  "template-c": TemplateC,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function getTemplateComponent(id: string | null | undefined) {
  return TEMPLATES[(id as TemplateId) ?? "template-a"] ?? TemplateA;
}
