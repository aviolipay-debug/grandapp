import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  partially_paid: "Partiellement payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

export default async function InvoicesPage() {
  const supabase = createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total, amount_paid, currency, due_date, clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ledger-deep">Factures</h1>
      <p className="mt-1 text-sm text-[#6B7280]">
        Les factures naissent d&apos;un devis accepté. Ouvrez un devis pour le convertir.
      </p>

      <div className="mt-8 overflow-hidden rounded-md border border-paperline bg-white">
        {!invoices || invoices.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#6B7280]">
            Aucune facture pour l&apos;instant.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paperline text-left font-mono text-xs uppercase tracking-wide text-[#6B7280]">
                <th className="px-6 py-3 font-medium">N°</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Échéance</th>
                <th className="px-6 py-3 font-medium text-right">Restant dû</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-paperline last:border-0">
                  <td className="px-6 py-4 font-medium text-ledger-deep">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="hover:text-stamp">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#374151]">{inv.clients?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-[#374151]">
                    {statusLabels[inv.status] ?? inv.status}
                  </td>
                  <td className="px-6 py-4 text-[#374151]">{inv.due_date ?? "—"}</td>
                  <td className="px-6 py-4 text-right font-mono text-ledger-deep">
                    {(Number(inv.total) - Number(inv.amount_paid)).toLocaleString("fr-FR")}{" "}
                    {inv.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
