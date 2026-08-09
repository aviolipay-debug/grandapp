"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProjectStatus(
  projectId: string,
  clientId: string,
  status: "en_cours" | "termine" | "attente"
) {
  const supabase = createClient();

  await supabase.from("projects").update({ status }).eq("id", projectId);

  revalidatePath(`/dashboard/clients/${clientId}/projects/${projectId}`);
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard");
}
