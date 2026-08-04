"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl font-bold text-ink">
            Vérifiez votre boîte mail
          </h1>
          <p className="mt-3 text-sm text-[#4B5563]">
            On vous a envoyé un lien de confirmation à {email}. Cliquez dessus
            pour activer votre compte.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl font-semibold text-ink">
          OliPay<span className="text-stamp">.</span>
        </Link>
        <h1 className="mt-8 font-display text-2xl font-bold text-ink">
          Ouvrez votre registre
        </h1>
        <p className="mt-1 text-sm text-[#4B5563]">
          Gratuit jusqu&apos;à 5 factures par mois.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Nom complet
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
              placeholder="Awa Traoré"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
              placeholder="Au moins 6 caractères"
            />
          </div>

          {error && <p className="text-sm text-stamp">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-ledger-deep px-4 py-3 text-sm font-semibold text-paper hover:bg-stamp disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#4B5563]">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold text-stamp">
            Connectez-vous
          </Link>
        </p>
      </div>
    </main>
  );
}
