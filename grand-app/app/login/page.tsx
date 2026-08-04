"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl font-semibold text-ink">
          OliPay<span className="text-stamp">.</span>
        </Link>
        <h1 className="mt-8 font-display text-2xl font-bold text-ink">
          Content de vous revoir
        </h1>
        <p className="mt-1 text-sm text-[#4B5563]">Connectez-vous à votre registre.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
              placeholder="vous@entreprise.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-stamp">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-ledger-deep px-4 py-3 text-sm font-semibold text-paper hover:bg-stamp disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#4B5563]">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-stamp">
            Créez-en un
          </Link>
        </p>
      </div>
    </main>
  );
}
