"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types";

type LineItem = { description: string; quantity: number; unit_price: number };

export default function NewQuotePage() {
  const router = useRouter();
  const supabase = createClient();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
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

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const total = subtotal * (1 + taxRate / 100);

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
        quote_number: quoteNumber,
        subtotal,
        tax_rate: taxRate,
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
      items.map((it, i) => ({
        quote_id: quote.id,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        line_total: it.quantity * it.unit_price,
        sort_order: i,
      }))
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
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-medium text-ledger-deep">Nouveau devis</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ledger-deep">Client</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
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
            <label className="mb-1.5 block text-sm font-medium text-ledger-deep">
              Numéro de devis
            </label>
            <input
              required
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="DEV-0001"
              className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ledger-deep">Articles</label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_120px_28px] gap-2">
                <input
                  required
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  className="rounded border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                  className="rounded border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Prix"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                  className="rounded border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="text-stamp disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-3 text-sm font-medium text-stamp"
          >
            + Ajouter une ligne
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-ledger-deep">TVA (%)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-24 rounded border border-paperline bg-white px-3 py-2 text-sm focus:border-ledger-deep focus:outline-none"
          />
        </div>

        <div className="rounded-md border border-paperline bg-white p-4 font-mono text-sm">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{subtotal.toLocaleString("fr-FR")}</span>
          </div>
          <div className="mt-1 flex justify-between font-bold text-ledger-deep">
            <span>Total</span>
            <span>{total.toLocaleString("fr-FR")}</span>
          </div>
        </div>

        {error && <p className="text-sm text-stamp">{error}</p>}

        <button
          type="submit"
          disabled={loading || !clientId}
          className="rounded bg-ledger-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-stamp disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Créer le devis"}
        </button>
      </form>
    </div>
  );
}
