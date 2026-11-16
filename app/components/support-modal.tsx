// app/components/support-modal.tsx
// Carte "Nous soutenir" : s'ouvre depuis les boutons Soutenir (mobile) et
// Nous soutenir (menu latéral). Montants cliquables.
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const AMOUNTS = [1000, 3000, 5000, 10000];

// Page de paiement FedaPay, ouverte dans un nouvel onglet pour tous les montants.
const PAYMENT_URL = "https://me.fedapay.com/devisfinance";

function formatAmount(n: number) {
  return `${n.toLocaleString("fr-FR")} F`;
}

export default function SupportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function choose(amount: number) {
    setSelected(amount);
    window.open(PAYMENT_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#262626] sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>

        <h2
          id="support-title"
          className="font-display text-xl font-bold text-ink dark:text-white"
        >
          Nous soutenir
        </h2>
        <p className="mt-2 text-sm text-muted dark:text-white/60">
          Votre don paie les serveurs et les mises à jour de l&apos;application.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {AMOUNTS.map((amount) => {
            const active = selected === amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => choose(amount)}
                aria-pressed={active}
                className={`rounded-xl border px-3 py-4 text-base font-bold transition-colors ${
                  active
                    ? "border-ledger-deep bg-ledger-deep text-white"
                    : "border-paperline bg-paper text-ink hover:border-ledger-deep hover:bg-ledger-soft dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white dark:hover:border-ledger-light dark:hover:bg-white/10"
                }`}
              >
                {formatAmount(amount)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
