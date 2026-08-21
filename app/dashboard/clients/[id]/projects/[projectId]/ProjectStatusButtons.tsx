// app/dashboard/clients/[id]/projects/[projectId]/ProjectStatusButtons.tsx
"use client";

import { useState, useTransition } from "react";
import { HelpCircle } from "lucide-react";
import { updateProjectStatus, updateProjectStatusWithPayment } from "./actions";

const projectStatusOptions: { value: "en_cours" | "attente" | "termine"; label: string }[] = [
  { value: "attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

export default function ProjectStatusButtons({
  projectId,
  clientId,
  currentStatus,
  remainingDue,
  currency,
  hasQuote,
}: {
  projectId: string;
  clientId: string;
  currentStatus: string;
  remainingDue: number | null;
  currency: string;
  hasQuote: boolean;
}) {
  const [modalStatus, setModalStatus] = useState<"en_cours" | "termine" | null>(null);
  const [showNoQuoteAlert, setShowNoQuoteAlert] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [submittedPaymentId, setSubmittedPaymentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(value: "en_cours" | "attente" | "termine") {
    if (value === "attente") {
      startTransition(() => {
        updateProjectStatus(projectId, clientId, "attente");
      });
      return;
    }

    if (!hasQuote) {
      setShowNoQuoteAlert(true);
      return;
    }

    setModalStatus(value);
  }

  function closeModal() {
    setModalStatus(null);
  }

  function closeNoQuoteAlert() {
    setShowNoQuoteAlert(false);
  }

  async function handleSubmit(formData: FormData) {
    if (!modalStatus) return;
    const result = await updateProjectStatusWithPayment(projectId, clientId, modalStatus, formData);
    setModalStatus(null);
    if (result?.paymentId) {
      setSubmittedPaymentId(result.paymentId);
    }
  }

  function closeReceiptConfirmation() {
    setSubmittedPaymentId(null);
  }

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {projectStatusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={isPending}
            onClick={() => handleClick(opt.value)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
              currentStatus === opt.value
                ? "border-[#00A6AC] bg-[#00A6AC] text-white"
                : "border-paperline bg-white text-[#4B5563] hover:border-[#00A6AC] dark:border-white/15 dark:bg-transparent dark:text-white/60"
            }`}
          >
            {opt.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowHelp(true)}
          aria-label="Comment fonctionnent les statuts de projet"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-paperline text-[#6B7280] hover:border-[#00A6AC] hover:text-[#00A6AC] dark:border-white/15 dark:text-white/40"
        >
          <HelpCircle size={13} strokeWidth={2} />
        </button>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-[#262626]">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">
              Comment fonctionnent les statuts
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4B5563] dark:text-white/70">
              <strong className="text-ink dark:text-white">En attente</strong> : le devis a été
              envoyé au client, aucun paiement n&apos;a encore été reçu.{" "}
              <strong className="text-ink dark:text-white">En cours</strong> : un acompte a été
              reçu et le projet démarre — la Facture et le Bordereau de livraison sont générés
              automatiquement.{" "}
              <strong className="text-ink dark:text-white">Terminé</strong> : le solde a été reçu
              et le projet est clôturé.
            </p>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-lg bg-ledger-deep px-4 py-2.5 text-sm font-semibold text-paper hover:bg-stamp"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {submittedPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center dark:bg-[#262626]">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">
              Paiement enregistré
            </h2>
            <p className="mt-1 text-sm text-[#6B7280] dark:text-white/50">
              Un reçu a été généré pour ce paiement.
            </p>
            <a
              href={`/api/payments/${submittedPaymentId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block w-full rounded-lg bg-ledger-deep px-4 py-2.5 text-sm font-semibold text-paper hover:bg-stamp"
            >
              Télécharger le reçu
            </a>
            <button
              type="button"
              onClick={closeReceiptConfirmation}
              className="mt-3 w-full rounded-lg border border-paperline px-4 py-2.5 text-sm font-semibold text-[#4B5563] dark:border-white/15 dark:text-white/60"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {showNoQuoteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center dark:bg-[#262626]">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">
              Aucun Devis rattaché
            </h2>
            <button
              type="button"
              onClick={closeNoQuoteAlert}
              className="mt-5 w-full rounded-lg bg-ledger-deep px-4 py-2.5 text-sm font-semibold text-paper hover:bg-stamp"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {modalStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-[#262626]">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">
              Enregistrer un paiement
            </h2>
            <p className="mt-1 text-sm text-[#6B7280] dark:text-white/50">
              {modalStatus === "en_cours"
                ? "Acompte reçu pour démarrer le projet."
                : "Solde reçu pour clôturer le projet."}
            </p>

            <form action={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
                  Montant {modalStatus === "termine" ? "(solde)" : "(acompte)"}
                </label>
                <input
                  name="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  defaultValue={
                    modalStatus === "termine" && remainingDue ? remainingDue : undefined
                  }
                  className="w-full rounded-lg border border-paperline bg-white px-3 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                />
                {modalStatus === "termine" && remainingDue !== null && (
                  <p className="mt-1 text-xs text-[#6B7280] dark:text-white/40">
                    Restant dû actuellement : {remainingDue.toLocaleString("fr-FR")} {currency}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
                  Méthode
                </label>
                <select
                  name="method"
                  className="w-full rounded-lg border border-paperline bg-white px-3 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                >
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Virement</option>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-paperline px-4 py-2.5 text-sm font-semibold text-[#4B5563] dark:border-white/15 dark:text-white/60"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-ledger-deep px-4 py-2.5 text-sm font-semibold text-paper hover:bg-stamp"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
