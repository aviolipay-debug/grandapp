# Déployer Grand — guide pas à pas

Le projet est prêt (commit git déjà fait localement). Il te reste 4 étapes, environ 15 minutes au total, aucune ligne de commande complexe.

## 1. Créer le projet Supabase (5 min)

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Choisis un nom, un mot de passe de base de données, une région proche de tes utilisateurs
3. Une fois le projet créé, ouvre **SQL Editor** (menu de gauche)
4. Colle tout le contenu de `db/schema.sql` (fourni plus haut dans la conversation) et clique **Run**
   → ça crée les tables, la sécurité (RLS), et le trigger de création de profil
5. Va dans **Project Settings > API**, garde cette page ouverte, tu auras besoin de :
   - `Project URL`
   - `anon public` key

## 2. Mettre le code sur GitHub (5 min)

Le projet est déjà un dépôt git local avec un premier commit. Pour le pousser :

1. Crée un nouveau dépôt vide sur [github.com/new](https://github.com/new) (ne coche AUCUNE case d'initialisation — pas de README, pas de .gitignore, pas de licence)
2. Télécharge le dossier `grand-app` depuis cette conversation, ouvre un terminal dedans, puis :

```bash
git remote add origin https://github.com/TON-USERNAME/grand-app.git
git branch -M main
git push -u origin main
```

*(Si tu préfères, tu peux aussi glisser-déposer le dossier directement dans l'interface GitHub, mais ça perd l'historique git.)*

## 3. Déployer sur Vercel (3 min)

1. Va sur [vercel.com/new](https://vercel.com/new)
2. Connecte ton compte GitHub si ce n'est pas déjà fait, puis sélectionne le dépôt `grand-app`
3. Vercel détecte automatiquement Next.js — ne change rien aux réglages de build
4. Avant de cliquer "Deploy", ouvre la section **Environment Variables** et ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` → la valeur copiée à l'étape 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → la valeur copiée à l'étape 1
5. Clique **Deploy**

Vercel installe les dépendances, build le projet, et te donne une URL en `.vercel.app` en 1 à 2 minutes.

## 4. Vérifier que tout fonctionne

Une fois déployé :
- Ouvre l'URL fournie, crée un compte via `/signup`
- Vérifie tes emails pour confirmer le compte (Supabase envoie un lien automatiquement)
- Connecte-toi, crée un client, un devis, convertis-le en facture, télécharge le PDF

## Si un déploiement échoue

Le cas le plus probable : les variables d'environnement manquantes ou mal nommées.
Vérifie dans Vercel → Project Settings → Environment Variables que les deux clés
sont bien orthographiées exactement comme ci-dessus, puis relance un déploiement
(Deployments → ⋯ → Redeploy).

## Nom de domaine personnalisé

Une fois le premier déploiement validé : Vercel → Project Settings → Domains →
ajoute ton propre nom de domaine (ex. `grand.app` ou ce que tu choisis).
