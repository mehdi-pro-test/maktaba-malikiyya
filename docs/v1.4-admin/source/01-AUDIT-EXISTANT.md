# Audit réel du dépôt à préserver

**Instantané inspecté** : `main@d29c6dfe7862fcd8b34ef00b7543512914bc4d7d` le 26/10/2026. Codex doit relire `origin/main`, `AGENTS.md` et la documentation **Next.js 16 locale** dans `node_modules/next/dist/docs/` avant tout changement.

## Commerce en base PostgreSQL

Dans `prisma/schema.prisma` :

- `Product` : `id`, `slug`, `titleFr`, `titleAr`, `category`, `categoryId`, `imagePath`, `priceCents`, `stockOnHand`, `active`, `updatedAt` ; **aucune description produit** à ce stade.
- `Order` : référence, coordonnées, montants, statut de paiement (`PENDING_PAYMENT`, `PAID`, `EXPIRED`, `REQUIRES_REVIEW`), `stripeSessionId`, dates.
- `OrderItem` : contient **instantané** du titre et prix au moment de la commande : le conserver même quand le catalogue change.
- `StockReservation` : quantité, statut (`ACTIVE`, `CONSUMED`, `RELEASED`), `expiresAt`.
- `WebhookEvent` : journal d'idempotence Stripe. `EmailDelivery` : envoi des courriels.
- `Category` et `CatalogDraft` : hiérarchie des catégories et livres en préparation.

Dans `src/lib/orders.ts` : `reserveOrder` et `applySession` utilisent **`commerceTransaction`**, verrou PostgreSQL `pg_advisory_xact_lock(741825)` et vérifient réservations/paiement/stock. **Tout ajustement admin de stock doit prendre le même verrou et préserver l'invariant**.

Dans `src/lib/catalog.ts`, `purchasableCatalog` calcule `available = max(0, stockOnHand - réservations ACTIVE)` ; conserver cette formule pour toutes les vues et transactions.

`scripts/catalog-update.ts` permet des modifications par CLI ; cela n'est pas une interface admin, mais ses invariants sont utiles à reprendre. `scripts/reconcile.ts` peut réconcilier des sessions Stripe ; l'admin ne doit pas contourner cette logique. `scripts/migrate.ts` gère des migrations SQL versionnées + empreinte `_MaktabaMigration` : **ne pas écraser des fichiers SQL déjà appliqués**.

`src/lib/payments.ts` refuse les clés Stripe live et n'autorise que les clés `sk_test_`. Conserver explicitement cette règle. `src/app/api/orders/route.ts` répond avec des informations **limitées** via token client ; ne pas introduire de recherche publique par adresse/e-mail/numéro de commande.

## Catalogue, médias et données statiques

- `src/lib/media.ts` sélectionne parfois une couverture réelle depuis `src/data/cover-references.json` si les permissions, l'édition et l'usage production sont attestés ; sinon `Product.imagePath`.
- `prisma/seed.ts` préserve les produits existants dans les `upsert` ; **ne pas le transformer en seed destructeur**.
- `src/data/categories.ts` définit une partie des catégories de navigation ; éviter la divergence avec `Category` DB. Ne pas proposer un éditeur de catégories dont l'affichage ne dépend pas effectivement de la BD.
- `src/app/commande/page.tsx` conserve l'achat invité ; aucune connexion client n'est requise.

## Quiz : plusieurs couches de contenu, global inclus

- `src/data/quiz-v1.2/research.json` et `reviews.json` : les 150 historiques et leurs revues liées à SHA ; ne pas les modifier.
- `src/lib/quiz-v13-lots.ts` / `src/lib/quiz-v13-editorial.ts` : lots additionnels, déduplication et approbations.
- `src/lib/quiz-ultime-data.ts` / `quiz-ultime-editorial.ts` : additions approuvées propriétaire, avec distinction des vérifications de sources non attestées.
- `src/lib/quiz-v12-data.ts` : assemble les pools par ouvrage côté serveur, fournit `library` et `bookQuestions`. C'est **le point d'intégration public à préserver**.
- `src/lib/quiz-global-data.ts`, `quiz-global-pool.ts`, `quiz-global-quality.ts` : mode aléatoire global, exclut des questions non autonomes selon `src/data/quiz-global-quality.json`.
- `src/app/quiz/actions.ts` et `quiz-draw.ts` : tirage serveur sans répétition, protection des banques ; `QuizGame` restitue les corrections/sources et gère « Rejouer ».
- `/quiz/niveaux`, `/quiz/niveaux/[niveau]/[ouvrage]`, `/quiz/aleatoire` doivent conserver leurs URL et leur comportement. L'ancien quiz classique a été retiré par décision du propriétaire.

## Périmètre quantitatif

Les tests V1.3 vérifiaient environ 610 questions approuvées au total lors d'une livraison antérieure ; **ce n'est pas un décompte de production garanti à la date d'implémentation**. Codex doit afficher des compteurs issus des pools réels (y compris exclusions du mode global), pas un nombre figé.

## Absences actuelles pertinentes

À l'instantané, aucun espace `/admin`, aucune couche de comptes administrateurs, aucune table d'historique d'inventaire, aucun `fulfillmentStatus` indépendant, aucune vraie description produit et aucune image upload persistante administrable. Les quiz ne sont pas, aujourd'hui, un CRUD Prisma. La V1.4 doit combler ces lacunes par additions **compatibles**.
