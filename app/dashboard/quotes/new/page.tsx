// app/dashboard/quotes/new/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types";

type LineItem = { description: string; quantity: string; unit_price: string };

export default function NewQuotePage() {
  return (
    <Suspense fallback={null}>
      <NewQuoteForm />
    </Suspense>
  );
}

function NewQuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(searchParams.get("client_id") ?? "");
  const projectId = searchParams.get("project_id");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [projectName, setProjectName] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState("0");
  const [discountRate, setDiscountRate] = useState("0");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unit_price: "0" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("clients")
      .select("*")
      .order("name")
      .then(({ data }) => setClients((data as Client[]) ?? []));
  }, [supabase]);

  // Le nom du projet sert directement d'"objet" du devis — plus besoin de le saisir.
  useEffect(() => {
    if (!projectId) {
      setProjectName(null);
      return;
    }
    supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single()
      .then(({ data }) => setProjectName(data?.name ?? null));
  }, [supabase, projectId]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: "1", unit_price: "0" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // Un devis doit toujours être créé depuis un projet — pas d'accès direct.
  if (!projectId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-0">
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">
          Sélectionnez d&apos;abord un projet
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-white/60">
          Pour créer un devis, ouvrez la fiche du client concerné, choisissez
          (ou créez) le projet, puis lancez le devis depuis là — l&apos;objet
          du devis reprend automatiquement le nom du projet.
        </p>
        <Link
          href="/dashboard/clients"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-ledger-deep px-5 py-3 text-sm font-semibold text-paper hover:bg-stamp"
        >
          Voir mes clients
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0
  );
  const discountAmount = subtotal * ((Number(discountRate) || 0) / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const total = subtotalAfterDiscount * (1 + (Number(taxRate) || 0) / 100);
  const currency = "CFA";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setLoading(false);
      return;
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        owner_id: user.id,
        client_id: clientId,
        project_id: projectId || null,
        quote_number: quoteNumber,
        objet: projectName,
        subtotal,
        discount_rate: Number(discountRate) || 0,
        tax_rate: Number(taxRate) || 0,
        total,
      })
      .select()
      .single();

    if (quoteError || !quote) {
      setError(quoteError?.message ?? "Erreur lors de la création du devis.");
      setLoading(false);
      return;
    }

    const { error: itemsError } = await supabase.from("quote_items").insert(
      items.map((it, i) => {
        const quantity = Number(it.quantity) || 0;
        const unit_price = Number(it.unit_price) || 0;
        return {
          quote_id: quote.id,
          description: it.description,
          quantity,
          unit_price,
          line_total: quantity * unit_price,
          sort_order: i,
        };
      })
    );

    if (itemsError) {
      setError(itemsError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/quotes");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h1 className="font-display text-2xl font-bold text-ink dark:text-white">
        Nouveau devis
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="rounded-2xl border border-paperline bg-white p-5 dark:border-white/10 dark:bg-[#262626]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
                Client
              </label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-lg border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
              >
                <option value="">Sélectionner...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
                Numéro de devis
              </label>
              <input
                required
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="DEV-0001"
                className="w-full rounded-lg border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
              Objet
            </label>
            {projectName ? (
              <p className="w-full rounded-lg border border-paperline bg-black/[0.02] px-4 py-2.5 text-sm text-ink dark:border-white/10 dark:bg-white/5 dark:text-white">
                {projectName}
              </p>
            ) : (
              <p className="text-xs text-[#6B7280] dark:text-white/50">
                Ce devis n&apos;est rattaché à aucun projet — l&apos;objet sera vide.
              </p>
            )}
          </div>
        </div>

        {/* Lignes d'articles */}
        <div>
          <label className="mb-3 block text-sm font-medium text-ink dark:text-white/80">
            Articles
          </label>

          <div className="overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#262626]">
            {/* En-tête, visible seulement à partir de sm */}
            <div className="hidden grid-cols-[1fr_90px_120px_120px_36px] gap-3 border-b border-paperline px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:border-white/10 dark:text-white/50 sm:grid">
              <span>Désignation</span>
              <span>Quantité</span>
              <span>Prix U.</span>
              <span className="text-right">Montant</span>
              <span />
            </div>

            <div className="divide-y divide-paperline dark:divide-white/10">
              {items.map((item, i) => (
                <div key={i} className="p-4">
                  {/* Version mobile : champs empilés avec labels */}
                  <div className="space-y-3 sm:hidden">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6B7280] dark:text-white/50">
                        Désignation
                      </label>
                      <input
                        required
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(i, { description: e.target.value })}
                        className="w-full rounded-lg border border-paperline bg-white px-3 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6B7280] dark:text-white/50">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, { quantity: e.target.value })}
                          className="w-full rounded-lg border border-paperline bg-white px-3 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6B7280] dark:text-white/50">
                          Prix U.
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(i, { unit_price: e.target.value })}
                          className="w-full rounded-lg border border-paperline bg-white px-3 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-semibold text-ink dark:text-white">
                        Montant : {((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString("fr-FR")} {currency}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        disabled={items.length === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-stamp hover:bg-stamp/10 disabled:opacity-30"
                        aria-label="Supprimer la ligne"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Version desktop : grille 4 colonnes */}
                  <div className="hidden grid-cols-[1fr_90px_120px_120px_36px] items-center gap-3 sm:grid">
                    <input
                      required
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      className="rounded-lg border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, { quantity: e.target.value })}
                      className="rounded-lg border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(i, { unit_price: e.target.value })}
                      className="rounded-lg border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                    />
                    <span className="text-right text-sm font-semibold text-ink dark:text-white">
                      {((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString("fr-FR")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      disabled={items.length === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-stamp hover:bg-stamp/10 disabled:opacity-30"
                      aria-label="Supprimer la ligne"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-stamp"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-ink dark:text-white/80">TVA (%)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-24 rounded-lg border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-ink dark:text-white/80">Remise (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              className="w-24 rounded-lg border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-paperline bg-white p-5 font-mono text-sm dark:border-white/10 dark:bg-[#262626]">
          <div className="flex justify-between text-[#6B7280] dark:text-white/60">
            <span>Montant Total HT</span>
            <span>{subtotal.toLocaleString("fr-FR")} {currency}</span>
          </div>
          {(Number(discountRate) || 0) > 0 && (
            <div className="mt-2 flex justify-between text-[#6B7280] dark:text-white/60">
              <span>Remise ({discountRate}%)</span>
              <span>- {discountAmount.toLocaleString("fr-FR")} {currency}</span>
            </div>
          )}
          {(Number(taxRate) || 0) > 0 && (
            <div className="mt-2 flex justify-between text-[#6B7280] dark:text-white/60">
              <span>TVA ({taxRate}%)</span>
              <span>{(total - subtotalAfterDiscount).toLocaleString("fr-FR")} {currency}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-paperline pt-2 text-base font-bold text-ink dark:border-white/10 dark:text-white">
            <span>Montant Total TTC</span>
            <span>{total.toLocaleString("fr-FR")} {currency}</span>
          </div>
        </div>

        {error && <p className="text-sm text-stamp">{error}</p>}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading || !clientId}
            className="w-full rounded-lg bg-ledger-deep px-5 py-3 text-sm font-semibold text-paper hover:bg-stamp disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Enregistrement..." : "Créer le devis"}
          </button>
        </div>
      </form>
    </div>
  );
}
