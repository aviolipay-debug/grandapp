// app/dashboard/profile/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { hashPinServer } from "@/lib/pin-server";

const PIN_REGEX = /^\d{4}$/;

async function getStoredPinHash(): Promise<{
  userId: string | null;
  storedHash: string | null;
  error?: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, storedHash: null, error: "Session expirée, reconnectez-vous." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("finance_pin_hash")
    .eq("id", user.id)
    .single();

  return { userId: user.id, storedHash: profile?.finance_pin_hash ?? null };
}

// Étape 1 de la modification : vérifie l'ancien code (ou le code de secours)
// SANS rien modifier — sert uniquement à autoriser le passage à l'étape 2
// (saisie du nouveau code) côté interface.
export async function verifyOldFinancePin(
  oldPin: string
): Promise<{ success: boolean; error?: string }> {
  if (!PIN_REGEX.test(oldPin)) {
    return { success: false, error: "Entrez un code à 4 chiffres." };
  }

  const { storedHash, error } = await getStoredPinHash();
  if (error) return { success: false, error };

  if (!storedHash) {
    // Ne devrait pas arriver depuis l'interface (ce flux n'est proposé que
    // si un PIN existe déjà), mais on refuse par sécurité plutôt que
    // d'accepter n'importe quoi.
    return { success: false, error: "Aucun code PIN à vérifier." };
  }

  const backupCode = process.env.FINANCE_PIN_BACKUP_CODE;
  const isBackupCode = !!backupCode && oldPin === backupCode;
  const isCorrectOldPin = hashPinServer(oldPin) === storedHash;

  if (!isBackupCode && !isCorrectOldPin) {
    return { success: false, error: "Code incorrect." };
  }

  return { success: true };
}

// Étape 2 : définit ou remplace le code PIN. Si un PIN existe déjà,
// l'ancien code (ou le code de secours) est revérifié ici, côté serveur —
// ne pas se fier uniquement à la validation faite à l'étape 1 côté
// interface, qui pourrait en théorie être contournée.
export async function setFinancePin(input: {
  oldPin?: string;
  newPin: string;
}): Promise<{ success: boolean; error?: string }> {
  const { oldPin, newPin } = input;

  if (!PIN_REGEX.test(newPin)) {
    return { success: false, error: "Le code doit contenir exactement 4 chiffres." };
  }

  const supabase = createClient();
  const { userId, storedHash, error } = await getStoredPinHash();
  if (error || !userId) {
    return { success: false, error: error ?? "Session expirée, reconnectez-vous." };
  }

  if (storedHash) {
    if (!oldPin || !PIN_REGEX.test(oldPin)) {
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
    .eq("id", userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
