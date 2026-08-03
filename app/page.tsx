import Link from "next/link";
import MobileMenu from "./mobile-menu";

export default function LandingPage() {
  return (
    <main id="top">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-paperline bg-paper px-[6vw] py-7">
        <div className="font-display text-2xl font-semibold">
          OliPay<span className="text-stamp">.</span>
        </div>
        <nav className="hidden gap-8 md:flex">
          <a href="#top" className="text-sm font-medium text-ledger-deep hover:text-stamp">
            Accueil
          </a>
          <a href="#fonctionnalites" className="text-sm font-medium text-ledger-deep hover:text-stamp">
            Fonctionnalités
          </a>
          <a href="#cibles" className="text-sm font-medium text-ledger-deep hover:text-stamp">
            Pour qui
          </a>
          <a href="#faq" className="text-sm font-medium text-ledger-deep hover:text-stamp">
            FAQ
          </a>
          <a href="mailto:" className="text-sm font-medium text-ledger-deep hover:text-stamp">
            Contactez-nous
          </a>
        </nav>
        <Link
          href="/signup"
          className="hidden rounded border border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-paper hover:bg-stamp hover:border-stamp md:inline-block"
        >
          Commencer gratuitement
        </Link>
        <MobileMenu />
      </header>

      <section className="grid grid-cols-1 items-center gap-10 px-[6vw] py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-ledger">
            <span className="inline-block h-px w-5 bg-stamp" />
            Facturation &amp; devis
          </div>
          <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ledger-deep md:text-6xl">
            Vos comptes, tenus <em className="italic font-semibold text-stamp">au propre</em>.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-[#374151]">
            Avec OliPay, simplifiez la gestion de vos devis, vos factures et vos
            données financières sur votre téléphone.
          </p>
          <div className="mt-9 hidden items-center gap-4 md:flex">
            <Link
              href="/signup"
              className="rounded border border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-paper hover:bg-stamp hover:border-stamp"
            >
              Ouvrir mon compte
            </Link>
            <a
              href="#fonctionnalites"
              className="rounded border border-ledger-deep px-6 py-3 text-sm font-semibold text-ledger-deep"
            >
              Voir comment ça marche
            </a>
          </div>
          <div className="mt-9 flex justify-center md:hidden">
            <Link
              href="/signup"
              className="rounded border border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-paper hover:bg-stamp hover:border-stamp"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-[280px] -rotate-2 bg-[#FFFFFF] p-7 pb-10 font-mono text-sm shadow-[0_24px_60px_-20px_rgba(125,42,231,0.35)]">
            <div className="mb-4 text-center font-bold tracking-widest">FACTURE N˚ 0142</div>
            <div className="flex justify-between border-b border-dashed border-[#E5E7EB] py-1.5">
              <span>Remplacement vitre</span>
              <span>85 000</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-[#E5E7EB] py-1.5">
              <span>Pose double vitrage</span>
              <span>220 000</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-[#E5E7EB] py-1.5">
              <span>Main d&apos;œuvre</span>
              <span>25 000</span>
            </div>
            <div className="mt-3.5 flex justify-between text-base font-bold">
              <span>TOTAL CFA</span>
              <span>330 000</span>
            </div>
            <div className="absolute right-[-10px] top-[44%] flex h-[92px] w-[92px] rotate-[14deg] items-center justify-center rounded-full border-2 border-stamp text-center font-mono text-xs font-bold tracking-wide text-stamp opacity-90">
              PAYÉ
              <br />✓
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="ruled px-[6vw] py-16">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-widest text-stamp">
            Fonctionnalités
          </div>
          <h2 className="font-display text-3xl font-medium leading-tight text-ledger-deep md:text-4xl">
            Une gestion financière repensée
          </h2>
          <p className="mt-4 text-base text-[#4B5563]">
            Un système automatisé qui vous fait gagner du temps sur les tâches
            administratives du quotidien.
          </p>
        </div>

        <div className="rounded-md bg-ledger-deep p-1">
          <div className="rounded bg-paper py-2.5">
            {[
              {
                n: "⏱",
                title: "Suivi des devis en temps réel",
                body: "Créez un devis, envoyez-le, et regardez son statut évoluer en direct — vu, accepté, refusé. Un devis accepté devient une facture d'un geste.",
                note: "Statuts en temps réel, relances automatiques, export PDF prêt à envoyer.",
              },
              {
                n: "🔒",
                title: "Stockage sécurisé",
                body: "Vos données financières sont chiffrées et sauvegardées automatiquement, à l'abri des pertes. Accès web et mobile, synchronisé en permanence.",
                note: "",
              },
              {
                n: "⚙️",
                title: "Un outil tout-en-un",
                body: "Devis, factures, suivi de trésorerie : centralisez toute votre gestion financière au même endroit.",
                note: "",
              },
            ].map((item, i) => (
              <div
                key={item.n}
                className={`grid grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[70px_1fr_1fr] md:px-10 ${
                  i !== 2 ? "border-b border-paperline" : ""
                }`}
              >
                <div className="font-mono text-base font-bold text-gold">{item.n}</div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-ledger-deep">
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-[#4B5563]">{item.body}</p>
                </div>
                <div>
                  <p className="font-mono text-sm text-[#6B7280]">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cibles" className="px-[6vw] py-16">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-widest text-stamp">
            Pour qui
          </div>
          <h2 className="font-display text-3xl font-medium leading-tight text-ledger-deep md:text-4xl">
            Conçu pour ceux qui facturent sans service compta dédié.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              tag: "PME",
              title: "Petites équipes",
              body: "Centralisez devis, factures et relances clients sans jongler entre trois outils différents.",
            },
            {
              tag: "Startups",
              title: "En pleine croissance",
              body: "Gardez la maîtrise de votre comptabilité pendant que vous accélérez la croissance de votre équipe.",
            },
            {
              tag: "Freelances",
              title: "Indépendants",
              body: "Envoyez un devis pro en sortant d'un rendez-vous, en moins de temps qu'il n'en faut pour le raconter.",
            },
          ].map((c) => (
            <div key={c.tag} className="rounded-md border border-ledger-deep bg-[#FFFFFF] p-8">
              <div className="font-mono text-xs uppercase tracking-wide text-stamp">{c.tag}</div>
              <h3 className="my-2.5 font-display text-xl font-semibold text-ledger-deep">
                {c.title}
              </h3>
              <p className="text-[15px] text-[#4B5563]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="ruled">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-widest text-stamp">
            Questions fréquentes
          </div>
          <h2 className="font-display text-3xl font-medium leading-tight text-ledger-deep md:text-4xl">
            Ce qu&apos;on nous demande le plus souvent
          </h2>
        </div>
        <div className="mx-auto max-w-3xl divide-y divide-paperline rounded-md border border-paperline bg-white">
          {[
            {
              q: "Ai-je besoin de compétences en comptabilité pour utiliser OliPay ?",
              a: "Non. OliPay est pensé pour les indépendants et petites équipes sans service compta dédié : les calculs, les statuts et les relances sont automatisés.",
            },
            {
              q: "Puis-je personnaliser mes devis et factures avec mon logo ?",
              a: "Oui, chaque document généré reprend le nom et les informations de votre entreprise, avec votre logo une fois ajouté dans vos paramètres.",
            },
            {
              q: "Mes données financières sont-elles en sécurité ?",
              a: "Oui, toutes vos données sont chiffrées et sauvegardées automatiquement, avec un accès strictement limité à votre compte.",
            },
            {
              q: "Puis-je essayer OliPay gratuitement ?",
              a: "Oui, la création de compte est gratuite et vous pouvez commencer à créer des devis et factures immédiatement.",
            },
          ].map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="cursor-pointer list-none font-display text-base font-semibold text-ledger-deep marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="shrink-0 text-lg text-stamp transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-[#4B5563]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-ledger-deep px-[6vw] py-20 text-center text-paper">
        <h2 className="font-display text-3xl font-medium md:text-4xl">
          Prêt à simplifier votre gestion ?
        </h2>
        <p className="mx-auto my-5 max-w-[50ch] text-[#D8B4FE]">
          Utilisez OliPay dès maintenant et reprenez le contrôle de votre
          comptabilité en quelques minutes.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded border border-stamp bg-stamp px-6 py-3 text-sm font-semibold text-paper"
        >
          Créer mon compte
        </Link>
      </section>

      <footer className="flex flex-col items-center justify-between gap-2.5 border-t border-paperline px-[6vw] py-10 font-mono text-xs text-[#6B7280] md:flex-row">
        <div>© 2026 OliPay.</div>
        <div>Fait pour les entrepreneurs qui n&apos;ont pas le temps de tenir un tableur.</div>
      </footer>
    </main>
  );
}
