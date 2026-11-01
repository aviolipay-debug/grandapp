// app/dashboard/bottom-nav.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Users, UserCircle2, FileText } from "lucide-react";
import { poppins } from "@/lib/fonts";

// Onglet actif = carte violette à faible opacité, texte/icône violet plein.
// Onglet inactif = gris secondaire.
const TAB_BASE =
  "mx-1 flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition-colors";
const TAB_ACTIVE = "bg-ledger/10 text-ledger dark:bg-ledger-light/15 dark:text-ledger-light";
const TAB_IDLE = "text-muted dark:text-white/60";

export default function BottomNav() {
  const pathname = usePathname();
  const [gestionOpen, setGestionOpen] = useState(false);
  const pushedHistoryRef = useRef(false);

  // Ferme automatiquement la popup Gestion à chaque changement de page —
  // sinon elle reste affichée si on quitte la page autrement qu'en cliquant
  // sur "Clients"/"Devis" à l'intérieur (autre lien, etc.).
  useEffect(() => {
    setGestionOpen(false);
    pushedHistoryRef.current = false;
  }, [pathname]);

  // Quand la popup s'ouvre, on ajoute une entrée d'historique factice.
  // Ainsi, un appui sur le bouton "retour" du téléphone ferme d'abord la
  // popup (elle consomme cette entrée) au lieu de faire quitter la page.
  useEffect(() => {
    if (gestionOpen) {
      window.history.pushState({ gestionSheet: true }, "");
      pushedHistoryRef.current = true;
    }
  }, [gestionOpen]);

  useEffect(() => {
    function handlePopState() {
      if (gestionOpen) {
        pushedHistoryRef.current = false;
        setGestionOpen(false);
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [gestionOpen]);

  const isHome = pathname === "/dashboard";
  const isFinance = pathname?.startsWith("/dashboard/invoices");
  const isGestion =
    pathname?.startsWith("/dashboard/clients") || pathname?.startsWith("/dashboard/quotes");
  const isProfil = pathname?.startsWith("/dashboard/profile") || pathname?.startsWith("/onboarding");

  // Ferme la popup en consommant l'entrée d'historique factice si elle existe,
  // sans naviguer ailleurs (utilisé pour le fond noir et le bouton Gestion).
  function closeGestion() {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      window.history.back();
    } else {
      setGestionOpen(false);
    }
  }

  return (
    <>
      {/* Sheet Gestion : choix Clients / Devis, même style de cartes que "Nouveau client" */}
      {gestionOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeGestion}
          />
          <div className={`fixed bottom-[68px] left-0 right-0 z-50 rounded-t-2xl border-t border-paperline bg-white p-4 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden ${poppins.className}`}>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard/clients"
                onClick={() => setGestionOpen(false)}
                className="flex flex-col items-center gap-3 rounded-2xl border border-paperline bg-white p-6 text-center transition-colors hover:border-ledger dark:border-white/10 dark:bg-[#262626]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ledger-soft text-ledger dark:bg-white/10 dark:text-ledger-light">
                  <Users size={22} />
                </div>
                <div>
                  <div className="font-display font-semibold text-ink dark:text-white">
                    Clients
                  </div>
                  <div className="text-xs text-muted dark:text-white/50">
                    Voir et gérer vos clients
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/quotes"
                onClick={() => setGestionOpen(false)}
                className="flex flex-col items-center gap-3 rounded-2xl border border-paperline bg-white p-6 text-center transition-colors hover:border-ledger dark:border-white/10 dark:bg-[#262626]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ledger-soft text-ledger dark:bg-white/10 dark:text-ledger-light">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="font-display font-semibold text-ink dark:text-white">
                    Devis
                  </div>
                  <div className="text-xs text-muted dark:text-white/50">
                    Voir et gérer vos devis
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-paperline bg-white px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-[#2F2F2F] md:hidden ${poppins.className}`}>
        <Link
          href="/dashboard"
          onClick={() => setGestionOpen(false)}
          className={`${TAB_BASE} ${isHome ? TAB_ACTIVE : TAB_IDLE}`}
        >
          <Home size={20} />
          Accueil
        </Link>
        <Link
          href="/dashboard/invoices"
          onClick={() => setGestionOpen(false)}
          className={`${TAB_BASE} ${isFinance ? TAB_ACTIVE : TAB_IDLE}`}
        >
          <Wallet size={20} />
          Finances
        </Link>
        <button
          onClick={() => (gestionOpen ? closeGestion() : setGestionOpen(true))}
          className={`${TAB_BASE} ${isGestion || gestionOpen ? TAB_ACTIVE : TAB_IDLE}`}
        >
          <Users size={20} />
          Gestion
        </button>
        <Link
          href="/dashboard/profile"
          onClick={() => setGestionOpen(false)}
          className={`${TAB_BASE} ${isProfil ? TAB_ACTIVE : TAB_IDLE}`}
        >
          <UserCircle2 size={20} />
          Profil
        </Link>
      </nav>
    </>
  );
}
