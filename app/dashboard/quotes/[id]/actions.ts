"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { QuoteStatus } from "@/lib/types";

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  const supabase = createClient();
  await supabase.from("quotes").update({ status }).eq("id", quoteId);
  revalidatePath(`/dashboard/quotes/${quoteId}`);
}

export async function convertQuoteToInvoice(quoteId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();
  if (!quote) throw new Error("Devis introuvable");

  const { data: quoteItems } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order");

  // Génère un numéro de facture séquentiel simple : FAC-0001, FAC-0002...
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const invoiceNumber = `FAC-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      owner_id: user.id,
      client_id: quote.client_id,
      quote_id: quote.id,
      invoice_number: invoiceNumber,
      status: "sent",
      due_date: dueDate.toISOString().slice(0, 10),
      subtotal: quote.subtotal,
      tax_rate: quote.tax_rate,
      total: quote.total,
      currency: quote.currency,
      notes: quote.notes,
    })
    .select()
    .single();

  if (invoiceError || !invoice) {
    throw new Error(invoiceError?.message ?? "Erreur lors de la création de la facture");
  }

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

  await supabase.from("quotes").update({ status: "accepted" }).eq("id", quoteId);

  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard/invoices");
  redirect(`/dashboard/invoices/${invoice.id}`);
}
