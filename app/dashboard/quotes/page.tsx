import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  declined: "Refusé",
  expired: "Expiré",
};

export default async function QuotesPage() {
  const supabase = createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, quote_number, status, total, currency, issue_date, clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ledger-deep">Devis</h1>
        <Link
          href="/dashboard/quotes/new"
          className="rounded bg-ledger-deep px-4 py-2 text-sm font-semibold text-paper hover:bg-stamp"
        >
          Nouveau devis
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-paperline bg-white">
        {!quotes || quotes.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#8a8368]">
            Aucun devis pour l&apos;instant.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paperline text-left font-mono text-xs uppercase tracking-wide text-[#8a8368]">
                <th className="px-6 py-3 font-medium">N°</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q: any) => (
                <tr key={q.id} className="border-b border-paperline last:border-0">
                  <td className="px-6 py-4 font-medium text-ledger-deep">
                    <Link href={`/dashboard/quotes/${q.id}`} className="hover:text-stamp">
                      {q.quote_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#3A3527]">{q.clients?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-[#3A3527]">
                    {statusLabels[q.status] ?? q.status}
                  </td>
                  <td className="px-6 py-4 text-[#3A3527]">{q.issue_date}</td>
                  <td className="px-6 py-4 text-right font-mono text-ledger-deep">
                    {Number(q.total).toLocaleString("fr-FR")} {q.currency}
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
