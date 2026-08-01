import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import DocumentPDF from "@/lib/pdf/document";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(name, email, address), profiles:owner_id(company_name, company_address)")
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

  const stream = await renderToStream(
    <DocumentPDF
      data={{
        kind: "Devis",
        number: quote.quote_number,
        issueDate: quote.issue_date,
        dueOrExpiryDate: quote.expiry_date,
        companyName: quote.profiles?.company_name ?? "Votre entreprise",
        companyAddress: quote.profiles?.company_address ?? null,
        clientName: quote.clients?.name ?? "Client",
        clientEmail: quote.clients?.email ?? null,
        clientAddress: quote.clients?.address ?? null,
        items: items ?? [],
        subtotal: Number(quote.subtotal),
        taxRate: Number(quote.tax_rate),
        total: Number(quote.total),
        currency: quote.currency,
        notes: quote.notes,
      }}
    />
  );

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="devis-${quote.quote_number}.pdf"`,
    },
  });
}
