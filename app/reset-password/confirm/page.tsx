// app/reset-password/confirm/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/app/components/spinner";
import { vastron } from "@/lib/fonts/vastron"; // police sur-mesure du logo

function ResetPasswordConfirmInner() {
  const router = useRouter();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // La session de récupération a déjà été établie côté serveur par
  // /auth/callback (cookies) avant d'arriver ici, on vérifie juste qu'elle
  // existe, sans refaire l'échange nous-mêmes (ce qui échouait auparavant :
  // le "code verifier" PKCE n'est pas partagé entre un échange serveur et un
  // échange client, d'où l'erreur "PKCE code verifier not found in storage").
  const [checkingSession, setCheckingSession] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLinkError("Ce lien de réinitialisation est invalide, a expiré, ou a déjà été utilisé.");
      }
      setCheckingSession(false);
    });
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
    // temporaire, pas besoin de redemander l'ancien mot de passe ici.
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
      <main className="flex min-h-screen items-center justify-center relative isolate overflow-hidden bg-[#F0F0F3] px-6 py-16 dark:bg-[#2F2F2F]">

        <div className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#3a3a3a] dark:shadow-none sm:p-8">
          <Link
            href="/"
            className={`${vastron.className} mb-6 block text-center text-3xl font-semibold text-ink dark:text-white sm:mb-10`}
          >
            Devisfinance<span className="text-ledger-deep dark:text-ledger-light">.</span>
          </Link>

          {checkingSession ? (
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
                className="block w-full rounded-xl bg-ledger-deep py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-ledger-dark"
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
                className="w-full rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-ledger-dark"
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
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-ledger-dark disabled:opacity-60"
                >
                  {loading && <Spinner />}
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