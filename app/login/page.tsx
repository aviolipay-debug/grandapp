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
  const [loading, setLoading] = useState(false);
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F0F3] px-6 py-12 dark:bg-[#2F2F2F]">
      <div className="w-full max-w-md rounded-2xl border border-paperline bg-white p-8 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#0f0d1a]">
        <Link
          href="/"
          className="font-display mb-8 block text-center text-2xl font-semibold text-ink dark:text-white"
        >
          OliPay<span className="text-stamp">.</span>
        </Link>

        <h1 className="font-display mb-1 text-center text-xl font-semibold text-ink dark:text-white">
          Bon retour
        </h1>
        <p className="mb-6 text-center text-sm text-[#4B5563] dark:text-white/70">
          Connectez-vous à votre espace.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/50"
              >
                Mot de passe
              </label>
              <Link href="/reset-password" className="text-xs font-semibold text-ledger-deep dark:text-ledger">
                Oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-paperline bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ledger-deep dark:border-white/15 dark:bg-[#161129] dark:text-white"
              placeholder="••••••••"
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
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#4B5563] dark:text-white/70">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-ledger-deep dark:text-ledger">
            Créer un compte gratuit
          </Link>
        </p>
      </div>
    </main>
  );
}
