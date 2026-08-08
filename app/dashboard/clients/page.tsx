// app/dashboard/clients/page.tsx
import Link from "next/link";
import { Building2, User, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink dark:text-white">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="rounded-lg bg-ledger-deep px-4 py-2.5 text-sm font-semibold text-paper hover:bg-stamp"
        >
          Nouveau client
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#262626]">
        {!clients || clients.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6B7280] dark:text-white/50">
            Aucun client pour l&apos;instant. Ajoutez-en un pour créer votre premier devis.
          </p>
        ) : (
          <div className="divide-y divide-paperline dark:divide-white/10">
            {(clients as Client[]).map((c: any) => (
              <Link
                key={c.id}
                href={`/dashboard/clients/${c.id}`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2A89DA] dark:bg-white/10">
                  {c.type === "entreprise" ? <Building2 size={18} /> : <User size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-ink dark:text-white">{c.name}</p>
                    {c.type && (
                      <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B7280] dark:bg-white/10 dark:text-white/60">
                        {c.type === "entreprise" ? "Entreprise" : "Particulier"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-[#6B7280] dark:text-white/50">
                    {c.email ?? "—"}
                    {c.phone ? ` · ${c.phone}` : ""}
                  </p>
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
