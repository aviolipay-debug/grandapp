import Link from "next/link";
import MobileMenu from "./mobile-menu";

const features = [
  {
    icon: "⏱",
    badge: "bg-ledger",
    title: "Suivi des devis en temps réel",
    body: "Créez un devis, envoyez-le, et regardez son statut évoluer en direct. Un devis accepté devient une facture d'un geste.",
  },
  {
    icon: "🔒",
    badge: "bg-gold",
    title: "Stockage sécurisé",
    body: "Vos données financières sont chiffrées et sauvegardées automatiquement, à l'abri des pertes. Accès web et mobile, synchronisé en permanence.",
  },
  {
    icon: "⚙️",
    badge: "bg-ledger-deep",
    title: "Un outil tout-en-un",
    body: "Devis, factures, suivi de trésorerie : centralisez toute votre gestion financière au même endroit.",
  },
];

const audiences = [
  {
    tag: "PME",
    title: "Petites équipes",
    body: "Centralisez devis, factures et relances clients sans jongler entre plusieurs outils.",
  },
  {
    tag: "Startups",
    title: "En pleine croissance",
    body: "Gardez la maîtrise de votre comptabilité pendant que vous accélérez la croissance de votre équipe.",
  },
  {
    tag: "Freelances",
    title: "Indépendants",
    body: "Envoyez un devis pro en sortant d'un rendez-vous, en quelques minutes.",
  },
];

const faqs = [
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
];

