# Maktaba Malikiya

Librairie française de livres en arabe. V1 de démonstration : **Stripe test uniquement, aucune vente réelle**.

Next.js App Router / React / TypeScript / Tailwind 4 / composant Button suivant le modèle shadcn (Radix Slot) / PostgreSQL 17 / Prisma 7.10.1 / Stripe Checkout / Resend. Les versions exactes sont verrouillées dans `package-lock.json`. Node 24 LTS recommandé (`.nvmrc`).

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

Pour une évolution du schéma, générer et relire une nouvelle migration SQL avant de la commiter. Ne pas lancer de migration dans un build Vercel : les previews concurrentes ne doivent pas modifier une base commune.

## GitHub et Vercel

Dépôt : https://github.com/mehdi-pro-test/maktaba-malikiyya. Le projet a été poussé sur `main` et `feat/boutique-v1`. Le dépôt a été créé par le propriétaire ; la tentative de passage en privé via l’intégration a été refusée, sa visibilité est à vérifier dans GitHub. Aucun autre dépôt n’a été modifié.

La boutique est déployée à l’adresse fournie par le propriétaire : https://maktaba-malikiyya.vercel.app. Un statut de build Vercel réussi a été constaté ; cela ne valide pas la base distante, les paiements ou les e-mails. La CI est livrée, son résultat hébergé doit être vérifié dans Actions. Utiliser la branche de développement pour les changements et configurer les protections de branche selon les accès disponibles.

Pour Vercel : importer **ce nouveau dépôt**, choisir Node 24, créer une base PostgreSQL dédiée Preview, renseigner les variables serveur ci-dessus, appliquer `db:migrate` puis `db:seed` depuis un runner de confiance connecté à cette base. `vercel.json` prépare le build. `APP_URL`, si renseignée, doit être l’origine HTTPS du site. Sans cette variable sur Vercel, l’application utilise automatiquement `VERCEL_URL`. Les domaines fournis par `VERCEL_URL` et `VERCEL_PROJECT_PRODUCTION_URL` sont aussi reconnus pour les previews, sans faire confiance aux en-têtes Host envoyés par le navigateur. Configurer un endpoint Stripe test `/api/webhooks/stripe` avec `checkout.session.completed` et `checkout.session.expired`, puis son secret propre. Chaque preview doit conserver sa base et son endpoint de test isolés ; ne pas réutiliser une base/endpoint de production.

Ne pas activer le déploiement public avant d’avoir réglé la protection d’accès de preview et la confidentialité. Aucune URL Vercel n’est annoncée sans déploiement réussi. Accès Vercel/liaison GitHub et secrets test restent à fournir dans les paramètres sécurisés, jamais dans le chat.

## Avant une exploitation commerciale

V1 bloque les paiements réels. Mentions légales, identité/contact vendeur, CGV, retours, conservation des données, TVA, pays livrés, éditions et visuels définitifs restent à valider. La page Informations les identifie comme incomplets ; elle ne fournit pas de faux renseignements juridiques. Ajouter une politique de rétention, sauvegardes, supervision et protection anti-abus en bordure avant exposition publique. Les confirmations reposent sur un jeton aléatoire 256 bits dont seul le hash est en base, sans adresse/e-mail dans la réponse ; traiter le lien comme confidentiel et limiter les journaux d’accès aux chemins sans query string.

La documentation fournie est conservée dans `docs/specifications`. Le rapport d’exécution est dans `docs/VALIDATION.md`.
