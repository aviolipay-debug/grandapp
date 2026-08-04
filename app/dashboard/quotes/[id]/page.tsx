import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateQuoteStatus, convertQuoteToInvoice } from "./actions";

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
    .select("*, clients(name, email)")
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

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Devis {quote.quote_number}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{quote.clients?.name}</p>
        </div>
        <a
          href={`/api/quotes/${quote.id}/pdf`}
          target="_blank"
          className="rounded border border-ledger-deep px-4 py-2 text-sm font-semibold text-ledger-deep hover:bg-white"
        >
          Télécharger le PDF
        </a>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <form action={updateQuoteStatus.bind(null, quote.id, "sent")}>
          <StatusPill active={quote.status === "sent"} label="Envoyé" />
        </form>
        <form action={updateQuoteStatus.bind(null, quote.id, "accepted")}>
          <StatusPill active={quote.status === "accepted"} label="Accepté" />
        </form>
        <form action={updateQuoteStatus.bind(null, quote.id, "declined")}>
          <StatusPill active={quote.status === "declined"} label="Refusé" />
        </form>
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-paperline bg-white">
        <table className="w-full text-sm">
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
            className="inline-block rounded bg-ledger-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-stamp"
          >
            Voir la facture générée →
          </a>
        ) : (
          <form action={convertQuoteToInvoice.bind(null, quote.id)}>
            <button
              type="submit"
              className="rounded bg-stamp px-5 py-2.5 text-sm font-semibold text-paper hover:opacity-90"
            >
              Convertir en facture
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <button
      type="submit"
      className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
        active
          ? "border-ledger-deep bg-ledger-deep text-paper"
          : "border-paperline bg-white text-[#4B5563] hover:border-ledger-deep"
      }`}
    >
      {label}
    </button>
  );
}
