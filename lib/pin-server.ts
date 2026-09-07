// lib/pin-server.ts
//
// Équivalent côté serveur (Node crypto) de la fonction hashPin de lib/pin.ts
// (qui utilise SubtleCrypto côté navigateur). Utilisé uniquement pour
// VÉRIFIER un PIN saisi contre le hash stocké en base — le hash lui-même
// n'est plus jamais envoyé au navigateur (voir app/dashboard/invoices/actions.ts).
//
// IMPORTANT : cette fonction doit produire exactement le même résultat que
// hashPin() dans lib/pin.ts pour un même PIN, sinon la vérification échouera
// toujours. Si lib/pin.ts fait autre chose qu'un simple SHA-256 hex du texte
// brut (par ex. un salage, un préfixe, un autre encodage), adapte la ligne
// ci-dessous en conséquence.
import crypto from "crypto";

export function hashPinServer(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}
