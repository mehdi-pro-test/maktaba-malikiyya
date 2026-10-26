> **PR Ultime — 190 ajouts propriétaire-approuvés (non déployée)** : Bidāya passe à 150 et Al-Istidhkār à 60 questions sur cette branche, soit 610 au total, avec dix questions par partie. La certification des citations/attributions reste distincte et non attestée. Voir [intégration et limites](docs/quiz-v1.3-ultime-190/README.md). La Production n’est pas modifiée par cette PR.

> **Activation des 180 questions validée par le propriétaire : 420 questions publiées**. Les trois ouvrages intermédiaires et les trois avancés passent à 40 questions chacun, avec dix questions tirées par partie. Voir [confirmation et périmètre](docs/quiz-v1.3-import-180/ACTIVATION-2026-10-26.md). Les états antérieurs ci-dessous restent historiques.

> **Import éditorial de 180 questions (PR non fusionnée)** : six lots intermédiaires/avancés ajoutés au circuit éditorial, avec l’approbation du propriétaire conservée. Citations et attributions non attestées : **aucune nouvelle publication**, les 240 questions actives sont préservées. Voir [inventaire et points à vérifier](docs/quiz-v1.3-import-180/README.md).

> **Activation V1.3 :** le propriétaire a demandé la publication des 90 nouvelles questions et confirmé leur relecture le 26 octobre 2026. La banque passe à **240 questions publiées**, dont **40 par ouvrage débutant** ; dix sont tirées par partie. Voir [la déclaration enregistrée](docs/quiz-v1.3/ACTIVATION-90-2026-10-26.md) et [l’inventaire courant](docs/quiz-v1.3/INVENTAIRE.md). Les états précédents ci-dessous sont historiques.

> **V1.3 technique (PR en attente, non déployée)** : tirage serveur de dix questions distinctes par partie, stable jusqu’au résultat ; Rejouer effectue un nouveau tirage. La banque conserve **150 questions publiées** ; les **90 nouvelles candidates restent en brouillon**. Voir [architecture et import futur](docs/quiz-v1.3/TECHNIQUE.md), [inventaire exact](docs/quiz-v1.3/INVENTAIRE.md) et [tests et non-régression](docs/quiz-v1.3/VALIDATION.md). La navigation vers les niveaux et la suppression du classique sont conservées.

> **État actuel V1.1 :** PR #1 fusionnée et boutique démo publiée. Akhdari confirmé à 15 € / 15 exemplaires, édition Maktaba Malikiyya ; quiz étendu à dix questions et visuels existants conservés. Voir [le suivi de finalisation](docs/v1.1/FINALISATION.md) pour migrations, sauvegardes, recette et blocages effectifs Stripe/Resend/GitHub. Les anciennes sections de livraison ci-dessous sont conservées comme historique.

# Maktaba Malikiya

Librairie française de livres en arabe. V1 de démonstration : **Stripe test uniquement, aucune vente réelle**.

Next.js App Router / React / TypeScript / Tailwind 4 / composant Button suivant le modèle shadcn (Radix Slot) / PostgreSQL 17 / Prisma 7.10.1 / Stripe Checkout / Resend. Les versions exactes sont verrouillées dans `package-lock.json`. Node 24 LTS recommandé (`.nvmrc`).

## Évolution V1.1 — Livres, quiz et confort d’achat

La branche `feat/v1.1-livres-quiz` fait évoluer la V1 sans supprimer les données existantes. Navigation : Accueil / Livres (Coran, Hadith, Fiqh) / Quiz / Panier. Le Mukhtasar al-Akhdari est un brouillon non achetable, sans prix ni stock inventés. Le quiz contient uniquement les deux questions du PO ; huit emplacements restent cachés. Les couvertures réelles sont des références non autorisées à publier : les SVG sont conservés.

Une nouvelle migration additive est nécessaire **avant** d’utiliser le code V1.1 sur une base existante. Pour la preview, utiliser une base distincte de Production, la préparer explicitement puis lancer le build. La production reste sur `main` tant que la PR n’est pas validée. Ne pas re-seeder des stocks manuellement ni remplacer le runner de migrations.

Voir [architecture et décisions](docs/v1.1/ARCHITECTURE.md), [migration/preview/rollback](docs/v1.1/MIGRATION-ET-PREVIEW.md) et [validation V1.1](docs/v1.1/VALIDATION.md). La documentation PO originale est dans `docs/specifications-v1.1`. Les références média sont dans `src/data/cover-references.json`.

