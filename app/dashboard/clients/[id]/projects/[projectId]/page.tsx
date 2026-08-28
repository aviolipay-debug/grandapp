// app/dashboard/clients/[id]/projects/[projectId]/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateFR } from "@/lib/format-date";
import ProjectStatusButtons from "./ProjectStatusButtons";
import DocumentPreviewRow from "./DocumentPreviewRow";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  declined: "Refusé",
  expired: "Expiré",
};

const statusStyles: Record<string, string> = {
  draft: "bg-[#F3F4F6] text-[#6B7280]",
  sent: "bg-[#EAF3FC] text-[#2A89DA]",
  accepted: "bg-[#E7FAF9] text-[#00A6AC]",
  declined: "bg-[#FDEBEA] text-[#E5533F]",
  expired: "bg-[#F3F4F6] text-[#6B7280]",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string; projectId: string };
}) {
  const supabase = createClient();

  // Le projet et les devis ne dépendent pas l'un de l'autre — on les
  // lance en parallèle plutôt qu'en série pour gagner un aller-retour réseau.
  const [{ data: projectData }, { data: quotes }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, clients(name)")
      .eq("id", params.projectId)
      .single(),
    supabase
      .from("quotes")
      .select("id, quote_number, status, total, currency, issue_date")
      .eq("project_id", params.projectId)
      .order("created_at", { ascending: false }),
  ]);

  const project = projectData as any;

  const quoteId = quotes && quotes.length > 0 ? quotes[0].id : null;

  const { data: relatedInvoices } = quoteId
    ? await supabase
        .from("invoices")
        .select("id, invoice_number, document_type, status, total, amount_paid, currency, issue_date")
        .eq("quote_id", quoteId)
        .order("document_type", { ascending: true })
    : { data: null };

  const facture = relatedInvoices?.find((i) => i.document_type === "facture");
  const bordereau = relatedInvoices?.find((i) => i.document_type === "bordereau");

  const remainingDue = facture
    ? Number(facture.total) - Number(facture.amount_paid)
    : null;

  // Paramètre anti-cache : change à chaque affichage de la page, pour que les
  // navigateurs mobiles (qui accrochent leur lecteur PDF intégré à l'URL et
  // ignorent souvent les en-têtes Cache-Control une fois le PDF ouvert)
  // traitent chaque lien comme une URL neuve et redemandent le PDF au serveur.
  const cacheBust = Date.now();

  if (!project) {
    return <p className="text-sm text-[#6B7280] dark:text-white/50">Projet introuvable.</p>;
  }

  return (
    <div>
      <Link
        href={`/dashboard/clients/${params.id}`}
        className="text-sm font-semibold text-ledger-deep"
      >
        ← {(project.clients as any)?.name ?? "Client"}
      </Link>

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-ink dark:text-white">
          {project.name}
        </h1>
        {quotes && quotes.length > 0 ? (
          <Link
            href={`/dashboard/quotes/${quotes[0].id}/edit`}
            className="flex w-fit items-center gap-1.5 rounded-lg bg-ledger-deep px-3.5 py-2 text-sm font-semibold text-paper hover:bg-stamp"
          >
            Modifier le devis
          </Link>
        ) : (
          <Link
            href={`/dashboard/quotes/new?project_id=${project.id}&client_id=${params.id}`}
            className="flex w-fit items-center gap-1.5 rounded-lg bg-ledger-deep px-3.5 py-2 text-sm font-semibold text-paper hover:bg-stamp"
          >
            <Plus size={16} />
            Nouveau devis
          </Link>
        )}
      </div>

      {/* Statut du projet — "En cours" et "Terminé" ouvrent une popup de paiement,
          ou une alerte "Aucun Devis rattaché" si aucun devis n'existe encore. */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/40">
        Statut du projet
      </p>
      <ProjectStatusButtons
        projectId={project.id}
        clientId={params.id}
        currentStatus={project.status}
        remainingDue={remainingDue}
        currency={facture?.currency ?? "FCFA"}
        hasQuote={!!quotes && quotes.length > 0}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#262626]">
        {!quotes || quotes.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6B7280] dark:text-white/50">
            Aucun devis rattaché à ce projet pour l&apos;instant.
          </p>
        ) : (
          <div className="divide-y divide-paperline dark:divide-white/10">
            {quotes.map((q) => (
              <DocumentPreviewRow
                key={q.id}
                href={`/api/quotes/${q.id}/pdf?v=${cacheBust}`}
                filename={`devis-${q.quote_number}.pdf`}
                iconBg="#F3EEFC"
                iconColor="#5B21B6"
                title={`Devis · ${q.quote_number}`}
                subtitle={`${formatDateFR(q.issue_date)} · ${statusLabels[q.status] ?? q.status}`}
                amount={`${Number(q.total).toLocaleString("fr-FR")} ${q.currency}`}
              />
            ))}

            {facture && (
              <DocumentPreviewRow
                href={`/api/invoices/${facture.id}/pdf?v=${cacheBust}`}
                filename={`facture-${facture.invoice_number}.pdf`}
                iconBg="#E7FAF9"
                iconColor="#00A6AC"
                title={`Facture · ${facture.invoice_number}`}
                subtitle={formatDateFR(facture.issue_date)}
                amount={`${Number(facture.total).toLocaleString("fr-FR")} ${facture.currency}`}
              />
            )}

            {bordereau && (
              <DocumentPreviewRow
                href={`/api/invoices/${bordereau.id}/pdf?v=${cacheBust}`}
                filename={`bordereau-${bordereau.invoice_number}.pdf`}
                iconBg="#EAF3FC"
                iconColor="#2A89DA"
                title={`Bordereau de livraison · ${bordereau.invoice_number}`}
                subtitle={formatDateFR(bordereau.issue_date)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
