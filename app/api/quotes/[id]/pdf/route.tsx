import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { formatDateFR } from "@/lib/format-date";
import DocumentPDF from "@/lib/pdf/document";
export const dynamic = "force-dynamic";
export const revalidate = 0;
headers: {
  "Content-Type": "application/pdf",
  "Content-Disposition": `inline; filename="${asciiFallback}.pdf"; filename*=UTF-8''${encodeURIComponent(filenameBase)}.pdf`,
  "Cache-Control": "no-store, max-age=0",
},
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select(
      "*, clients(name, email, address, phone), profiles:owner_id(company_name, company_address, company_logo_url, company_phone, company_contacts, invoice_template)"
    )
    .eq("id", params.id)
    .single();
  if (!quote) {
    return new Response("Devis introuvable", { status: 404 });
  }
  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", params.id)
    .order("sort_order");

  // Numéro affiché sous l'ÉMETTEUR = le "Contact primaire" saisi dans le
  // profil (profiles.company_contacts[0]), pas l'ancien champ company_phone.
  const primaryContact = Array.isArray(quote.profiles?.company_contacts)
    ? quote.profiles.company_contacts[0]
    : null;
  const emitterPhone = primaryContact?.numero
    ? `${primaryContact.indicatif ?? ""} ${primaryContact.numero}`.trim()
    : quote.profiles?.company_phone ?? null;

  const stream = await renderToStream(
    <DocumentPDF
      templateId={quote.profiles?.invoice_template}
      data={{
        kind: "Devis",
        number: quote.quote_number,
        objet: quote.objet ?? null,
        issueDate: formatDateFR(quote.issue_date),
        dueOrExpiryDate: formatDateFR(quote.expiry_date) || null,
        companyName: quote.profiles?.company_name ?? "Votre entreprise",
        companyAddress: quote.profiles?.company_address ?? null,
        companyLogoUrl: quote.profiles?.company_logo_url ?? null,
        companyPhone: emitterPhone,
        clientName: quote.clients?.name ?? "Client",
        clientPhone: quote.clients?.phone ?? null,
        clientEmail: quote.clients?.email ?? null,
        clientAddress: quote.clients?.address ?? null,
        items: items ?? [],
        subtotal: Number(quote.subtotal),
        discountRate: quote.discount_rate != null ? Number(quote.discount_rate) : null,
        taxRate: Number(quote.tax_rate),
        total: Number(quote.total),
        currency: quote.currency,
        notes: quote.notes,
      }}
    />
  );

  // Nom de fichier fixe : DEVIS_N°_{numero}.pdf (ne dépend plus de l'objet).
  const filenameBase = `DEVIS_N°_${quote.quote_number}`;
  const asciiFallback = `DEVIS_No_${quote.quote_number}`;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${asciiFallback}.pdf"; filename*=UTF-8''${encodeURIComponent(filenameBase)}.pdf`,
    },
  });
}
