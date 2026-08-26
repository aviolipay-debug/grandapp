// lib/pin.ts
// Hachage simple d'un code PIN côté navigateur (Web Crypto, SHA-256).
// Ce n'est pas un coffre-fort bancaire : c'est un écran de confidentialité
// pour éviter qu'un code PIN à 4 chiffres soit stocké ou visible en clair.

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
