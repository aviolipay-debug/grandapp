// app/dashboard/invoices/finance-pin-gate.tsx
"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { verifyFinancePin } from "./actions";

// Écran de verrouillage : ne reçoit plus jamais le hash du PIN ni les
// données protégées (children a été supprimé). La vérification se fait
// entièrement côté serveur via la Server Action verifyFinancePin — en cas
// de succès, un cookie httpOnly signé est posé côté serveur et on rafraîchit
// la page (router.refresh) pour que le Server Component parent (page.tsx)
// recharge et affiche les vraies données.
//
// Champ classique (texte simple) plutôt qu'un style "4 cases + input caché" :
// un champ visible reçoit le focus natif immédiatement, sans le léger délai
// d'ouverture du clavier observé sur mobile avec un input de taille quasi
// nulle superposé à des cases décoratives.
export default function FinancePinGate() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (digits.length !== 4) return;

    setError(false);
    startTransition(async () => {
      const result = await verifyFinancePin(digits);
      if (result.success) {
        router.refresh();
      } else {
        setError(true);
        setDigits("");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  return (
    // justify-end (au lieu d'un centrage vertical) : la carte s'affiche tout
    // près du bas de l'écran, là où le clavier numérique du téléphone va
    // s'ouvrir, pour qu'il n'y ait aucun espace visible entre les deux.
    <div className="flex min-h-[50vh] flex-col justify-end px-4 pb-4 sm:min-h-[60vh] sm:justify-center sm:pb-0">
      <div className="mx-auto w-full max-w-xs rounded-2xl border border-paperline bg-white p-5 text-center shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#262626] dark:shadow-none sm:p-8">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-ledger-deep text-white sm:mb-4 sm:h-12 sm:w-12">
          <ShieldCheck size={18} className="sm:hidden" />
          <ShieldCheck size={22} className="hidden sm:block" />
        </div>
        <h2 className="font-display text-base font-bold text-ink dark:text-white sm:text-lg">
          Zone protégée
        </h2>
        <p className="mt-1 text-xs text-[#6B7280] dark:text-white/50 sm:mt-1.5 sm:text-sm">
          Entrez votre code PIN pour accéder à vos finances.
        </p>

        <div className="mt-4 sm:mt-6">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            autoFocus
            value={digits}
            disabled={isPending}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            className={`w-full rounded-xl border bg-[#F7F7FB] px-4 py-3 text-center text-lg tracking-[0.6em] text-ink outline-none transition-colors focus:border-ledger dark:bg-[#2F2F2F] dark:text-white ${
              error ? "border-stamp" : "border-paperline dark:border-white/10"
            }`}
          />
        </div>

        {error && (
          <p className="mt-3 text-xs font-semibold text-stamp sm:mt-4 sm:text-sm">
            Code incorrect, réessayez.
          </p>
        )}
      </div>
    </div>
  );
}