Pour ajouter une catégorie : modifier `src/data/categories.ts`, choisir un slug distinct des produits, puis exécuter `npm run db:seed` sur la base concernée. Pour compléter le quiz : renseigner les huit brouillons de `src/data/quiz-v1.1.json` avec choix/réponses/explication validés, puis passer leur statut à `published`. Le score et le nombre affiché se recalculent depuis les questions valides, sans modifier les composants.

## Démarrer en local

```sh
npm ci
cp .env.example .env # uniquement si votre fichier local n’existe pas
# docker compose up -d db
# Dans l’environnement cloud déjà préparé : docker start maktaba-postgres si nécessaire
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Ouvrir le serveur sur le port 3000. Le catalogue, les catégories, les fiches, le panier persistant et le formulaire invité fonctionnent sans clé de paiement. Le formulaire signale avant soumission si la clé Stripe de test ou le secret webhook manque ; le bouton est alors désactivé. Aucune commande ni paiement réussi n’est simulé. N’utiliser que des coordonnées fictives.

Le fichier `.env` est chargé par Next et `dotenv` pour les scripts. Ne jamais commiter les valeurs privées. L’authentification PostgreSQL `trust` de Compose est réservée à la machine locale et au port loopback, jamais à une base distante.

### Catalogue

Deux produits : Coran (Moshaf) 10 €, Sahih al-Bukhari 100 €, stock initial 10 chacun. Le seed est idempotent et **ne réinitialise pas** les prix/stocks existants. Les couvertures SVG et la scène CSS sont des créations graphiques provisoires ; aucune édition réelle n’est représentée. Pas de photos ou de polices externes.

Pour modifier des produits sans interface admin : `npm run catalog:update -- --id moshaf-coran --price 1200 --stock 15` (centimes). Options `--title-fr`, `--title-ar`, `--image`, `--active true|false` documentées dans le script. La modification de stock utilise le même verrou que les commandes et refuse un stock inférieur aux réservations actives. Les images vont dans `public/images` ; `--image /images/fichier.svg`. Les anciennes commandes conservent leur prix/titre figés.

## Configuration

| Variable                     | Usage                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`               | PostgreSQL ; base dédiée par environnement, chiffrement/TLS selon le fournisseur |
| `APP_URL`                    | Origine exacte ; local `http://localhost:3000`, HTTPS ailleurs                   |
| `SHIPPING_ALLOWED_COUNTRIES` | Par défaut FR,BE,DE,ES,IT,LU,NL ; liste provisoire à valider commercialement     |
| `STRIPE_SECRET_KEY`          | Clé `sk_test_` exclusivement, serveur uniquement                                 |
| `STRIPE_WEBHOOK_SECRET`      | Secret de signature du endpoint test                                             |
| `RESEND_API_KEY`             | Facultatif pour développer, nécessaire aux vrais envois de confirmation          |
| `RESEND_FROM_EMAIL`          | Expéditeur effectivement autorisé/vérifié chez Resend                            |

La liste des codes européens reconnus est dans `src/lib/rules.ts`. Les pays absents de la configuration sont refusés. FR : code postal métropolitain requis, 4 € sous 50 €, gratuit dès 50 €. Europe autorisée : 20 € sans gratuité. Pas d’estimation de délai ni d’intégration transporteur. Le régime fiscal n’est pas présumé.

## Paiement de test et webhook

