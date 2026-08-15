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

  // Historique détaillé des paiements — chaque acompte/solde est enregistré
  // par updateProjectStatusWithPayment (invoice_id, amount, method), avec
  // created_at généré automatiquement par Supabase au moment de la saisie.
  let payments: { id: string; amount: number; method: string | null; created_at: string | null }[] = [];
  try {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("id, amount, method, created_at")
      .eq("invoice_id", params.id)
      .order("created_at", { ascending: true });

    if (!paymentsError && paymentsData) {
      payments = paymentsData as any[];
    }
  } catch {
    // Repli silencieux si la requête échoue pour une raison imprévue.
  }

  const paymentMethodLabels: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank_transfer: "Virement",
    cash: "Espèces",
    card: "Carte",
    other: "Autre",
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

        <h2 className="mb-3 text-sm font-semibold text-ink dark:text-white">
          Historique des paiements
        </h2>

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

        {/* Détail des acomptes / paiements */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-ink dark:text-white">
            Paiements enregistrés
          </h2>

          {payments.length > 0 ? (
            <div className="divide-y divide-paperline rounded-xl border border-paperline dark:divide-white/10 dark:border-white/10">
              {payments.map((p) => (
                <div key={p.id} className="flex flex-col gap-1 px-4 py-3">
                  <p className="text-xs text-[#6B7280] dark:text-white/50">
                    {p.created_at ? formatDateFR(p.created_at) : "—"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-ink dark:text-white">
                      {Number(p.amount).toLocaleString("fr-FR")} {currency}
                    </span>
                    <span className="text-xs font-medium text-[#6B7280] dark:text-white/50">
                      {paymentMethodLabels[p.method ?? ""] ?? "Autre"}
                    </span>
                  </div>
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
