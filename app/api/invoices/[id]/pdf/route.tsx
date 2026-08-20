import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { formatDateFR } from "@/lib/format-date";
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

  // Nom de fichier fixe : FACTURE_N°_{numero}.pdf ou BORDEREAU_N°_{numero}.pdf
  // (ne dépend plus de l'objet).
  const filenameBase = `${kind.toUpperCase()}_N°_${invoice.invoice_number}`;
  const asciiFallback = `${kind.toUpperCase()}_No_${invoice.invoice_number}`;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${asciiFallback}.pdf"; filename*=UTF-8''${encodeURIComponent(filenameBase)}.pdf`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
