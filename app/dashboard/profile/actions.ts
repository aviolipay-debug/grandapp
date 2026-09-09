// app/dashboard/profile/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { hashPinServer } from "@/lib/pin-server";

const PIN_REGEX = /^\d{4}$/;

// Définit ou modifie le code PIN Finances entièrement côté serveur :
// - le hash stocké en base n'est jamais envoyé au navigateur
// - le code de secours (FINANCE_PIN_BACKUP_CODE) n'existe que côté serveur,
//   il n'apparaît plus jamais dans le bundle JavaScript du client
export async function setFinancePin(input: {
  oldPin: string;
  newPin: string;
}): Promise<{ success: boolean; error?: string }> {
  const { oldPin, newPin } = input;

  if (!PIN_REGEX.test(newPin)) {
    return { success: false, error: "Le nouveau code doit contenir exactement 4 chiffres." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expirée, reconnectez-vous." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("finance_pin_hash")
    .eq("id", user.id)
    .single();

  const storedHash = profile?.finance_pin_hash ?? null;

  // Si un PIN existe déjà, il faut prouver qu'on le connaît avant de le
  // changer — soit l'ancien code exact, soit le code de secours. Les deux
  // sont vérifiés ici, côté serveur, jamais côté navigateur.
  if (storedHash) {
    if (!PIN_REGEX.test(oldPin)) {
      return { success: false, error: "Entrez votre ancien code (4 chiffres)." };
    }

    const backupCode = process.env.FINANCE_PIN_BACKUP_CODE;
    const isBackupCode = !!backupCode && oldPin === backupCode;
    const isCorrectOldPin = hashPinServer(oldPin) === storedHash;

    if (!isBackupCode && !isCorrectOldPin) {
      return { success: false, error: "Ancien code incorrect." };
    }
  }

  const newHash = hashPinServer(newPin);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ finance_pin_hash: newHash })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