export default function LandingPage() {
  return (
    <main id="top">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-paperline bg-paper px-[6vw] py-7">
        <div className="font-display text-2xl font-semibold text-ink">
          OliPay<span className="text-stamp">.</span>
        </div>
        <nav className="hidden gap-8 md:flex">
          <a href="#top" className="text-sm font-medium text-ink hover:text-ledger-deep">
            Accueil
          </a>
          <a href="#fonctionnalites" className="text-sm font-medium text-ink hover:text-ledger-deep">
            Fonctionnalités
          </a>
          <a href="#cibles" className="text-sm font-medium text-ink hover:text-ledger-deep">
            Pour qui
          </a>
          <a href="#faq" className="text-sm font-medium text-ink hover:text-ledger-deep">
            FAQ
          </a>
          <a href="mailto:" className="text-sm font-medium text-ink hover:text-ledger-deep">
            Contactez-nous
          </a>
        </nav>
        <Link
          href="/signup"
          className="hidden rounded-lg border-[1.5px] border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-white hover:bg-stamp hover:border-stamp md:inline-block"
        >
          Commencer gratuitement
        </Link>
        <MobileMenu />
      </header>

      <section className="grid grid-cols-1 items-center gap-10 px-[6vw] py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <div className="mb-5 flex items-center gap-2.5 font-sans text-[13px] font-semibold uppercase tracking-widest text-ledger">
            <span className="inline-block h-0.5 w-5 rounded bg-stamp" />
            Facturation &amp; devis
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink md:text-6xl">
            Vos comptes, tenus <em className="not-italic font-bold text-ledger-deep">au propre</em>.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-[#4B5563]">
            Avec OliPay, simplifiez la gestion de vos devis, vos factures et vos
            données financières sur votre téléphone.
          </p>
          <div className="mt-9 hidden items-center gap-4 md:flex">
            <Link
              href="/signup"
              className="rounded-lg border-[1.5px] border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-white hover:bg-stamp hover:border-stamp"
            >
              Ouvrir mon compte
            </Link>
            <a
              href="#fonctionnalites"
              className="rounded-lg border-[1.5px] border-ledger-deep px-6 py-3 text-sm font-semibold text-ledger-deep"
            >
              Voir comment ça marche
            </a>
          </div>
          <div className="mt-9 flex justify-center md:hidden">
            <Link
              href="/signup"
              className="rounded-lg border-[1.5px] border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-white hover:bg-stamp hover:border-stamp"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-[280px] -rotate-2 bg-white p-7 pb-10 font-mono text-sm text-ink shadow-[0_24px_60px_-20px_rgba(125,42,231,0.35)]">
            <div className="mb-4 text-center font-bold tracking-widest">FACTURE N˚ 0142</div>
            <div className="flex justify-between border-b border-dashed border-paperline py-1.5">
              <span>Remplacement vitre</span>
              <span>85 000</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-paperline py-1.5">
              <span>Pose double vitrage</span>
              <span>220 000</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-paperline py-1.5">
              <span>Main d&apos;œuvre</span>
              <span>25 000</span>
            </div>
            <div className="mt-3.5 flex justify-between text-base font-bold">
              <span>TOTAL CFA</span>
              <span>330 000</span>
            </div>
            <div className="absolute -right-3.5 -top-3.5 flex h-16 w-16 rotate-[10deg] items-center justify-center rounded-full bg-stamp text-center font-mono text-[11px] font-bold tracking-wide text-white shadow-[0_8px_20px_-6px_rgba(254,111,97,0.6)]">
              PAYÉ
              <br />✓
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="ruled px-[6vw] py-16">
        <div className="mb-14 max-w-xl">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-widest text-stamp">
            Fonctionnalités
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            Une gestion financière repensée
          </h2>
          <p className="mt-4 text-base text-[#4B5563]">
            Un système automatisé qui vous fait gagner du temps sur les tâches
            administratives du quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-paperline bg-white p-8">
              <div
                className={`mb-4 flex h-9 w-9 items-center justify-center rounded-[10px] text-base text-white ${f.badge}`}
              >
                {f.icon}
              </div>
              <h3 className="mb-2.5 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="text-sm text-[#4B5563]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cibles" className="px-[6vw] py-16">
        <div className="mb-14 max-w-xl">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-widest text-stamp">
            Pour qui
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            Conçu pour ceux qui facturent sans service compta dédié.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {audiences.map((c) => (
            <div key={c.tag} className="rounded-2xl border border-paperline bg-white p-8">
              <div className="text-xs font-bold uppercase tracking-wide text-ledger-deep">
                {c.tag}
              </div>
              <h3 className="my-2.5 font-display text-lg font-semibold text-ink">{c.title}</h3>
              <p className="text-sm text-[#4B5563]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="ruled px-[6vw] py-16">
        <div className="mb-14 max-w-xl">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-widest text-stamp">
            Questions fréquentes
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            Ce qu&apos;on nous demande le plus souvent
          </h2>
        </div>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-paperline bg-white">
          {faqs.map((item, i) => (
            <details
              key={item.q}
              className={`group px-7 py-5 ${i !== faqs.length - 1 ? "border-b border-paperline" : ""}`}
            >
              <summary className="cursor-pointer list-none font-display text-base font-semibold text-ink marker:content-none">
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

      <section className="mx-[6vw] my-16 rounded-3xl bg-gradient-to-br from-ledger-deep to-ledger px-[6vw] py-20 text-center text-white">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Prêt à simplifier votre gestion ?
        </h2>
        <p className="mx-auto my-5 max-w-[50ch] text-white/85">
          Utilisez OliPay dès maintenant et reprenez le contrôle de votre
          comptabilité en quelques minutes.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-lg border-[1.5px] border-white bg-white px-6 py-3 text-sm font-semibold text-ledger-deep hover:border-stamp hover:bg-stamp hover:text-white"
        >
          Créer mon compte
        </Link>
      </section>

      <footer className="flex flex-col items-center justify-between gap-2.5 border-t border-paperline px-[6vw] py-10 text-sm text-[#6B7280] md:flex-row">
        <div>© 2026 OliPay.</div>
        <div>Fait pour les entrepreneurs qui n&apos;ont pas le temps de tenir un tableur.</div>
      </footer>
    </main>
  );
}
