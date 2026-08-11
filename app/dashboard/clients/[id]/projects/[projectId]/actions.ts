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

  // Quand le projet passe "En cours" (devis accepté), génère automatiquement
  // les deux documents — Facture et Bordereau de livraison — s'ils n'existent pas déjà.
  if (status === "en_cours") {
    await generateInvoicesForProject(projectId);
  }

  revalidatePath(`/dashboard/clients/${clientId}/projects/${projectId}`);
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}

async function generateInvoicesForProject(projectId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Un projet = un devis actif — on prend le devis rattaché à ce projet.
  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("project_id", projectId)
    .limit(1)
    .maybeSingle();

  if (!quote) return;

  const { data: quoteItems } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("sort_order");

  // Vérifie ce qui existe déjà pour ce devis, pour ne jamais dupliquer.
  const { data: existingInvoices } = await supabase
    .from("invoices")
    .select("id, document_type")
    .eq("quote_id", quote.id);

  const hasFacture = existingInvoices?.some((i) => i.document_type === "facture");
  const hasBordereau = existingInvoices?.some((i) => i.document_type === "bordereau");

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  async function createDocument(documentType: "facture" | "bordereau") {
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user!.id)
      .eq("document_type", documentType);

    const prefix = documentType === "facture" ? "FAC" : "BDL";
    const invoiceNumber = `${prefix}-${String((count ?? 0) + 1).padStart(4, "0")}`;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        owner_id: user!.id,
        client_id: quote.client_id,
        quote_id: quote.id,
        invoice_number: invoiceNumber,
        document_type: documentType,
        status: "sent",
        due_date: dueDate.toISOString().slice(0, 10),
        objet: quote.objet ?? null,
        subtotal: quote.subtotal,
        discount_rate: quote.discount_rate ?? 0,
        tax_rate: quote.tax_rate,
        total: quote.total,
        currency: quote.currency,
        notes: quote.notes,
      })
      .select()
      .single();

    if (error || !invoice) return;

    if (quoteItems && quoteItems.length > 0) {
      await supabase.from("invoice_items").insert(
        quoteItems.map((item) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          sort_order: item.sort_order,
        }))
      );
    }
  }

  if (!hasFacture) await createDocument("facture");
  if (!hasBordereau) await createDocument("bordereau");
}
