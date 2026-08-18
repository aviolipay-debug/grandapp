import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { formatDateFR } from "@/lib/format-date";
import { slugifyFilename } from "@/lib/slugify-filename";
import DocumentPDF from "@/lib/pdf/document";

// Le PDF doit toujours refléter les données les plus récentes (client,
// paiements, profil) — on désactive tout cache Next.js sur cette route.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "*, clients(name, email, address, phone), profiles:owner_id(company_name, company_address, company_logo_url, company_phone, company_contacts, invoice_template)"
    )
    .eq("id", params.id)
    .single();
  if (!invoice) {
    return new Response("Facture introuvable", { status: 404 });
  }

  // Débogage temporaire — visible dans Vercel → Logs. À retirer une fois
  // le problème du numéro client manquant sur le PDF résolu.
  console.log("DEBUG invoice.clients:", JSON.stringify(invoice.clients));
  console.log("DEBUG invoice.client_id:", invoice.client_id);
  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", params.id)
    .order("sort_order");
  const kind = invoice.document_type === "bordereau" ? "Bordereau" : "Facture";

  // Numéro affiché sous l'ÉMETTEUR = le "Contact primaire" saisi dans le
  // profil (profiles.company_contacts[0]), pas l'ancien champ company_phone.
  const primaryContact = Array.isArray(invoice.profiles?.company_contacts)
    ? invoice.profiles.company_contacts[0]
    : null;
  const emitterPhone = primaryContact?.numero
    ? `${primaryContact.indicatif ?? ""} ${primaryContact.numero}`.trim()
    : invoice.profiles?.company_phone ?? null;

  const stream = await renderToStream(
    <DocumentPDF
      templateId={invoice.profiles?.invoice_template}
      data={{
        kind,
        number: invoice.invoice_number,
        objet: invoice.objet ?? null,
        issueDate: formatDateFR(invoice.issue_date),
        dueOrExpiryDate: formatDateFR(invoice.due_date) || null,
        companyName: invoice.profiles?.company_name ?? "Votre entreprise",
        companyAddress: invoice.profiles?.company_address ?? null,
        companyLogoUrl: invoice.profiles?.company_logo_url ?? null,
        companyPhone: emitterPhone,
        clientName: invoice.clients?.name ?? "Client",
        clientPhone: invoice.clients?.phone ?? null,
        clientEmail: invoice.clients?.email ?? null,
        clientAddress: invoice.clients?.address ?? null,
        items: items ?? [],
        subtotal: Number(invoice.subtotal),
        discountRate: invoice.discount_rate != null ? Number(invoice.discount_rate) : null,
        taxRate: Number(invoice.tax_rate),
        total: Number(invoice.total),
        amountPaid: Number(invoice.amount_paid) || 0,
        currency: invoice.currency,
        notes: invoice.notes,
      }}
    />
  );
  const filename = slugifyFilename(
    invoice.objet,
    `${invoice.document_type}-${invoice.invoice_number}`
  );
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}.pdf"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
