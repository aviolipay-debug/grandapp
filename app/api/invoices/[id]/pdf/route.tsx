import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import DocumentPDF from "@/lib/pdf/document";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "*, clients(name, email, address), profiles:owner_id(company_name, company_address, company_logo_url, company_phone, invoice_template)"
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

  const stream = await renderToStream(
    <DocumentPDF
      templateId={invoice.profiles?.invoice_template}
      data={{
        kind,
        number: invoice.invoice_number,
        objet: invoice.objet ?? null,
        issueDate: invoice.issue_date,
        dueOrExpiryDate: invoice.due_date,
        companyName: invoice.profiles?.company_name ?? "Votre entreprise",
        companyAddress: invoice.profiles?.company_address ?? null,
        companyLogoUrl: invoice.profiles?.company_logo_url ?? null,
        companyPhone: invoice.profiles?.company_phone ?? null,
        clientName: invoice.clients?.name ?? "Client",
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

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.document_type}-${invoice.invoice_number}.pdf"`,
    },
  });
}
