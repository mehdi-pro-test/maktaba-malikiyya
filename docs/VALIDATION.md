# Rapport de livraison — 25 octobre 2026

Projet local : `/workspace/maktaba-malikiya`. Branche de développement : `feat/boutique-v1`.

## Livré

- Interface française responsive, vert profond/crème/doré, logo typographique, bibliothèque originale en CSS, couvertures SVG provisoires sans édition inventée.
- Accueil, catalogue, catégories Coran/Hadith, fiches bilingues FR/AR, panier persistant avec quantités/suppression et estimation des frais.
- Catalogue PostgreSQL/Prisma : Coran 1 000 centimes et Bukhari 10 000 centimes, 10 exemplaires de chaque dans la base de développement. Script de modification des prix, stocks, titres et chemins d’images ; seed préservant les données existantes.
- Commande invité, coordonnées validées, calcul serveur des prix/livraison, réservations transactionnelles et contraintes SQL.
- Intégration Stripe Checkout exclusivement carte/test, vérification cryptographique des webhooks, confirmation par jeton opaque, transitions et stocks idempotents, état de revue pour paiements incohérents/tardifs.
- Outbox e-mail, adaptateur Resend, absence d’envoi clairement signalée si non configuré, réessais et idempotence bornée à la rétention fournisseur.
- Scripts de rapprochement Stripe et de reprise des e-mails ; CI GitHub Actions, configuration Vercel, `.env.example`, guide de démarrage et d’exploitation.

## Vérifications exécutées et réussies

| Vérification                                                                                                       | Résultat                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `npm ci` après passage à Prisma 7.10.1                                                                             | Installation réussie depuis le lockfile                                                  |
| `npm run db:generate`                                                                                              | Client Prisma 7.10.1 généré sans moteur natif                                            |
| `npm run db:migrate` répété                                                                                        | SQL appliqué, puis aucune réapplication ; journal de checksums                           |
| `npm run db:seed` répété                                                                                           | Catalogue préservé, aucun reset implicite                                                |
| `npm run catalog:update -- --id moshaf-coran --price 1000 --stock 10 --image /images/coran.svg`                    | Modification contrôlée exécutée                                                          |
| `npm run lint`                                                                                                     | Aucune erreur ni avertissement                                                           |
| `npm run typecheck`                                                                                                | Réussi                                                                                   |
| `npm test`                                                                                                         | **32 tests unitaires réussis**                                                           |
| `DATABASE_URL=…/maktaba_test npm run test:integration`                                                             | **20 tests réussis avec PostgreSQL réel**                                                |
| `npm run build`                                                                                                    | Build de production réussi, 12 routes dont 11 dynamiques et la page introuvable statique |
| `APP_URL=http://localhost:3001 npm start -- --port 3001`                                                           | Serveur de production démarré                                                            |
| `PLAYWRIGHT_BASE_URL=http://localhost:3001 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` | **12 tests navigateur réussis** sur le build de production, desktop/mobile Chromium      |
| Contrôle navigateur des 8 pages principales                                                                        | HTTP 200, aucune erreur JavaScript non interceptée                                       |
| Audit npm complet et dépendances de production                                                                     | **0 vulnérabilité signalée** au moment du contrôle                                       |

Les 20 tests d’intégration vérifient notamment : dernier exemplaire acheté en concurrence, doublons d’événements, montants différents, stock figé avant paiement, libération après expiration confirmée, paiement tardif en revue, invalidité de signature, refus du mode live, frais France/Belgique, absence de fuite PII, changements de prix après réservation, envois e-mail simultanés, panne/réessai e-mail et conservation du paiement.

Les 12 tests navigateur incluent le parcours invité jusqu’au refus explicite de paiement sans clé, les quantités/suppressions, le seuil de livraison, les catégories/fiches, le panier conservé après rechargement, la largeur 320 px, le focus clavier, le repli d’image et un audit axe WCAG AA automatisé de l’accueil sur ordinateur et mobile. La transition visuelle de confirmation (attente, référence, vidage du panier) est aussi testée avec une réponse serveur simulée. Cet audit ne remplace pas une recette d’accessibilité manuelle complète.

