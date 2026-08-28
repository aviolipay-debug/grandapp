// app/dashboard/invoices/finance-pin-gate.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { hashPin } from "@/lib/pin";

// Écran de verrouillage : demandé à chaque ouverture de la page Finances.
// Le hash du PIN est fourni par le parent (Server Component) — plus besoin
// de le recharger côté navigateur, ce qui évite un flash "Chargement...".
export default function FinancePinGate({
  pinHash,
  children,
}: {
  pinHash: string | null;
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [unlocked, setUnlocked] = useState(!pinHash);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!unlocked) {
      inputRef.current?.focus();
    }
  }, [unlocked]);

  useEffect(() => {
    async function verify() {
      if (digits.length !== 4 || !pinHash) return;
      setVerifying(true);
      setError(false);

      const entered = await hashPin(digits);

      if (entered === pinHash) {
        setUnlocked(true);
      } else {
        setError(true);
        setDigits("");
      }
      setVerifying(false);
    }
    verify();
  }, [digits, pinHash]);

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-xs rounded-2xl border border-paperline bg-white p-8 text-center shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#262626] dark:shadow-none">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ledger-deep text-white">
          <ShieldCheck size={22} />
        </div>
        <h2 className="font-display text-lg font-bold text-ink dark:text-white">Zone protégée</h2>
        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-white/50">
          Entrez votre code PIN pour accéder à vos finances.
        </p>

        <div
          className="mt-6 flex cursor-text justify-center gap-3"
          onClick={() => inputRef.current?.focus()}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex h-12 w-11 items-center justify-center rounded-xl border text-xl font-bold ${
                error
                  ? "border-stamp text-stamp"
                  : "border-paperline text-ink dark:border-white/10 dark:text-white"
              }`}
            >
              {digits[i] ? "•" : ""}
            </div>
          ))}
        </div>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="\d*"
          maxLength={4}
          autoFocus
          value={digits}
          disabled={verifying}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="h-px w-px opacity-0"
          aria-label="Code PIN"
        />

        {error && (
          <p className="mt-4 text-sm font-semibold text-stamp">
            Code incorrect, réessayez.
          </p>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="mt-6 text-sm font-semibold text-ledger-deep underline underline-offset-2 dark:text-ledger"
        >
          Saisir le code
        </button>
      </div>
    </div>
  );
}
