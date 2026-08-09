import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordPayment } from "./actions";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  partially_paid: "Partiellement payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(name, email), quotes(projects(name))")
    .eq("id", params.id)
    .single();

  if (!invoice) notFound();

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", params.id)
    .order("sort_order");

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", params.id)
    .order("paid_at", { ascending: false });

  const remaining = Number(invoice.total) - Number(invoice.amount_paid);
  const boundRecordPayment = recordPayment.bind(null, invoice.id);

  // Le nom du projet (récupéré via le devis d'origine) sert de titre ; à défaut, le numéro de facture.
  const title = invoice.quotes?.projects?.name ?? `Facture ${invoice.invoice_number}`;

  return (
    <div className="max-w-2xl px-4 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-ink break-words">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Facture {invoice.invoice_number} · {invoice.clients?.name} ·{" "}
            {statusLabels[invoice.status] ?? invoice.status}
          </p>
        </div>
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
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
        <div className="space-y-1 border-t border-paperline px-6 py-4 text-right font-mono text-sm">
          <div>Total : {Number(invoice.total).toLocaleString("fr-FR")} {invoice.currency}</div>
          <div className="text-[#6B7280]">
            Payé : {Number(invoice.amount_paid).toLocaleString("fr-FR")} {invoice.currency}
          </div>
          <div className="font-bold text-ink">
            Restant dû : {remaining.toLocaleString("fr-FR")} {invoice.currency}
          </div>
        </div>
      </div>

      {remaining > 0 && (
        <div className="mt-8 rounded-md border border-paperline bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Enregistrer un paiement
          </h2>
          <form
            action={boundRecordPayment}
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="w-full sm:w-40">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Montant
              </label>
              <input
                name="amount"
                type="number"
                min={0}
                max={remaining}
                step="0.01"
                required
                className="w-full rounded border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Méthode
              </label>
              <select
                name="method"
                className="w-full rounded border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none sm:w-auto"
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Virement</option>
                <option value="cash">Espèces</option>
                <option value="card">Carte</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-ledger-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-stamp sm:w-auto"
            >
              Enregistrer
            </button>
          </form>
        </div>
      )}

      {payments && payments.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-ink">
            Historique des paiements
          </h2>
          <div className="mt-3 divide-y divide-paperline rounded-md border border-paperline bg-white">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-1 px-6 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2"
              >
                <span className="text-[#374151]">
                  {new Date(p.paid_at).toLocaleDateString("fr-FR")} — {p.method}
                </span>
                <span className="font-mono text-ink">
                  {Number(p.amount).toLocaleString("fr-FR")} {invoice.currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