1. Configurer une clé secrète Stripe **test** dans `.env`. Les clés live sont refusées avant toute réservation.
2. Installer Stripe CLI via la source officielle puis `stripe login` et `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
3. Mettre le secret `whsec_…` fourni par ce transfert dans `STRIPE_WEBHOOK_SECRET`, relancer le serveur.
4. Commander 1 Coran en France : 14 €. Dans Checkout, utiliser la carte de test officielle Stripe `4242 4242 4242 4242`, date future, CVC de test ; jamais une vraie carte.
5. Vérifier la commande `PAID`, le stock à 9, la réservation `CONSUMED` et une seule ligne d’outbox. Rejouer le webhook : aucun second retrait.
6. Vérifier la confirmation via le lien opaque de retour. Le retour navigateur seul ne paie jamais la commande.

Stripe n’est **pas** simulé par l’application exposée au navigateur. Les tests automatisés utilisent des fixtures hors réseau distinctes et clairement identifiées. Sans clés, le parcours réel Stripe reste non validé.

### Cohérence des stocks et reprise

Toutes les mutations du commerce utilisent le verrou transactionnel PostgreSQL `741825`. Une réservation active reste déduite du disponible même après son échéance locale : seule une expiration confirmée chez Stripe peut la libérer. Les ventes décrémentent une seule fois sous le verrou ; les événements et sessions sont uniques. Les montants et la devise du webhook sont comparés à la commande.

`npm run reconcile` consulte Stripe et traite les paiements ou expirations dont le webhook aurait été perdu. Un timeout de création de session conserve la réservation ; le rapprochement recherche la session via `metadata.orderId`. Une commande sans session identifiable reste bloquée plutôt que risquer une survente. Vérifier Stripe et les requêtes en cours avant toute libération manuelle sous le verrou. Pour `REQUIRES_REVIEW`, ne pas expédier : vérifier le paiement, restaurer une réservation si possible ou prévoir un remboursement **de test** manuel. Aucun remboursement automatique ni expédition réelle en V1.

Le clic « retour » depuis Checkout n’annule pas à lui seul la session Stripe. La réservation reste active jusqu’à son expiration vérifiée (session de 30 minutes), ou son paiement. Planifier `reconcile` toutes les 5 minutes via un ordonnanceur externe sécurisé avant une démonstration prolongée.

### E-mail et outbox

L’outbox est écrite dans la transaction de paiement. Sans Resend/expéditeur, état `NOT_CONFIGURED`, pas de faux « envoyé ». `npm run email:retry` réessaie les envois et récupère les `SENDING` bloqués depuis 10 minutes. Clé d’idempotence fournisseur stable ; après 23 heures, un envoi déjà tenté est placé en `REQUIRES_REVIEW`, car Resend ne conserve sa clé que 24 h. Vérifier le résultat chez le fournisseur avant une reprise manuelle. Configurer un domaine vérifié ; le domaine de test Resend impose ses propres restrictions de destinataire.

Planifier aussi `email:retry` toutes les 5 minutes sur un runner de confiance. Aucun endpoint public d’administration n’est créé. Un échec e-mail ne remet pas en cause un paiement confirmé.

## Tests

```sh
npm run lint
npm run typecheck
npm test
# Base distincte obligatoire, le nom DOIT contenir maktaba_test : tests destructifs
# docker exec maktaba-postgres createdb -U maktaba maktaba_test
DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test npm run db:migrate
DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test npm run test:integration
npx playwright install --with-deps chromium
npm run test:e2e
npm run build
```

Sur cette machine, Chromium est déjà installé : `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Ne pas configurer de clé Stripe pour la suite navigateur de base, qui contrôle le message d’intégration absente. Les tests d’intégration utilisent réellement PostgreSQL et la vérification cryptographique Stripe, mais **simulent les API externes**. GitHub Actions reprend ces vérifications avec une base éphémère.

### Migrations

Prisma utilise son moteur client JavaScript et l’adaptateur officiel `@prisma/adapter-pg`, sans binaire de requête natif. Les migrations SQL versionnées proviennent du schéma Prisma ; `db:migrate` les applique avec `pg`, une transaction, un verrou et un journal de sommes SHA-256 `_MaktabaMigration`. Une migration déjà appliquée ne doit jamais être éditée. Ne pas mélanger ce journal avec `prisma migrate deploy`. La génération utilise Prisma 7 et son moteur client JavaScript stable. Ce runner SQL évite le téléchargement de moteurs natifs dans le cloud et fonctionne également sur une base gérée ; son journal est propre à cette application.

Pour une évolution du schéma, générer et relire une nouvelle migration SQL avant de la commiter. La toute première installation peut initialiser automatiquement une base vide dédiée en Production (voir ci-dessous). Les previews et les futures migrations ne modifient pas automatiquement le schéma pendant le build.

## GitHub et Vercel

Dépôt : https://github.com/mehdi-pro-test/maktaba-malikiyya. Le projet a été poussé sur `main` et `feat/boutique-v1`. Le dépôt a été créé par le propriétaire ; la tentative de passage en privé via l’intégration a été refusée, sa visibilité est à vérifier dans GitHub. Aucun autre dépôt n’a été modifié.

La boutique est déployée à l’adresse fournie par le propriétaire : https://maktaba-malikiyya.vercel.app. Un statut de build Vercel réussi a été constaté ; cela ne valide pas la base distante, les paiements ou les e-mails. La CI est livrée, son résultat hébergé doit être vérifié dans Actions. Utiliser la branche de développement pour les changements et configurer les protections de branche selon les accès disponibles.

