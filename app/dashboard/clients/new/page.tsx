"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    const { error } = await supabase.from("clients").insert({
      owner_id: user.id,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/clients");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-medium text-ledger-deep">Nouveau client</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ledger-deep">Nom</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ledger-deep">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ledger-deep">Téléphone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ledger-deep">Adresse</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none"
            rows={2}
          />
        </div>

        {error && <p className="text-sm text-stamp">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-ledger-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-stamp disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Enregistrer le client"}
        </button>
      </form>
    </div>
  );
}
