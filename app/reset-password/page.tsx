// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoadingOverlay from "../components/loading-overlay";
import { vastron } from "@/lib/fonts/vastron"; // police sur-mesure du logo

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <>
      <LoadingOverlay show={loading} message="Envoi en cours…" />
      <main className="flex min-h-screen items-center justify-center relative isolate overflow-hidden bg-[#F0F0F3] px-6 py-16 dark:bg-[#2F2F2F]">
        {/* Fond décoratif — taches de couleur floutées, cohérent avec le dashboard */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#7D2AE7]/25 blur-3xl dark:bg-[#7D2AE7]/15" />
          <div className="absolute -top-16 right-[-40px] h-80 w-80 rounded-full bg-[#00C4CC]/25 blur-3xl dark:bg-[#00C4CC]/15" />
          <div className="absolute top-72 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#2A89DA]/20 blur-3xl dark:bg-[#2A89DA]/10" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FE6F61]/25 blur-3xl dark:bg-[#FE6F61]/15" />
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#3a3a3a] dark:shadow-none sm:p-8">
          <Link
            href="/"
            className={`${vastron.className} mb-6 block text-center text-3xl font-semibold text-ink dark:text-white sm:mb-10`}
          >
            OliPay<span className="text-stamp">.</span>
          </Link>

          {sent ? (
            <div className="text-center">
              <h1 className="font-display mb-3 text-3xl font-bold text-ink dark:text-white">
                Vérifiez votre boîte mail
              </h1>
              <p className="text-sm text-[#6B7280] dark:text-white/50">
                Un lien de réinitialisation a été envoyé à{" "}
                <span className="font-semibold text-ink dark:text-white">{email}</span>. Cliquez
                dessus pour choisir un nouveau mot de passe.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display mb-2 text-center text-3xl font-bold text-ink dark:text-white">
                Mot de passe oublié
              </h1>
              <p className="mb-6 text-center text-sm text-[#6B7280] dark:text-white/50 sm:mb-10">
                Entrez votre email, on vous envoie un lien pour le réinitialiser.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-paperline bg-white px-5 py-3.5 text-sm text-ink placeholder-[#9CA3AF] outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white dark:placeholder-white/40"
                />

                {error && (
                  <p className="rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
                >
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-[#6B7280] dark:text-white/50 sm:mt-8">
            <Link href="/login" className="font-semibold text-ledger-deep dark:text-ledger">
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
