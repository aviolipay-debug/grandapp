"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F0F3] px-6 py-12 dark:bg-[#2F2F2F]">
      <div className="w-full max-w-md rounded-2xl border border-paperline bg-white p-8 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#0f0d1a]">
        <Link
          href="/"
          className="font-display mb-8 block text-center text-2xl font-semibold text-ink dark:text-white"
        >
          OliPay<span className="text-stamp">.</span>
        </Link>

        {success ? (
          <div className="text-center">
            <h1 className="font-display mb-2 text-xl font-semibold text-ink dark:text-white">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-sm text-[#4B5563] dark:text-white/70">
              Un lien de confirmation a été envoyé à <span className="font-semibold">{email}</span>.
              Cliquez dessus pour activer votre compte.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display mb-1 text-center text-xl font-semibold text-ink dark:text-white">
              Créer votre compte
            </h1>
            <p className="mb-6 text-center text-sm text-[#4B5563] dark:text-white/70">
              Gratuit, sans carte bancaire.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-paperline bg-white px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#F0F0F3] disabled:opacity-60 dark:border-white/15 dark:bg-[#161129] dark:text-white dark:hover:bg-[#1c1730]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
                />
              </svg>
              {googleLoading ? "Connexion…" : "Continuer avec Google"}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-paperline dark:bg-white/15" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/50">
                ou
              </span>
              <div className="h-px flex-1 bg-paperline dark:bg-white/15" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/50"
                >
                  Nom complet
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-paperline bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ledger-deep dark:border-white/15 dark:bg-[#161129] dark:text-white"
                  placeholder="Aïcha Dossou"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/50"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-paperline bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ledger-deep dark:border-white/15 dark:bg-[#161129] dark:text-white"
                  placeholder="vous@entreprise.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/50"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-paperline bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ledger-deep dark:border-white/15 dark:bg-[#161129] dark:text-white"
                  placeholder="6 caractères minimum"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-stamp/10 px-3 py-2 text-sm text-stamp">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg border-[1.5px] border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stamp hover:border-stamp disabled:opacity-60"
              >
                {loading ? "Création en cours…" : "Créer mon compte"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#4B5563] dark:text-white/70">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-semibold text-ledger-deep dark:text-ledger">
                Se connecter
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
