// app/dashboard/invoices/finance-pin-gate.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hashPin } from "@/lib/pin";

// Écran de verrouillage : demandé à chaque ouverture de la page Finances.
// Si aucun code PIN n'a été défini dans le profil, l'accès reste libre.
export default function FinancePinGate({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [checking, setChecking] = useState(true);
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function loadPin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("finance_pin_hash")
        .eq("id", user.id)
        .single();

      if (!profile?.finance_pin_hash) {
        // Aucun PIN configuré : pas de verrouillage.
        setUnlocked(true);
      } else {
        setStoredHash(profile.finance_pin_hash);
      }
      setChecking(false);
    }
    loadPin();
  }, [supabase]);

  useEffect(() => {
    if (!checking && !unlocked) {
      inputRef.current?.focus();
    }
  }, [checking, unlocked]);

  useEffect(() => {
    async function verify() {
      if (digits.length !== 4 || !storedHash) return;
      setVerifying(true);
      setError(false);

      const entered = await hashPin(digits);

      if (entered === storedHash) {
        setUnlocked(true);
      } else {
        setError(true);
        setDigits("");
      }
      setVerifying(false);
    }
    verify();
  }, [digits, storedHash]);

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[#6B7280] dark:text-white/50">Chargement...</p>
      </div>
    );
  }

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

        <div className="mt-6 flex justify-center gap-3">
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
          className="mt-5 h-0 w-0 opacity-0"
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
