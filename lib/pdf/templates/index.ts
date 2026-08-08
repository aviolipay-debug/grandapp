// lib/pdf/templates/index.ts
import TemplateMono from "./template-mono";
import TemplateGeo from "./template-geo";
import TemplateBlue from "./template-blue";
import TemplateGradient from "./template-gradient";

export const TEMPLATES = {
  "template-mono": TemplateMono,
  "template-geo": TemplateGeo,
  "template-blue": TemplateBlue,
  "template-gradient": TemplateGradient,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function getTemplateComponent(id: string | null | undefined) {
  return TEMPLATES[(id as TemplateId) ?? "template-mono"] ?? TemplateMono;
}
