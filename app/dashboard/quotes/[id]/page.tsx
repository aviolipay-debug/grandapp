import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { convertQuoteToInvoice } from "./actions";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  declined: "Refusé",
  expired: "Expiré",
};

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(name, email), projects(name)")
    .eq("id", params.id)
    .single();

  if (!quote) notFound();

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", params.id)
    .order("sort_order");

  const { data: existingInvoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("quote_id", params.id)
    .maybeSingle();

  // Le nom du projet sert de titre ; à défaut (ancien devis sans projet), on retombe sur le numéro.
  const title = quote.projects?.name ?? `Devis ${quote.quote_number}`;

  return (
    <div className="max-w-2xl px-4 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-ink break-words">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Devis {quote.quote_number} · {quote.clients?.name}
          </p>
        </div>
        <a
          href={`/api/quotes/${quote.id}/pdf`}
          target="_blank"
          className="inline-flex items-center justify-center rounded border border-ledger-deep px-4 py-2 text-sm font-semibold text-ledger-deep hover:bg-white w-full sm:w-auto shrink-0"
        >
          Télécharger le PDF
        </a>
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-paperline bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-paperline text-left font-mono text-xs uppercase tracking-wide text-[#6B7280]">
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 text-right font-medium">Qté</th>
                <th className="px-6 py-3 text-right font-medium">Prix</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id} className="border-b border-paperline last:border-0">
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-mono">
                    {Number(item.unit_price).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 text-right font-mono">
                    {Number(item.line_total).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-paperline px-6 py-4">
          <div className="font-mono text-base font-bold text-ink">
            Total : {Number(quote.total).toLocaleString("fr-FR")} {quote.currency}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {existingInvoice ? (
          <a
            href={`/dashboard/invoices/${existingInvoice.id}`}
            className="inline-flex w-full items-center justify-center rounded bg-ledger-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-stamp sm:w-auto"
          >
            Voir la facture générée →
          </a>
        ) : (
          <form action={convertQuoteToInvoice.bind(null, quote.id)}>
            <button
              type="submit"
              className="w-full rounded bg-stamp px-5 py-2.5 text-sm font-semibold text-paper hover:opacity-90 sm:w-auto"
            >
              Convertir en facture
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
