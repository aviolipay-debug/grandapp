// app/dashboard/invoices/page.tsx
import Link from "next/link";
import { Receipt, ChevronRight, Wallet, Clock, AlertTriangle, FileStack } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateFR } from "@/lib/format-date";
import { poppins } from "@/lib/fonts";
import PaymentHistoryChart from "./payment-history-chart";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  partially_paid: "Partiellement payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

const statusStyles: Record<string, string> = {
  draft: "bg-[#F3F4F6] text-[#6B7280]",
  sent: "bg-[#EAF3FC] text-[#2A89DA]",
  paid: "bg-[#E7FAF9] text-[#00A6AC]",
  partially_paid: "bg-[#FFF4E5] text-[#B4690E]",
  overdue: "bg-[#FDEBEA] text-[#E5533F]",
  cancelled: "bg-[#F3F4F6] text-[#6B7280]",
};

// Le champ `status` en base ne passe jamais automatiquement à "overdue" —
// on calcule donc le statut réellement affiché à partir de la date
// d'échéance, plutôt que de se fier uniquement à la colonne stockée.
function getEffectiveStatus(inv: {
  status: string;
  due_date: string | null;
  total: number;
  amount_paid: number;
}): string {
  if (inv.status === "paid" || inv.status === "cancelled") return inv.status;
  const remaining = Number(inv.total) - Number(inv.amount_paid);
  if (remaining <= 0) return "paid";
  if (inv.due_date && new Date(inv.due_date) < new Date(new Date().toDateString())) {
    return "overdue";
  }
  if (Number(inv.amount_paid) > 0) return "partially_paid";
  return inv.status;
}

export default async function InvoicesPage() {
  const supabase = createClient();

  // On ne récupère que les Factures — les Bordereaux de livraison ne
  // représentent pas un encaissement et fausseraient les totaux financiers.
  const { data: invoicesData } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total, amount_paid, currency, due_date, created_at, clients(name)")
    .eq("document_type", "facture")
    .order("created_at", { ascending: false });

  const invoices = (invoicesData ?? []) as any[];
  const currency = invoices[0]?.currency ?? "FCFA";

  const totalEncaisse = invoices.reduce((sum, inv) => sum + Number(inv.amount_paid), 0);

  const totalRestantDu = invoices.reduce((sum, inv) => {
    const remaining = Number(inv.total) - Number(inv.amount_paid);
    return inv.status !== "cancelled" && remaining > 0 ? sum + remaining : sum;
  }, 0);

  const facturesEnRetard = invoices.filter((inv) => getEffectiveStatus(inv) === "overdue").length;

  // Historique des paiements — somme de amount_paid groupée par mois de
  // création de la facture (created_at), triée chronologiquement.
  const monthlyMap = new Map<string, { label: string; total: number }>();
  for (const inv of invoices) {
    if (!inv.created_at) continue;
    const d = new Date(inv.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const amount = Number(inv.amount_paid);
    const existing = monthlyMap.get(key);
    if (existing) {
      existing.total += amount;
    } else {
      monthlyMap.set(key, { label, total: amount });
    }
  }
  const monthlyPaymentsAll = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({ key, month: v.label, total: v.total }));

  // On n'affiche que les 6 derniers mois sur la carte, comme la maquette.
  const monthlyPayments = monthlyPaymentsAll.slice(-6).map(({ month, total }) => ({ month, total }));

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthTotal =
    monthlyPaymentsAll.find((m) => m.key === currentMonthKey)?.total ?? 0;
  const periodTotal = monthlyPayments.reduce((sum, m) => sum + m.total, 0);

  const stats = {
    encaisse: totalEncaisse,
    restantDu: totalRestantDu,
    enRetard: facturesEnRetard,
    total: invoices.length,
  };

  return (
    <div className={poppins.className}>
      <h1 className="hidden font-display text-2xl font-bold text-ink dark:text-white sm:block">Finances</h1>
      <p className="mt-1 hidden text-sm text-[#6B7280] dark:text-white/50 sm:block">
        Vue d&apos;ensemble de vos encaissements et factures.
      </p>

      {/* Vue d'ensemble */}
      <div className="mt-3 grid grid-cols-2 gap-4 sm:mt-6 lg:grid-cols-4">
        <StatCard
          label="Encaissé"
          value={stats.encaisse.toLocaleString("fr-FR")}
          subtitle={currency}
          accent="#00C4CC"
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Factures"
          value={stats.total}
          subtitle="émises"
          accent="#7D2AE7"
          icon={<FileStack size={18} />}
        />
        <StatCard
          label="Factures"
          value={stats.enRetard}
          subtitle="en retard"
          accent="#E5533F"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Restant dû"
          value={stats.restantDu.toLocaleString("fr-FR")}
          subtitle={currency}
          accent="#2A89DA"
          icon={<Clock size={18} />}
        />
      </div>

      {/* Historique des paiements */}
      <div className="mt-6">
        <PaymentHistoryChart
          data={monthlyPayments}
          currency={currency}
          currentMonthTotal={currentMonthTotal}
          periodTotal={periodTotal}
        />
      </div>

      {/* Liste des factures */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#262626]">
        {invoices.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6B7280] dark:text-white/50">
            Aucune facture pour l&apos;instant. Elles sont générées automatiquement quand un
            projet passe "En cours".
          </p>
        ) : (
          <div className="divide-y divide-paperline dark:divide-white/10">
            {invoices.slice(0, 5).map((inv) => {
              const remaining = Number(inv.total) - Number(inv.amount_paid);
              const effectiveStatus = getEffectiveStatus(inv);
              return (
                <Link
                  key={inv.id}
                  href={`/dashboard/invoices/${inv.id}`}
                  className="flex items-center gap-3 px-3 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7FAF9] text-[#00A6AC] dark:bg-white/10">
                    <Receipt size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-ink dark:text-white">
                        {inv.invoice_number}
                      </p>
                      <p className="shrink-0 font-mono text-sm font-semibold text-ink dark:text-white">
                        {remaining > 0
                          ? `${remaining.toLocaleString("fr-FR")} ${inv.currency}`
                          : "Payée"}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-[#6B7280] dark:text-white/50">
                        {inv.clients?.name ?? "—"}
                        {inv.due_date ? ` · Échéance ${formatDateFR(inv.due_date)}` : ""}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          statusStyles[effectiveStatus] ?? "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        {statusLabels[effectiveStatus] ?? effectiveStatus}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="hidden shrink-0 text-[#9CA3AF] sm:block" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white px-3 py-4 text-ink dark:border-white/10 dark:bg-[#262626] dark:text-white sm:p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: accent }}
        >
          {icon}
        </div>
      </div>
      <p className="font-display mt-4 whitespace-nowrap text-2xl font-extrabold sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-[#9CA3AF]">{subtitle}</p>
    </div>
  );
}
