// app/reset-password/confirm/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import LoadingOverlay from "../../components/loading-overlay";
import { vastron } from "@/lib/fonts/vastron"; // police sur-mesure du logo

function ResetPasswordConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Le lien reçu par email contient un code dans l'URL (?code=...) — il faut
  // l'échanger explicitement contre une session avant de pouvoir changer le
  // mot de passe, sinon Supabase renvoie "Auth session missing!".
  const [exchanging, setExchanging] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      // Pas de code dans l'URL : soit le lien est déjà expiré/utilisé, soit
      // la page a été ouverte directement sans passer par l'email.
      setLinkError("Ce lien de réinitialisation est invalide ou a déjà été utilisé.");
      setExchanging(false);
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          setLinkError("Ce lien a expiré ou est invalide. Demandez-en un nouveau.");
        }
      })
      .finally(() => setExchanging(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    // Le lien reçu par email a déjà ouvert une session de récupération
    // temporaire — pas besoin de redemander l'ancien mot de passe ici.
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
  }

  return (
    <>
      <LoadingOverlay show={loading} message="Enregistrement…" />
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

          {exchanging ? (
            <p className="text-center text-sm text-[#6B7280] dark:text-white/50">
              Vérification du lien…
            </p>
          ) : linkError ? (
            <div className="text-center">
              <h1 className="font-display mb-3 text-2xl font-bold text-ink dark:text-white">
                Lien invalide
              </h1>
              <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">{linkError}</p>
              <Link
                href="/reset-password"
                className="block w-full rounded-xl bg-ledger-deep py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-stamp"
              >
                Redemander un lien
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <h1 className="font-display mb-3 text-3xl font-bold text-ink dark:text-white">
                Mot de passe mis à jour
              </h1>
              <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-stamp"
              >
                Aller à la connexion
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display mb-2 text-center text-3xl font-bold text-ink dark:text-white">
                Nouveau mot de passe
              </h1>
              <p className="mb-6 text-center text-sm text-[#6B7280] dark:text-white/50 sm:mb-10">
                Choisissez un nouveau mot de passe (6 caractères minimum).
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full rounded-xl border border-paperline bg-white px-5 py-3.5 pr-12 text-sm text-ink placeholder-[#9CA3AF] outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white dark:placeholder-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-ink dark:text-white/40 dark:hover:text-white/70"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full rounded-xl border border-paperline bg-white px-5 py-3.5 pr-12 text-sm text-ink placeholder-[#9CA3AF] outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white dark:placeholder-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-ink dark:text-white/40 dark:hover:text-white/70"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <p className="rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
                >
                  {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordConfirmInner />
    </Suspense>
  );
}
