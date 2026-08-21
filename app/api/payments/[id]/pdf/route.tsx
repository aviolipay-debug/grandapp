import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { formatDateFR } from "@/lib/format-date";
import TemplateRecu from "@/lib/pdf/templates/template-recu";
import type { ReceiptData } from "@/lib/pdf/types";

// Le reçu doit toujours refléter les données les plus récentes.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const paymentMethodLabels: Record<string, string> = {
  mobile_money: "Mobile Money",
  bank_transfer: "Virement",
  cash: "Espèces",
  card: "Carte",
  other: "Autre",
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, method, created_at, invoice_id")
    .eq("id", params.id)
    .single();

  if (!payment) {
    return new Response("Paiement introuvable", { status: 404 });
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "invoice_number, objet, clients(name, phone), profiles:owner_id(company_name, company_address, company_logo_url, company_phone, company_contacts)"
    )
    .eq("id", payment.invoice_id)
    .single();

  if (!invoice) {
    return new Response("Facture introuvable pour ce paiement", { status: 404 });
  }

  // Numéro de reçu : dérivé du numéro de facture + rang du paiement pour
  // cette facture (pas de compteur global séparé nécessaire).
  const { data: siblingPayments } = await supabase
    .from("payments")
    .select("id, created_at")
    .eq("invoice_id", payment.invoice_id)
    .order("created_at", { ascending: true });

  const rank =
    (siblingPayments?.findIndex((p) => p.id === payment.id) ?? 0) + 1;
  const receiptNumber = `REC-${(invoice as any).invoice_number}-${String(rank).padStart(2, "0")}`;

  const primaryContact = Array.isArray((invoice as any).profiles?.company_contacts)
    ? (invoice as any).profiles.company_contacts[0]
    : null;
  const companyPhone = primaryContact?.numero
    ? `${primaryContact.indicatif ?? ""} ${primaryContact.numero}`.trim()
    : (invoice as any).profiles?.company_phone ?? null;

  const data: ReceiptData = {
    receiptNumber,
    paymentDate: payment.created_at ? formatDateFR(payment.created_at) : "—",
    amount: Number(payment.amount),
    currency: "FCFA",
    methodLabel: paymentMethodLabels[payment.method ?? ""] ?? "Autre",
    companyName: (invoice as any).profiles?.company_name ?? "Votre entreprise",
    companyLogoUrl: (invoice as any).profiles?.company_logo_url ?? null,
    companyPhone,
    companyAddress: (invoice as any).profiles?.company_address ?? null,
    clientName: (invoice as any).clients?.name ?? "Client",
    clientPhone: (invoice as any).clients?.phone ?? null,
    invoiceNumber: (invoice as any).invoice_number,
    objet: (invoice as any).objet ?? null,
  };

  const stream = await renderToStream(<TemplateRecu data={data} />);

  const filenameBase = `RECU_N°_${receiptNumber}`;
  const asciiFallback = `RECU_No_${receiptNumber}`;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${asciiFallback}.pdf"; filename*=UTF-8''${encodeURIComponent(filenameBase)}.pdf`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
