# Architecture cible et migrations compatibles (propositions, pas des SQL à exécuter aveuglément)

## Principes Next.js / Prisma

- Préserver les pages et actions publiques. Ajouter un groupe de routes admin protégé ; séparation `server-only` données/admin et composants interactifs `use client`.
- En chaque Server Action ou route admin : `requireOwnerSession()` côté serveur ; validation Zod ; vérifier que l'opération touche une ressource existante et autorisée.
- Une modification admin du catalogue et stock invalide le cache des pages publiques concernées ; la création d'une question ou sa publication met à jour les pools serveur sans modification des JSON.
- DB PostgreSQL/Prisma déjà existante ; **migrations additives** SQL dans un nouveau répertoire chronologique, compatibles avec `scripts/migrate.ts` et journal `_MaktabaMigration`. Tests sur une copie locale avec données, vérification du checksum de toutes les migrations anciennes. Ne pas exécuter automatiquement de migrations de Production via une page admin.

## Données additionnelles recommandées

**Authentification** : utiliser les tables adaptées à une librairie/fournisseur éprouvé. Imposer compte unique serveur ; stocker au plus `AdminIdentity` (id provider, e-mail vérifié et metadata de sécurité) si nécessaire. Jamais mot de passe en clair. Prévoir révocation session.

**Audit** : `AdminAuditEvent` append-only (actor, action, entité, version, extrait avant/après expurgé, date, cause) ; protéger lecture.

**Commandes** : `Order.fulfillmentStatus` par défaut `UNFULFILLED`, `shippedAt`, `deliveredAt`, `carrier`, `trackingNumber`, `internalNote` ou table `OrderFulfillmentEvent`. Garder **intact** `Order.status` pour le paiement.

**Stocks** : `InventoryMovement` (delta, before, after, reserved, reason, productId, adminId, idempotencyKey, timestamp). `Product.lowStockThreshold` facultatif entier non négatif (défaut ~3, à confirmer). Invariant `onHand >= reserved` sous `commerceTransaction`.

**Catalogue** : `Product.descriptionFr?`, `descriptionAr?`, `updatedByAdmin?`, `version`; `CatalogDraft` ou table produit unifiée avec brouillon conservant ses données. `ProductCoverAsset` (storageKey, MIME, bytes, dimensions, alt, usageRightsAttested, createdAt, source, active) sans URL arbitraire.

**Quiz** : `QuizQuestionRecord(id, bookId, originId?, activeRevisionId?, archivedAt?, createdAt, updatedAt)`, `QuizQuestionRevision(id, questionRecordId, revision, status, questionFr, optionsJson, correctOptionId, explanationFr, citationsJson, sourceVerification, globalEligible, ownerPublishedAt?, ownerApprovedBy?, createdAt)`. Conserver les historiques JSON et reviews d'origine non modifiés. Attention au type JSON Prisma et aux index d'unicité `originId`/`id`.

Ces noms sont **illustratifs** : Codex doit choisir les relations/index, unicités, cascades sûres et types après comparaison avec `schema.prisma`, documenter la conception et protéger les références historiques.

## Transactions et vérité des données

- **Stock** : réutiliser le même verrou transactionnel `commerceTransaction` que paiement et réservation ; pas de transaction parallèle pouvant violer les quantités.
- **Commande** : états de paiement source Stripe, étape logistique indépendante. Pas de double retraitement du webhook.
- **Quiz** : un seul ID actif par question ; remplacer le contenu « vue publique » par override approuvé, sinon conserver la dernière version publiée.
- **Catalogue** : `product.id/slug` référencés par commande et URLs restent stables ; commandes anciennes conservent leurs snapshots.
- **Images** : stockage objet contrôlé, ancien asset réutilisable pour rollback.

## Éviter la divergence avec les caches

Le mode global et les quiz par livre utilisent aujourd'hui une **projection serveur** construite depuis JSON. Encapsuler les futures données admin dans le même adaptateur pour que le jeu et les compteurs restent synchronisés. Les questions non publiées n'apparaissent jamais dans les données livrées aux visiteurs. Les attempts commencées gardent leurs 10 questions même si un admin archive un item pendant la partie ; les nouveaux tirages n'incluent plus l'item.

## Rollout à deux phases en une PR

Phase **A / déploiement compatible** : schéma DB additionnel, auth admin, écrans commandes/catalogue/stocks/quiz et lecture/publication par feature flag fermé. Tests intégration sans production DB.

Phase **B / activation explicite** : après sauvegarde et prévisualisation production, migration approuvée, bootstrap propriétaire + MFA, vérification des routes admin et de non-régression, ouverture du feature flag. Prévoir retour arrière des fonctions (flag off) même si la migration additive reste en base.

## Critères de blocage de Codex

Si login MFA fiable / stockage images persistant / connexion DB isolée pour tests / compatibilité Next 16 n'est pas disponible, Codex **ne contourne pas la sécurité** : il laisse l'activation désactivée, documente l'action requise et les secrets/étapes à configurer. Pas de « compte de test admin » déployé.
