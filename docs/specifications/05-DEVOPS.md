# 05 — DevOps et mise en route

## GitHub, dépôt local et sécurité

GitHub : `https://github.com/mehdi-pro-test`. Cible conseillée : **nouveau dépôt privé** `mehdi-pro-test/maktaba-malikiya`, séparé des dépôts existants. Codex doit vérifier sa capacité à créer le dépôt ; si l'accès manque, fournir l'instruction précise. Ne pas écraser de dépôt existant et ne jamais forcer `push --force` sur `main`.

- Créer le projet dans un nouveau répertoire local `maktaba-malikiya`.
- Stratégie : `main` stable, branches `feat/*` ou `chore/*`, commits conventionnels (`feat:`, `fix:`, `test:`, `docs:`). PR et revue / checks pour fusion lorsqu'ils sont disponibles.
- `.gitignore` inclut `.env*` sauf `.env.example`, `node_modules`, build artifacts, logs.
- GitHub Actions CI : `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (adapter les scripts réellement présents). DB de test si nécessaire ; secrets via GitHub/Vercel uniquement, jamais dans YAML ni logs.
- Ne pas présumer que la protection de branche est activée ; la configurer si autorisée, sinon fournir la procédure.

## Variables d'environnement

Utiliser `.env.example` de ce dossier comme contrat indicatif. Respecter les conventions réelles de Next.js/Prisma/Stripe. Séparer environnement local, CI, preview, production. En V1 toute configuration de Stripe demeure **test-only**. `DATABASE_URL`, clé secrète Stripe, secret webhook, clé Resend : exclusivement côté serveur.

## Prérequis

Node.js LTS compatible avec les dépendances, npm, Git, PostgreSQL local ou géré, comptes Stripe en mode test, Resend pour mail vérifié, GitHub et Vercel. La disponibilité de ces services et autorisations doit être constatée, jamais supposée.

## Instructions de départ (adaptables par Codex)

```bash
# Dans un dossier de travail sûr :
# git clone https://github.com/mehdi-pro-test/maktaba-malikiya.git
# cd maktaba-malikiya
npm ci                         # ou npm install s'il n'existe pas encore de lockfile
cp .env.example .env.local     # adapter selon chargeur d'environnement Prisma
# Renseigner les variables de test via un éditeur (ne jamais partager les valeurs)
npx prisma migrate dev
npx prisma db seed             # si configuré dans package.json
npm run dev
```

Les commandes sont un **guide**, pas la preuve que le dépôt existe déjà ou que les scripts/migrations fonctionnent. Codex doit fournir la séquence exacte après implémentation.

## Déploiement Vercel

1. Importer le nouveau dépôt GitHub dans Vercel après validation des tests.
2. Renseigner les variables serveur requises sur Vercel pour Preview ; utiliser DB distincte ou explicitement isolée des autres projets.
3. Configurer `APP_URL` de l'URL Vercel retenue ; enregistrer l'endpoint webhook Stripe test et sa signature correspondante.
4. Préparer la migration de base avec méthode reproductible. Attention aux builds concurrents et aux environnements preview ; ne pas migrer une DB partagée lors d'un simple preview sans stratégie explicite.
5. Vérifier sur l'URL Vercel : catalogue, responsive, livraison, Stripe test, webhooks, email.
6. Déploiement de `main` seulement après CI verte et, si souhaité, validation explicite ; configurer les règles Vercel/GitHub plutôt que promettre une dépendance CI inexistante.

## Livrables de fin de tâche pour Codex

- URL GitHub réelle (si dépôt créé) + chemin local.
- URL Vercel réelle **seulement si déployée**.
- Liste des commandes exécutées et résultats.
- Liste des variables manquantes (noms uniquement).
- Captures si réalisables, état des tests, limitations non levées.
- Bloc « Actions manuelles du propriétaire » le plus court possible.
