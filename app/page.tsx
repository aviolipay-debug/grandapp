import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-paperline bg-paper px-[6vw] py-7">
        <div className="font-display text-2xl font-semibold">
          Grand<span className="text-stamp">.</span>
        </div>
        <nav className="hidden gap-8 md:flex">
          <a href="#fonctionnalites" className="text-sm font-medium text-ledger-deep hover:text-stamp">
            Fonctionnalités
          </a>
          <a href="#cibles" className="text-sm font-medium text-ledger-deep hover:text-stamp">
            Pour qui
          </a>
        </nav>
        <Link
          href="/signup"
          className="rounded border border-ledger-deep bg-ledger-deep px-6 py-3 text-sm font-semibold text-paper hover:bg-stamp hover:border-stamp"
        >
          Commencer gratuitement
        </Link>
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
          <p className="mt-6 max-w-[46ch] text-lg text-[#3A3527]">
            Grand transforme un devis accepté en facture en un clic, suit chaque
            paiement à la ligne près, et garde votre trésorerie lisible — sans
            jamais ouvrir un tableur.
          </p>
          <div className="mt-9 flex items-center gap-4">
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
          <div className="mt-4 font-mono text-xs text-[#6b6552]">
            Gratuit pour démarrer · aucune carte requise
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-[280px] -rotate-2 bg-[#FFFDF7] p-7 pb-10 font-mono text-sm shadow-[0_24px_60px_-20px_rgba(15,61,46,0.45)]">
            <div className="mb-4 text-center font-bold tracking-widest">FACTURE N˚ 0142</div>
            <div className="flex justify-between border-b border-dashed border-[#ddd6c4] py-1.5">
              <span>Refonte site vitrine</span>
              <span>450 000</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-[#ddd6c4] py-1.5">
              <span>Maintenance — 3 mois</span>
              <span>90 000</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-[#ddd6c4] py-1.5">
              <span>Nom de domaine</span>
              <span>15 000</span>
            </div>
            <div className="mt-3.5 flex justify-between text-base font-bold">
              <span>TOTAL XOF</span>
              <span>555 000</span>
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
            Le registre
          </div>
          <h2 className="font-display text-3xl font-medium leading-tight text-ledger-deep md:text-4xl">
            Trois colonnes, une seule vérité sur vos finances.
          </h2>
        </div>

        <div className="rounded-md bg-ledger-deep p-1">
          <div className="rounded bg-paper py-2.5">
            {[
              {
                n: "01",
                title: "Devis qui se transforment",
                body: "Créez un devis, envoyez-le, et regardez son statut évoluer en direct — vu, accepté, refusé. Un devis accepté devient une facture d'un geste.",
                note: "Statuts en temps réel, relances automatiques, export PDF prêt à envoyer.",
              },
              {
                n: "02",
                title: "Factures qui se surveillent seules",
                body: "Payée, en attente, en retard : chaque facture connaît son état. Les relances partent toutes seules quand une échéance approche.",
                note: "Paiements partiels supportés, multi-devises, historique complet par client.",
              },
              {
                n: "03",
                title: "Un coffre pour vos données",
                body: "Chaque document est chiffré et sauvegardé automatiquement. Rien ne se perd, même si vous changez de téléphone.",
                note: "Accès web et mobile, synchronisé en permanence.",
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
                  <p className="text-[15px] text-[#4a4534]">{item.body}</p>
                </div>
                <div>
                  <p className="font-mono text-sm text-[#8a8368]">{item.note}</p>
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
              body: "Gardez une vue claire sur la trésorerie pendant que tout le reste s'accélère autour de vous.",
            },
            {
              tag: "Freelances",
              title: "Indépendants",
              body: "Envoyez un devis pro en sortant d'un rendez-vous, en moins de temps qu'il n'en faut pour le raconter.",
            },
          ].map((c) => (
            <div key={c.tag} className="rounded-md border border-ledger-deep bg-[#FFFDF7] p-8">
              <div className="font-mono text-xs uppercase tracking-wide text-stamp">{c.tag}</div>
              <h3 className="my-2.5 font-display text-xl font-semibold text-ledger-deep">
                {c.title}
              </h3>
              <p className="text-[15px] text-[#4a4534]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ledger-deep px-[6vw] py-20 text-center text-paper">
        <h2 className="font-display text-3xl font-medium md:text-4xl">
          Ouvrez votre premier registre aujourd&apos;hui.
        </h2>
        <p className="mx-auto my-5 max-w-[50ch] text-[#C8C0A4]">
          Gratuit jusqu&apos;à 5 factures par mois. Aucune carte bancaire
          nécessaire pour commencer.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded border border-stamp bg-stamp px-6 py-3 text-sm font-semibold text-paper"
        >
          Créer mon compte
        </Link>
      </section>

      <footer className="flex flex-col items-center justify-between gap-2.5 border-t border-paperline px-[6vw] py-10 font-mono text-xs text-[#7a755f] md:flex-row">
        <div>© 2026 Grand.</div>
        <div>Fait pour les entrepreneurs qui n&apos;ont pas le temps de tenir un tableur.</div>
      </footer>
    </main>
  );
}
