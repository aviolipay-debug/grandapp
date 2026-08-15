// app/dashboard/invoices/[id]/page.tsx
import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateFR } from "@/lib/format-date";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, invoice_number, total, amount_paid, currency, due_date, clients(name)")
    .eq("id", params.id)
    .single();

  if (!invoice) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-[#6B7280] dark:text-white/50">Facture introuvable.</p>
        <Link
          href="/dashboard/invoices"
          className="text-sm font-semibold text-ledger-deep dark:text-ledger"
        >
          Retour aux factures
        </Link>
      </div>
    );
  }

  const total = Number((invoice as any).total);
  const paid = Number((invoice as any).amount_paid);
  const remaining = total - paid;
  const currency = (invoice as any).currency ?? "FCFA";
  const clientName = (invoice as any).clients?.name ?? "—";

  // Historique détaillé des paiements — table optionnelle. Si elle n'existe
  // pas encore (ou si les colonnes diffèrent), on se rabat silencieusement
  // sur l'affichage du seul montant total encaissé, sans faire planter la page.
  let payments: { id: string; amount: number; payment_date: string | null; type: string | null }[] = [];
  try {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("id, amount, payment_date, type")
      .eq("invoice_id", params.id)
      .order("payment_date", { ascending: true });

    if (!paymentsError && paymentsData) {
      payments = paymentsData as any[];
    }
  } catch {
    // Table absente ou schéma différent — on ignore et on utilise le repli.
  }

  const paymentTypeLabels: Record<string, string> = {
    acompte: "Acompte",
    solde: "Solde",
    partial: "Acompte",
    full: "Solde",
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-paperline bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#262626] dark:shadow-none sm:p-8">
        <Link
          href="/dashboard/invoices"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-ink dark:text-white/50 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7FAF9] text-[#00A6AC] dark:bg-white/10">
            <Receipt size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-ink dark:text-white">
              {(invoice as any).invoice_number}
            </p>
            <p className="truncate text-sm text-[#6B7280] dark:text-white/50">{clientName}</p>
          </div>
        </div>

        {/* Résumé Total / Payé / Restant dû */}
        <div className="divide-y divide-paperline rounded-xl border border-paperline dark:divide-white/10 dark:border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[#6B7280] dark:text-white/50">Total</span>
            <span className="font-mono text-sm font-bold text-ink dark:text-white">
              {total.toLocaleString("fr-FR")} {currency}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[#6B7280] dark:text-white/50">Payé</span>
            <span className="font-mono text-sm font-bold text-[#00A6AC]">
              {paid.toLocaleString("fr-FR")} {currency}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[#6B7280] dark:text-white/50">Restant dû</span>
            <span className="font-mono text-sm font-bold text-[#E5533F]">
              {remaining.toLocaleString("fr-FR")} {currency}
            </span>
          </div>
        </div>

        {/* Historique des acomptes / paiements */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-ink dark:text-white">
            Historique des paiements
          </h2>

          {payments.length > 0 ? (
            <div className="divide-y divide-paperline rounded-xl border border-paperline dark:divide-white/10 dark:border-white/10">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink dark:text-white">
                      {paymentTypeLabels[p.type ?? ""] ?? "Paiement"}
                    </p>
                    {p.payment_date && (
                      <p className="text-xs text-[#6B7280] dark:text-white/50">
                        {formatDateFR(p.payment_date)}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink dark:text-white">
                    {Number(p.amount).toLocaleString("fr-FR")} {currency}
                  </span>
                </div>
              ))}
            </div>
          ) : paid > 0 ? (
            // Repli : pas de détail par versement disponible, on affiche le total encaissé.
            <div className="rounded-xl border border-paperline px-4 py-3 dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink dark:text-white">Paiement enregistré</p>
                <span className="font-mono text-sm font-semibold text-ink dark:text-white">
                  {paid.toLocaleString("fr-FR")} {currency}
                </span>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-paperline px-4 py-6 text-center text-sm text-[#6B7280] dark:border-white/15 dark:text-white/50">
              Aucun paiement enregistré pour cette facture.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