Les API Stripe et Resend sont **simulées hors réseau** dans les tests d’intégration. La signature Stripe est réellement calculée/vérifiée par le SDK sur des fixtures de test. Aucun paiement Checkout hébergé ni véritable envoi e-mail n’a été effectué. Safari/Firefox non testés.

Captures du build de production : [ordinateur](screenshots/accueil-desktop.png), [mobile](screenshots/accueil-mobile.png).

## Limites et accès externes

- **GitHub :** lecture de l’API utilisateur/dépôt et tentative de création privée via `POST /user/repos` refusées (`Forbidden`). La lecture Git du dépôt cible renvoie « Repository not found », ce qui peut aussi signifier un dépôt inaccessible. Aucun dépôt distant créé, aucun push, aucune CI hébergée exécutée. Ne pas écraser un éventuel dépôt existant. Le dépôt CarConnect est resté propre et inchangé.
- **Vercel :** aucun compte/projet lié ni `VERCEL_TOKEN` disponible. Configuration préparée, **aucun déploiement ni URL provisoire créé**.
- **Stripe :** `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` non configurés. Le test externe bout en bout avec Checkout et webhook reste à faire après configuration sécurisée.
- **Resend :** `RESEND_API_KEY` et `RESEND_FROM_EMAIL` non configurés. L’envoi externe reste à tester avec un expéditeur effectivement autorisé.
- **Base Preview :** la base locale fonctionne ; une `DATABASE_URL` dédiée à Vercel doit encore être fournie. Aucune base commerciale existante n’a été utilisée.
- Le rapprochement des sessions et les réessais e-mail sont livrés comme scripts. Leur ordonnanceur externe n’est pas provisionné ; les webhooks assurent le flux normal automatiquement.
- En cas de timeout ambigu de création d’une session Stripe, la réservation est conservée tant qu’une vérification fournisseur ne permet pas sa libération sûre. Une commande orpheline exige une revue manuelle ; pas de libération fondée uniquement sur une horloge locale.

## Environnement cloud

Les domaines `api.github.com`, `api.stripe.com`, `api.resend.com`, `api.vercel.com`, `binaries.prisma.sh`, `cdn.playwright.dev`, `cdn.playwrightcdn.com` et `storage.googleapis.com` ont été enregistrés dans le brouillon réseau en préservant les presets. L’installation de Chromium a été refusée par la politique courante ; les tests utilisent le Chromium déjà installé. Prisma utilise désormais le moteur client JavaScript et n’exige pas le téléchargement initialement bloqué de son moteur natif. Aucune vérification TLS, signature ou checksum n’a été désactivée.

Les champs `install_script` et `start_skill` ont été enregistrés en préservant les instructions CarConnect. Cet enregistrement ne prouve ni l’application des nouveaux domaines sur la machine ni la publication d’un snapshot. Les processus devront être relancés dans une nouvelle tâche. La restauration du nouveau dépôt local depuis un snapshot publié n’a pas été testée.

## Actions du propriétaire

1. Autoriser GitHub pour créer le dépôt **privé** `mehdi-pro-test/maktaba-malikiya` et pousser la branche/son workflow ; vérifier la CI hébergée avant fusion sur `main`.
2. Configurer les deux secrets Stripe **test** dans les paramètres sécurisés ; effectuer la recette officielle du README. Ne pas utiliser de clé live ni transmettre les valeurs dans le chat.
3. Pour les e-mails, connecter Resend avec expéditeur vérifié, puis valider un envoi sur un destinataire autorisé.
4. Connecter Vercel, créer une base Preview isolée, renseigner les variables serveur, appliquer migration/seed depuis un runner de confiance, puis vérifier l’URL obtenue et son webhook test. Planifier les tâches de reprise pour une démonstration prolongée.
5. Réviser/enregistrer les paramètres de l’environnement cloud, puis publier si vous souhaitez conserver cette configuration préparée.

La V1 demeure une démonstration sans débit réel. Pays desservis définitifs, identité/contact du vendeur, fiscalité, CGV, conservation des données et retours restent à valider avant toute exploitation commerciale.
