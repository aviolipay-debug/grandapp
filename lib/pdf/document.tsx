import type { DocumentData } from "./types";
import { getTemplateComponent } from "./templates";

export type { DocumentData } from "./types";

export default function DocumentPDF({
  data,
  templateId,
}: {
  data: DocumentData;
  templateId?: string | null;
}) {
  const Template = getTemplateComponent(templateId);
  return <Template data={data} />;
}
