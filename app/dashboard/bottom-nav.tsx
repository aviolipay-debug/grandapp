// app/dashboard/bottom-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Users, UserCircle2, FileText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [gestionOpen, setGestionOpen] = useState(false);

  const isHome = pathname === "/dashboard";
  const isFinance = pathname?.startsWith("/dashboard/invoices");
  const isGestion =
    pathname?.startsWith("/dashboard/clients") || pathname?.startsWith("/dashboard/quotes");
  const isProfil = pathname?.startsWith("/onboarding");

  return (
    <>
      {/* Sheet Gestion : choix Clients / Devis */}
      {gestionOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setGestionOpen(false)}
          />
          <div className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl border-t border-paperline bg-white p-3 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
            <Link
              href="/dashboard/clients"
              onClick={() => setGestionOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink hover:bg-[#F3EEFC] dark:text-white dark:hover:bg-white/10"
            >
              <Users size={18} />
              Clients
            </Link>
            <Link
              href="/dashboard/quotes"
              onClick={() => setGestionOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink hover:bg-[#F3EEFC] dark:text-white dark:hover:bg-white/10"
            >
              <FileText size={18} />
              Devis
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

        <Link
          href="/dashboard/invoices"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold ${
            isFinance ? "text-ledger-deep dark:text-ledger" : "text-ink/60 dark:text-white/60"
          }`}
        >
          <Wallet size={20} />
          Finance
        </Link>

        <button
          onClick={() => setGestionOpen((v) => !v)}
          className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold ${
            isGestion || gestionOpen
              ? "text-ledger-deep dark:text-ledger"
              : "text-ink/60 dark:text-white/60"
          }`}
        >
          <Users size={20} />
          Gestion
        </button>

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
