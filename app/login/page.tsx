"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
    <main className="flex min-h-screen items-center justify-center bg-[#2F2F2F] px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display mb-16 block text-center text-3xl font-semibold text-white">
          OliPay<span className="text-stamp">.</span>
        </Link>

        <h1 className="font-display mb-2 text-center text-3xl font-bold text-white">
          Identifiez-vous
        </h1>
        <p className="mb-10 text-center text-sm text-white/50">
          Bon retour sur votre application préférée
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/10 bg-[#3a3a3a] px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-ledger"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full rounded-xl border border-white/10 bg-[#3a3a3a] px-5 py-3.5 pr-12 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-ledger"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                {showPassword ? (
                  <path
                    d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 4.6A9.7 9.7 0 0 1 12 4.3c5 0 8.7 3.6 10 7.7a11.8 11.8 0 0 1-3.1 4.4M6.2 6.2A11.8 11.8 0 0 0 2 12c1.3 4.1 5 7.7 10 7.7 1 0 2-.1 2.9-.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <>
                    <path
                      d="M2 12c1.3-4.1 5-7.7 10-7.7S20.7 7.9 22 12c-1.3 4.1-5 7.7-10 7.7S3.3 16.1 2 12Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.6" />
                  </>
                )}
              </svg>
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
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <Link
          href="/reset-password"
          className="mt-5 block text-center text-sm font-medium text-ledger underline underline-offset-2"
        >
          Mot de passe oublié ?
        </Link>

        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-sm text-white/40">ou</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#3a3a3a] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#454545] disabled:opacity-60"
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

        <p className="mt-8 text-center text-sm text-white/50">
          Nouveau ici ?{" "}
          <Link href="/signup" className="font-semibold text-ledger">
            Créez un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
