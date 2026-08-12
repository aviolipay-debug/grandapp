// lib/invoices/sync-from-quote.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Recopie les données actuelles du devis (montants, remise, TVA, lignes) sur
// tous les documents rattachés (Facture + Bordereau), pour qu'ils restent
// toujours identiques au devis — appelé à chaque modification du devis, et
// aussi avant chaque enregistrement de paiement.
export async function syncInvoicesFromQuote(quoteId: string) {
  const supabase = createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (!quote) return;

  const { data: quoteItems } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("quote_id", quoteId);

  if (!invoices || invoices.length === 0) return;

  for (const inv of invoices) {
    await supabase
      .from("invoices")
      .update({
        objet: quote.objet ?? null,
        subtotal: quote.subtotal,
        discount_rate: quote.discount_rate ?? 0,
        tax_rate: quote.tax_rate,
        total: quote.total,
        currency: quote.currency,
        notes: quote.notes,
      })
      .eq("id", inv.id);

    await supabase.from("invoice_items").delete().eq("invoice_id", inv.id);

    if (quoteItems && quoteItems.length > 0) {
      await supabase.from("invoice_items").insert(
        quoteItems.map((item) => ({
          invoice_id: inv.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          sort_order: item.sort_order,
        }))
      );
    }
  }

  revalidatePath("/dashboard/invoices");
}
