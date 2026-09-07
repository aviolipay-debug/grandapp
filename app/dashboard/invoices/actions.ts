// app/dashboard/invoices/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { setFinanceUnlockCookie } from "@/lib/session/finance-unlock";
import { hashPinServer } from "@/lib/pin-server";

// Vérifie le PIN entièrement côté serveur : le hash stocké en base n'est
// jamais renvoyé au navigateur, et le PIN saisi n'est comparé qu'ici. En cas
// de succès, pose un cookie httpOnly signé qui déverrouille la zone
// Finances pour 20 minutes (voir lib/session/finance-unlock.ts).
export async function verifyFinancePin(pin: string): Promise<{ success: boolean }> {
  if (!/^\d{4}$/.test(pin)) {
    return { success: false };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("finance_pin_hash")
    .eq("id", user.id)
    .single();

  const storedHash = profile?.finance_pin_hash ?? null;

  // Pas de PIN défini pour ce compte : rien à vérifier, on refuse par
  // sécurité plutôt que de déverrouiller par défaut (ce cas ne devrait de
  // toute façon jamais arriver puisque la page ne montre l'écran de
  // verrouillage que si un PIN existe).
  if (!storedHash) {
    return { success: false };
  }

  const enteredHash = hashPinServer(pin);
  if (enteredHash !== storedHash) {
    return { success: false };
  }

  setFinanceUnlockCookie(user.id);
  return { success: true };
}
