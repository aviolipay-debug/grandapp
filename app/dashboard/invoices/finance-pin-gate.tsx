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
export default function FinancePinGate() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <div className="flex min-h-[50vh] items-center justify-center px-4 sm:min-h-[60vh]">
      <div className="w-full max-w-xs rounded-2xl border border-paperline bg-white p-5 text-center shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#262626] dark:shadow-none sm:p-8">
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
        <div
          className="mt-4 flex cursor-text justify-center gap-2.5 sm:mt-6 sm:gap-3"
          onClick={() => inputRef.current?.focus()}
        >
          {[0, 1, 2, 3].map((i) => {
            // La case active (celle où le prochain chiffre s'insérera)
            // affiche une barre verticale clignotante, comme un vrai curseur
            // de saisie, pour indiquer où l'utilisateur doit taper.
            const isCurrent = !isPending && !error && i === digits.length;
            return (
              <div
                key={i}
                className={`flex h-10 w-9 items-center justify-center rounded-xl border text-lg font-bold sm:h-12 sm:w-11 sm:text-xl ${
                  error
                    ? "border-stamp text-stamp"
                    : "border-paperline text-ink dark:border-white/10 dark:text-white"
                }`}
              >
                {digits[i] ? (
                  "•"
                ) : isCurrent ? (
                  <span className="h-4 w-0.5 animate-pulse rounded-full bg-ledger-deep dark:bg-ledger sm:h-5" />
                ) : null}
              </div>
            );
          })}
        </div>
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
          className="h-px w-px opacity-0"
          aria-label="Code PIN"
        />
        {error && (
          <p className="mt-3 text-xs font-semibold text-stamp sm:mt-4 sm:text-sm">
            Code incorrect, réessayez.
          </p>
        )}
      </div>
    </div>
  );
}
