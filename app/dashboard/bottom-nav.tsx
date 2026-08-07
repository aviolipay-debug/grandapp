// app/dashboard/bottom-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Users, UserCircle2, FileText, Receipt } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [financeOpen, setFinanceOpen] = useState(false);

  const isFinance =
    pathname?.startsWith("/dashboard/quotes") ||
    pathname?.startsWith("/dashboard/invoices");
  const isHome = pathname === "/dashboard";
  const isGestion = pathname?.startsWith("/dashboard/clients");
  const isProfil = pathname?.startsWith("/onboarding");

  return (
    <>
      {/* Sheet Finance : choix Devis / Factures */}
      {financeOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setFinanceOpen(false)}
          />
          <div className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl border-t border-paperline bg-white p-3 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
            <Link
              href="/dashboard/quotes"
              onClick={() => setFinanceOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink hover:bg-[#F3EEFC] dark:text-white dark:hover:bg-white/10"
            >
              <FileText size={18} />
              Devis
            </Link>
            <Link
              href="/dashboard/invoices"
              onClick={() => setFinanceOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink hover:bg-[#F3EEFC] dark:text-white dark:hover:bg-white/10"
            >
              <Receipt size={18} />
              Factures
            </Link>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-paperline bg-white pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold ${
            isHome ? "text-ledger-deep dark:text-ledger" : "text-ink/60 dark:text-white/60"
          }`}
        >
          <Home size={20} />
          Accueil
        </Link>

        <button
          onClick={() => setFinanceOpen((v) => !v)}
          className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold ${
            isFinance || financeOpen
              ? "text-ledger-deep dark:text-ledger"
              : "text-ink/60 dark:text-white/60"
          }`}
        >
          <Wallet size={20} />
          Finance
        </button>

        <Link
          href="/dashboard/clients"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold ${
            isGestion ? "text-ledger-deep dark:text-ledger" : "text-ink/60 dark:text-white/60"
          }`}
        >
          <Users size={20} />
          Gestion
        </Link>

        <Link
          href="/onboarding"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold ${
            isProfil ? "text-ledger-deep dark:text-ledger" : "text-ink/60 dark:text-white/60"
          }`}
        >
          <UserCircle2 size={20} />
          Profil
        </Link>
      </nav>
    </>
  );
}
