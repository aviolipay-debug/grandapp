import { createClient } from "@/lib/supabase/server";

export default async function DashboardOverview() {
  const supabase = createClient();

  const [{ count: clientsCount }, { data: invoices }, { data: quotes }] =
    await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("invoices").select("status,total,amount_paid"),
      supabase.from("quotes").select("status"),
    ]);

  const outstanding =
    invoices
      ?.filter((i) => i.status === "sent" || i.status === "partially_paid")
      .reduce((sum, i) => sum + (Number(i.total) - Number(i.amount_paid)), 0) ?? 0;

  const overdueCount = invoices?.filter((i) => i.status === "overdue").length ?? 0;
  const pendingQuotes = quotes?.filter((q) => q.status === "sent").length ?? 0;

  const stats = [
    { label: "Clients", value: clientsCount ?? 0 },
    { label: "Devis en attente", value: pendingQuotes },
    { label: "Factures en retard", value: overdueCount },
    { label: "Montant en attente", value: `${outstanding.toLocaleString("fr-FR")} CFA` },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ledger-deep">Vue d&apos;ensemble</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-paperline bg-white p-5">
            <div className="font-mono text-xs uppercase tracking-wide text-[#6B7280]">
              {s.label}
            </div>
            <div className="mt-2 font-display text-2xl font-semibold text-ledger-deep">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
