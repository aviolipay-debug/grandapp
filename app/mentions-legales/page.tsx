// app/mentions-legales/page.tsx
import Link from "next/link";
import { vastron } from "@/lib/fonts/vastron";

export default function MentionsLegalesPage() {
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
          Mentions légales
        </h1>

        {/* Contenu à compléter avec les informations légales réelles de
            l'entreprise : raison sociale, forme juridique, capital, RCCM,
            adresse du siège, directeur de publication, hébergeur, etc. */}
        <p className="text-sm leading-relaxed text-[#4B5563] dark:text-white/70">
          Cette page sera bientôt complétée avec les mentions légales de
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
