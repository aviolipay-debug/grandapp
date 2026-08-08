// app/dashboard/invoices/page.tsx
import Link from "next/link";
import { Receipt, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

export default async function InvoicesPage() {
  const supabase = createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total, amount_paid, currency, due_date, clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink dark:text-white">Factures</h1>
      <p className="mt-1 text-sm text-[#6B7280] dark:text-white/50">
        Les factures naissent d&apos;un devis accepté. Ouvrez un devis pour le convertir.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#262626]">
        {!invoices || invoices.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6B7280] dark:text-white/50">
            Aucune facture pour l&apos;instant.
          </p>
        ) : (
          <div className="divide-y divide-paperline dark:divide-white/10">
            {invoices.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/dashboard/invoices/${inv.id}`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
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
                      {(Number(inv.total) - Number(inv.amount_paid)).toLocaleString("fr-FR")}{" "}
                      {inv.currency}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-[#6B7280] dark:text-white/50">
                      {inv.clients?.name ?? "—"}
                      {inv.due_date ? ` · Échéance ${inv.due_date}` : ""}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        statusStyles[inv.status] ?? "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {statusLabels[inv.status] ?? inv.status}
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} className="hidden shrink-0 text-[#9CA3AF] sm:block" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
