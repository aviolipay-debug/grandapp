// app/cookies/page.tsx
import Link from "next/link";
import { vastron } from "@/lib/fonts/vastron";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-[6vw] py-12 dark:bg-[#2F2F2F]">
      <Link
        href="/"
        className={`${vastron.className} mb-8 block text-2xl font-semibold text-ink dark:text-white`}
      >
        Devisfinance<span className="text-stamp">.</span>
      </Link>

      <div className="mx-auto max-w-2xl">
        <h1 className="font-display mb-6 text-3xl font-bold text-ink dark:text-white">
          Politique de cookies
        </h1>

        {/* Contenu à compléter : quels cookies/stockage local sont utilisés
            (ex. la clé localStorage "devisfinance-theme" pour le thème
            clair/sombre, les cookies de session Supabase Auth), leur finalité,
            durée, et comment les refuser si applicable. */}
        <p className="text-sm leading-relaxed text-[#4B5563] dark:text-white/70">
          Cette page sera bientôt complétée avec la politique de cookies de
          Devisfinance.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-ledger-deep dark:text-ledger"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
