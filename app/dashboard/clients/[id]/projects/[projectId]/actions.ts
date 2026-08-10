"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProjectStatus(
  projectId: string,
  clientId: string,
  status: "en_cours" | "termine" | "attente"
) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("was_in_progress")
    .eq("id", projectId)
    .single();

  const projectUpdates: Record<string, unknown> = { status };
  if (status === "en_cours") {
    projectUpdates.was_in_progress = true;
  }

  await supabase.from("projects").update(projectUpdates).eq("id", projectId);

  // Répercute automatiquement le statut du projet sur les devis rattachés :
  // - En attente  -> devis "Envoyé"
  // - En cours    -> devis "Accepté"
  // - Terminé     -> devis "Refusé" seulement si le projet n'est jamais passé par "En cours"
  //                  (sinon on laisse le statut "Accepté" déjà en place)
  let quoteStatus: "sent" | "accepted" | "declined" | null = null;
  if (status === "attente") {
    quoteStatus = "sent";
  } else if (status === "en_cours") {
    quoteStatus = "accepted";
  } else if (status === "termine" && !project?.was_in_progress) {
    quoteStatus = "declined";
  }

  if (quoteStatus) {
    await supabase.from("quotes").update({ status: quoteStatus }).eq("project_id", projectId);
  }

  revalidatePath(`/dashboard/clients/${clientId}/projects/${projectId}`);
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard");
}
