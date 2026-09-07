// lib/session/finance-unlock.ts
//
// Gère le déverrouillage de la zone Finances (protégée par PIN) via un jeton
// signé côté serveur, stocké dans un cookie httpOnly. Contrairement à un
// simple booléen "unlocked" côté navigateur, ce jeton :
// - ne peut pas être lu ou modifié par du JavaScript côté client (httpOnly)
// - ne peut pas être fabriqué par l'utilisateur (signature HMAC avec un
//   secret connu uniquement du serveur)
// - expire automatiquement après une courte durée
//
// Nécessite la variable d'environnement FINANCE_UNLOCK_SECRET (une chaîne
// aléatoire longue, ex: générée avec `openssl rand -hex 32`), à ajouter dans
// les variables d'environnement Vercel.

import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "finance_unlocked";
const UNLOCK_DURATION_MS = 20 * 60 * 1000; // 20 minutes

function getSecret(): string {
  const secret = process.env.FINANCE_UNLOCK_SECRET;
  if (!secret) {
    throw new Error(
      "FINANCE_UNLOCK_SECRET manquant — ajoutez cette variable d'environnement (une chaîne aléatoire longue) avant de déployer."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

// Jeton = "<userId>.<expiration>.<signature>". La signature garantit que
// personne ne peut fabriquer un jeton valide sans connaître le secret serveur.
function createUnlockToken(userId: string): string {
  const expiresAt = Date.now() + UNLOCK_DURATION_MS;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyUnlockToken(userId: string, token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [tokenUserId, expiresAtStr, signature] = parts;
  if (tokenUserId !== userId) return false;

  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = sign(`${tokenUserId}.${expiresAtStr}`);

  // Comparaison en temps constant pour éviter une attaque par mesure de
  // latence (timing attack) sur la vérification de signature.
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// À appeler uniquement après vérification réussie du PIN côté serveur.
export function setFinanceUnlockCookie(userId: string) {
  cookies().set(COOKIE_NAME, createUnlockToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/dashboard/invoices",
    maxAge: UNLOCK_DURATION_MS / 1000,
  });
}

// À appeler côté Server Component (page.tsx) pour savoir si l'utilisateur a
// déjà déverrouillé la zone Finances récemment.
export function isFinanceUnlocked(userId: string): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifyUnlockToken(userId, token);
}

export function clearFinanceUnlockCookie() {
  cookies().delete(COOKIE_NAME);
}
