// app/confidentialite/page.tsx
import Link from "next/link";
import { vastron } from "@/lib/fonts/vastron";

export default function ConfidentialitePage() {
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
          Politique de confidentialité
        </h1>

        {/* Contenu à compléter : quelles données sont collectées, pourquoi,
            durée de conservation, droits des utilisateurs (accès, suppression),
            sous-traitants (ex. Supabase, Resend, Vercel), contact. */}
        <p className="text-sm leading-relaxed text-[#4B5563] dark:text-white/70">
          Cette page sera bientôt complétée avec la politique de
          confidentialité de Devisfinance.
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
