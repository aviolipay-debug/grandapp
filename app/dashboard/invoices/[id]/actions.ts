"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function recordPayment(
  invoiceId: string,
  formData: FormData
) {
  const supabase = createClient();

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method"));

  if (!amount || amount <= 0) return;

  await supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount,
    method,
  });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("total, amount_paid")
    .eq("id", invoiceId)
    .single();

  if (invoice) {
    const newAmountPaid = Number(invoice.amount_paid) + amount;
    const newStatus =
      newAmountPaid >= Number(invoice.total) ? "paid" : "partially_paid";

    await supabase
      .from("invoices")
      .update({ amount_paid: newAmountPaid, status: newStatus })
      .eq("id", invoiceId);
  }

  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  revalidatePath("/dashboard/invoices");
}
