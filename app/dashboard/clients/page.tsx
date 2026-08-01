import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ledger-deep">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="rounded bg-ledger-deep px-4 py-2 text-sm font-semibold text-paper hover:bg-stamp"
        >
          Nouveau client
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-paperline bg-white">
        {!clients || clients.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#8a8368]">
            Aucun client pour l&apos;instant. Ajoutez-en un pour créer votre premier devis.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paperline text-left font-mono text-xs uppercase tracking-wide text-[#8a8368]">
                <th className="px-6 py-3 font-medium">Nom</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {(clients as Client[]).map((c) => (
                <tr key={c.id} className="border-b border-paperline last:border-0">
                  <td className="px-6 py-4 font-medium text-ledger-deep">{c.name}</td>
                  <td className="px-6 py-4 text-[#3A3527]">{c.email ?? "—"}</td>
                  <td className="px-6 py-4 text-[#3A3527]">{c.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
