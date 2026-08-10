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
      {/* Sheet Gestion : choix Clients / Devis, même style de cartes que "Nouveau client" */}
      {gestionOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setGestionOpen(false)}
          />
          <div className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl border-t border-paperline bg-white p-4 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard/clients"
                onClick={() => setGestionOpen(false)}
                className="flex flex-col items-center gap-3 rounded-2xl border border-paperline bg-white p-6 text-center transition-colors hover:border-ledger-deep dark:border-white/10 dark:bg-[#262626]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFC] text-ledger-deep dark:bg-white/10">
                  <Users size={22} />
                </div>
                <div>
                  <div className="font-display font-semibold text-ink dark:text-white">
                    Clients
                  </div>
                  <div className="text-xs text-[#6B7280] dark:text-white/50">
                    Voir et gérer vos clients
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/quotes"
                onClick={() => setGestionOpen(false)}
                className="flex flex-col items-center gap-3 rounded-2xl border border-paperline bg-white p-6 text-center transition-colors hover:border-ledger-deep dark:border-white/10 dark:bg-[#262626]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFC] text-ledger-deep dark:bg-white/10">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="font-display font-semibold text-ink dark:text-white">
                    Devis
                  </div>
                  <div className="text-xs text-[#6B7280] dark:text-white/50">
                    Voir et gérer vos devis
                  </div>
                </div>
              </Link>
            </div>
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
