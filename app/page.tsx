import Link from "next/link";
import MobileMenu from "./mobile-menu";
import ThemeToggle from "./theme-toggle";
import Reveal from "./reveal";
import { vastron } from "@/lib/fonts/vastron"; // police sur-mesure du logo
import { FileClock, ShieldCheck, Layers } from "lucide-react";

const features = [
  {
    icon: FileClock,
    badge: "bg-ledger",
    title: "Suivi des devis en temps réel",
    body: "Créez un devis, envoyez-le, et regardez son statut évoluer en direct. Un devis accepté devient une facture d'un geste.",
  },
  {
    icon: ShieldCheck,
    badge: "bg-gold",
    title: "Stockage sécurisé",
    body: "Vos données financières sont chiffrées et sauvegardées automatiquement, à l'abri des pertes. Accès web et mobile, synchronisé en permanence.",
  },
  {
    icon: Layers,
    badge: "bg-ledger-deep",
    title: "Un outil tout-en-un",
    body: "Devis, factures, suivi de trésorerie : centralisez toute votre gestion financière au même endroit.",
  },
];

const audiences = [
  {
    tag: "PME",
    title: "Petites entreprises",
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
      {/* Animations du hero : flottement de la carte du dessus, entrée en éventail
          des 3 documents (devis → facture → reçu), et le tampon "PAYÉ" qui s'abat
          une fois la pile installée. */}
      <style>{`
        @keyframes float-card {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-14px) rotate(-6deg); }
        }
        .animate-float-card {
          animation: float-card 3s ease-in-out infinite;
        }
        @keyframes doc-in {
          0% { opacity: 0; transform: translateY(24px) rotate(0deg) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) rotate(var(--doc-rotate, 0deg)) scale(1); }
        }
        .animate-doc-in {
          opacity: 0;
          animation: doc-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes stamp-drop {
          0% { opacity: 0; transform: scale(2.2) rotate(10deg); }
          60% { opacity: 1; transform: scale(0.9) rotate(10deg); }
          80% { transform: scale(1.08) rotate(10deg); }
          100% { opacity: 1; transform: scale(1) rotate(10deg); }
        }
        .animate-stamp-drop {
          opacity: 0;
          animation: stamp-drop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-card,
          .animate-doc-in,
          .animate-stamp-drop {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
      {/* Header mobile : fond blanc, logo centré, toggle jour/nuit fonctionnel */}
      <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-b border-paperline bg-white px-[6vw] py-4 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
        <div className="flex items-center">
          <ThemeToggle />
        </div>
        <div className={`${vastron.className} justify-self-center text-2xl font-semibold text-ink dark:text-white`}>
          OliPay<span className="text-stamp">.</span>
        </div>
        <div className="flex items-center justify-end">
          <MobileMenu />
        </div>
      </header>

      {/* Header desktop : version précédente restaurée (fond clair, logo à gauche, nav au centre, CTA à droite) */}
      <header className="sticky top-0 z-50 hidden items-center justify-between border-b border-paperline bg-paper px-[6vw] py-7 dark:border-white/10 dark:bg-[#2F2F2F] md:flex">
        <div className={`${vastron.className} text-2xl font-semibold text-ink dark:text-white`}>
          OliPay<span className="text-stamp">.</span>
        </div>
        <nav className="hidden gap-8 md:flex">
          <a href="#top" className="text-sm font-bold text-ink dark:text-white hover:text-ledger-deep dark:hover:text-ledger">
            Accueil
          </a>
          <a href="#fonctionnalites" className="text-sm font-bold text-ink dark:text-white hover:text-ledger-deep dark:hover:text-ledger">
            Fonctionnalités
          </a>
          <a href="#cibles" className="text-sm font-bold text-ink dark:text-white hover:text-ledger-deep dark:hover:text-ledger">
            Pour qui
          </a>
          <a href="#faq" className="text-sm font-bold text-ink dark:text-white hover:text-ledger-deep dark:hover:text-ledger">
            FAQ
          </a>
          <a href="mailto:" className="text-sm font-bold text-ink dark:text-white hover:text-ledger-deep dark:hover:text-ledger">
            Contactez-nous
          </a>
        </nav>
        <Link
          href="/signup"
          className="hidden rounded-lg border-[1.5px] border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-white hover:bg-stamp hover:border-stamp md:inline-block"
        >
          Commencer gratuitement
        </Link>
      </header>

      <section className="relative isolate overflow-hidden grid grid-cols-1 items-center gap-10 bg-[#F0F0F3] px-[6vw] pb-16 pt-6 dark:bg-[#2F2F2F] md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-8">
        {/* Fond décoratif — texture "papier réglé" (clin d'œil au grand livre
            comptable) et un seul halo de couleur de marque, plutôt que plusieurs
            taches floues sans lien avec le sujet. */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0 text-ink opacity-[0.05] dark:text-white dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, currentColor 0, currentColor 1px, transparent 1px, transparent 34px)",
            }}
          />
          <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#7D2AE7]/20 blur-[110px] dark:bg-[#7D2AE7]/12" />
          <div className="absolute -bottom-20 -right-16 h-[360px] w-[360px] rounded-full bg-gold/15 blur-[110px] dark:bg-gold/10" />
        </div>

        <div>
          <div className="mb-5 flex items-center gap-2.5 font-sans text-[13px] font-semibold uppercase tracking-widest text-ledger">
            <span className="inline-block h-0.5 w-5 rounded bg-stamp" />
            Facturation &amp; devis
          </div>
          <h1 className="font-title text-center text-4xl font-bold leading-[1.08] tracking-tight text-ink dark:text-white md:text-left md:text-6xl">
            Simplifiez la gestion de vos <span className="text-ledger-deep">devis</span>,{" "}
            <span className="text-ledger-deep">factures</span> et finances
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-center text-lg text-[#4B5563] dark:text-white/70 md:mx-0 md:text-left">
            Créez des devis professionnels depuis votre smartphone et
            envoyez-les à vos clients en moins de 2 minutes.
          </p>
          <div className="mt-9 hidden items-center gap-4 md:flex">
            <Link
              href="/signup"
              className="rounded-lg border-[1.5px] border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-white hover:bg-stamp hover:border-stamp"
            >
              Ouvrir mon compte
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-[1.5px] border-ledger-deep px-6 py-3 text-sm font-semibold text-ledger-deep dark:border-white dark:text-white"
            >
              Se connecter
            </Link>
          </div>
          <div className="mt-9 flex flex-col items-center gap-3 md:hidden">
            <Link
              href="/signup"
              className="w-[280px] whitespace-nowrap rounded-lg border-[1.5px] border-ledger-deep bg-ledger-deep px-6 py-3 text-center text-sm font-semibold text-white hover:bg-stamp hover:border-stamp"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="w-[280px] whitespace-nowrap rounded-lg border-[1.5px] border-ledger-deep px-6 py-3 text-center text-sm font-semibold text-ledger-deep dark:border-white dark:text-white"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="relative order-last flex justify-center md:order-none">
          <div className="absolute h-[260px] w-[260px] rounded-full bg-gradient-to-br from-ledger-deep to-ledger opacity-40 blur-3xl" />

          {/* Le parcours du document : devis en retrait, facture au milieu,
              reçu tamponné au premier plan — la promesse du produit rendue visible. */}
          <div className="relative h-[300px] w-[300px] md:h-[340px]">
            <div
              className="animate-doc-in absolute inset-x-0 top-9 mx-auto w-[260px] rounded-[18px] border border-paperline bg-white/80 px-6 py-6 text-ink/50 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/40"
              style={{ ["--doc-rotate" as string]: "-15deg", animationDelay: "0ms" }}
            >
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wide">
                Devis N˚ 0140
              </div>
              <div className="mb-2 h-2 w-3/4 rounded bg-current opacity-30" />
              <div className="h-2 w-1/2 rounded bg-current opacity-30" />
            </div>

            <div
              className="animate-doc-in absolute inset-x-0 top-4 mx-auto w-[280px] rounded-[18px] border border-paperline bg-white px-6 py-6 text-ink shadow-md dark:border-white/10 dark:bg-[#3a3a3a] dark:text-white"
              style={{ ["--doc-rotate" as string]: "-9deg", animationDelay: "3000ms" }}
            >
              <div className="mb-3 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                FACTURE N˚ 0141
              </div>
              <div className="mb-2 h-2 w-2/3 rounded bg-current opacity-20" />
              <div className="h-2 w-1/3 rounded bg-current opacity-20" />
            </div>

            <div
              className="animate-doc-in absolute inset-x-0 top-0 mx-auto"
              style={{ ["--doc-rotate" as string]: "-6deg", animationDelay: "6000ms" }}
            >
              <div className="relative w-[300px] rounded-[20px] bg-white px-6 py-[30px] text-sm text-ink shadow-[0_24px_60px_-20px_rgba(125,42,231,0.35)] animate-float-card">
                <div className="mb-[18px] inline-block rounded-full bg-gradient-to-r from-ledger to-ledger-deep px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                  FACTURE N˚ 0142
                </div>
                <div className="flex justify-between border-b border-paperline py-[7px] text-[0.88rem]">
                  <span>Remplacement vitre</span>
                  <span>85 000</span>
                </div>
                <div className="flex justify-between border-b border-paperline py-[7px] text-[0.88rem]">
                  <span>Pose double vitrage</span>
                  <span>220 000</span>
                </div>
                <div className="flex justify-between border-b border-paperline py-[7px] text-[0.88rem]">
                  <span>Main d&apos;œuvre</span>
                  <span>25 000</span>
                </div>
                <div className="mt-3.5 flex justify-between text-base font-bold">
                  <span>TOTAL CFA</span>
                  <span>330 000</span>
                </div>
                <div
                  className="animate-stamp-drop absolute -right-3.5 -top-3.5 flex h-[62px] w-[62px] rotate-[10deg] items-center justify-center rounded-full bg-stamp text-center text-[11px] font-bold tracking-wide text-white shadow-[0_8px_20px_-6px_rgba(254,111,97,0.6)]"
                  style={{ animationDelay: "9000ms" }}
                >
                  PAYÉ ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="border-t-4 border-ledger-deep bg-[#F3EEFC] px-[6vw] py-16 dark:bg-[#161129]">
        <div className="mb-14 max-w-xl">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-widest text-stamp">
            Fonctionnalités
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink dark:text-white md:text-4xl">
            Une gestion financière repensée
          </h2>
          <p className="mt-4 text-base text-[#4B5563] dark:text-white/70">
            Un système automatisé qui vous fait gagner du temps sur les tâches
            administratives du quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="rounded-2xl border border-paperline bg-white p-8 dark:border-white/10 dark:bg-[#0f0d1a]">
                <div
                  className={`mb-4 flex h-9 w-9 items-center justify-center rounded-[10px] text-white ${f.badge}`}
                >
                  <f.icon size={18} strokeWidth={2.25} />
                </div>
                <h3 className="mb-2.5 font-display text-lg font-semibold text-ink dark:text-white">{f.title}</h3>
                <p className="text-sm text-[#4B5563] dark:text-white/70">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="cibles" className="border-t-4 border-stamp bg-white px-[6vw] py-16 dark:bg-[#2F2F2F]">
        <div className="mb-14 max-w-xl">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-widest text-stamp">
            Pour qui
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink dark:text-white md:text-4xl">
            Conçu pour ceux qui facturent sans service compta dédié.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {audiences.map((c, i) => (
            <Reveal key={c.tag} delay={i * 100}>
              <div className="rounded-2xl border border-paperline bg-white p-8 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#12161c] dark:shadow-none">
                <div className="text-xs font-bold uppercase tracking-wide text-ledger-deep">
                  {c.tag}
                </div>
                <h3 className="my-2.5 font-display text-lg font-semibold text-ink dark:text-white">{c.title}</h3>
                <p className="text-sm text-[#4B5563] dark:text-white/70">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="faq" className="border-t-4 border-ledger bg-[#E6FBFC] px-[6vw] py-16 dark:bg-[#0a1a1c]">
        <div className="mb-14 max-w-xl">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-widest text-stamp">
            Questions fréquentes
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink dark:text-white md:text-4xl">
            Ce qu&apos;on nous demande le plus souvent
          </h2>
        </div>
        <Reveal>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#0f171a]">
            {faqs.map((item, i) => (
              <details
                key={item.q}
                className={`group px-7 py-5 ${i !== faqs.length - 1 ? "border-b border-paperline dark:border-white/10" : ""}`}
              >
                <summary className="cursor-pointer list-none font-display text-base font-semibold text-ink dark:text-white marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="shrink-0 text-lg text-stamp transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#4B5563] dark:text-white/70">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <Reveal className="block">
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
      </Reveal>

      <footer className="flex flex-col items-center justify-between gap-2.5 border-t border-paperline bg-white px-[6vw] py-10 text-sm text-[#6B7280] dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white/60 md:flex-row">
        <div>© 2026 OliPay.</div>
        <div>Fait pour les entrepreneurs qui n&apos;ont pas le temps de tenir un tableur.</div>
      </footer>
    </main>
  );
}
