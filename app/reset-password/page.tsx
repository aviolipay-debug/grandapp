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
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/confirm`,
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

        <div className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#3a3a3a] dark:shadow-none sm:p-8">
          <Link
            href="/"
            className={`${vastron.className} mb-6 block text-center text-3xl font-semibold text-ink dark:text-white sm:mb-10`}
          >
            Devisfinance<span className="text-ledger-deep dark:text-ledger-light">.</span>
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
                  className="mt-2 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-ledger-dark disabled:opacity-60"
                >
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-[#6B7280] dark:text-white/50 sm:mt-8">
            <Link href="/login" className="font-semibold text-ledger-deep dark:text-ledger-light">
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}