Pour Vercel : importer **ce nouveau dépôt**, choisir Node 24, créer une base PostgreSQL dédiée Preview, renseigner les variables serveur ci-dessus, Le premier déploiement Production initialise une nouvelle base complètement vide ; pour une base déjà partiellement initialisée, exécuter explicitement `db:migrate` puis `db:seed` depuis un runner de confiance. `vercel.json` prépare le build. `APP_URL`, si renseignée, doit être l’origine HTTPS du site. Sans cette variable sur Vercel, l’application utilise automatiquement `VERCEL_URL`. Les domaines fournis par `VERCEL_URL` et `VERCEL_PROJECT_PRODUCTION_URL` sont aussi reconnus pour les previews, sans faire confiance aux en-têtes Host envoyés par le navigateur. Configurer un endpoint Stripe test `/api/webhooks/stripe` avec `checkout.session.completed` et `checkout.session.expired`, puis son secret propre. Chaque preview doit conserver sa base et son endpoint de test isolés ; ne pas réutiliser une base/endpoint de production.

Ne pas activer le déploiement public avant d’avoir réglé la protection d’accès de preview et la confidentialité. Aucune URL Vercel n’est annoncée sans déploiement réussi. Accès Vercel/liaison GitHub et secrets test restent à fournir dans les paramètres sécurisés, jamais dans le chat.

### Premier démarrage sur Vercel sans terminal

1. Ouvrir le projet `maktaba-malikiyya`, puis **Storage → Create Database** et choisir PostgreSQL/Neon. Créer une **nouvelle base dédiée** à cette boutique et la connecter au projet, notamment à l’environnement Production. Les libellés exacts peuvent varier dans Vercel.
2. Vérifier dans **Settings → Environment Variables** qu’une variable serveur `DATABASE_URL` a été ajoutée par l’intégration. Ne pas copier sa valeur dans le chat ou dans Git.
3. Redéployer la branche `main` en **Production** avec la commande de build du dépôt : `npm run vercel:build` (retirer un éventuel ancien override `npm run build` dans les réglages).

Le premier build Production vérifie que la base est vide, génère Prisma, applique les migrations versionnées et ajoute les deux produits. Ce mécanisme refuse une base contenant des tables étrangères au projet. Les builds suivants vérifient la connexion, les tables et le catalogue sans réinitialiser les produits ou les commandes. Les previews n’initialisent jamais une base automatiquement. Les évolutions futures du schéma exigent une migration explicite, hors build courant.

Sans base connectée, le build échoue avec `DATABASE_URL_MISSING` au lieu d’annoncer un déploiement prêt dont le catalogue plante à l’ouverture. Les autres diagnostics sont `DATABASE_UNREACHABLE`, `DATABASE_SCHEMA_MISSING` et `CATALOG_EMPTY` ; aucune valeur de connexion n’est imprimée par ce contrôle. Le script `npm run vercel:setup` permet une initialisation/réparation explicite sur une base dédiée existante ; il est refusé dans une preview Vercel.

Après le chargement du catalogue, le paiement nécessite encore les clés Stripe **test** et le webhook détaillés plus haut. Connecter PostgreSQL ne configure pas Stripe ou Resend.

## Avant une exploitation commerciale

V1 bloque les paiements réels. Mentions légales, identité/contact vendeur, CGV, retours, conservation des données, TVA, pays livrés, éditions et visuels définitifs restent à valider. La page Informations les identifie comme incomplets ; elle ne fournit pas de faux renseignements juridiques. Ajouter une politique de rétention, sauvegardes, supervision et protection anti-abus en bordure avant exposition publique. Les confirmations reposent sur un jeton aléatoire 256 bits dont seul le hash est en base, sans adresse/e-mail dans la réponse ; traiter le lien comme confidentiel et limiter les journaux d’accès aux chemins sans query string.

La documentation fournie est conservée dans `docs/specifications`. Le rapport d’exécution est dans `docs/VALIDATION.md`.

## Administration propriétaire V1.4

Le back-office privé, la migration additive, la configuration MFA/Blob et la procédure de retour arrière sont décrits dans [docs/v1.4-admin/README.md](docs/v1.4-admin/README.md). L'accès reste fermé par défaut. Les données de quiz et de catalogue publiées en DB nécessitent des flags distincts de l'ouverture de l'admin ; voir les instructions avant activation ou rollback. Aucun bootstrap de propriétaire n'est exécuté au build.
