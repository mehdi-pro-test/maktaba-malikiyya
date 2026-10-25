# 03 — Architecture et conventions techniques

## Choix et périmètre

Monolithe Next.js App Router + TypeScript (frontend et handlers serveur), Tailwind CSS/shadcn/ui, Prisma et PostgreSQL, Stripe Checkout en **test**, Resend (si configuré), déploiement Vercel. Éviter un serveur Node Express distinct ou des microservices pour deux produits. Faire vérifier par Codex les versions stables compatibles au moment de l'installation ; verrouiller le lockfile. Tout contenu client est francophone.

## Organisation suggérée

```text
src/
  app/(shop)/page.tsx
  app/(shop)/coran/page.tsx
  app/(shop)/hadith/page.tsx
  app/(shop)/livres/[slug]/page.tsx
  app/(shop)/panier/page.tsx
  app/(shop)/commande/page.tsx
  app/(shop)/commande/confirmation/page.tsx
  app/api/checkout/route.ts
  app/api/webhooks/stripe/route.ts
  components/{layout,catalog,cart,checkout}/
  lib/{db,env,money,shipping,catalog,checkout,stock,email,security}/
  tests/
prisma/schema.prisma
prisma/seed.ts
public/images/
.github/workflows/ci.yml
```

Ne pas imposer cette arborescence si les conventions réelles du dépôt justifient mieux.

## Données

- `Category`: id, slug, nom.
- `Product`: id, slug unique, titleFr, titleAr, imagePath, priceCents (entier >=0), stockOnHand (>=0), active, categoryId, createdAt, updatedAt. V1: 1000 et 10000 centimes, chacun 10 exemplaires.
- `Order`: id UUID, reference publique non séquentielle, email, nom destinataire, adresse de livraison, countryCode, currency EUR, subtotalCents, shippingCents, totalCents, status (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `EXPIRED`, `REQUIRES_REVIEW`), stripeCheckoutSessionId unique, timestamps, champ de contrôle d'idempotence.
- `OrderItem`: orderId, productId, titleFrSnapshot, titleArSnapshot, unitPriceCentsSnapshot, quantity, lineTotalCents.
- `StockReservation`: id, orderId, productId, quantity, status (`ACTIVE`, `CONSUMED`, `RELEASED`), expiresAt, timestamps.
- `WebhookEvent`: eventId Stripe unique, type, processedAt, outcome ; empêcher doublons / permettre reprise des événements échoués.
- `EmailDelivery`: orderId + type unique, status, attempts, providerMessageId, lastError, timestamps. Utile pour réessai sans spammer.

Des variantes de champs ou noms sont acceptées si elles gardent les mêmes garanties. Les secrets (clé Stripe, clé Resend, base de données) ne figurent jamais dans le modèle exposé au client.

## Règles serveur impératives

1. Ne recevoir du panier que `{productId, quantity}` avec validation stricte (entiers positifs, limites raisonnables). Ne jamais utiliser les prix transmis par le client.
2. Consulter la base dans une transaction et recalculer catalogue, stock disponible et totaux.
3. Calculer le stock *disponible* comme `stockOnHand - somme(réservations actives non libérées)`. Les réservations sont acquises sous verrouillage/transaction assurant l'absence de sur-réservation.
4. Ne convertir une réservation en vente et ne diminuer `stockOnHand` **qu'une seule fois** après paiement signé confirmé ; ne pas double-compter la réservation.
5. En cas d'annulation / expiration confirmée, libérer la réservation. Les sessions Stripe expirées ou les réservations orphelines exigent une stratégie de réconciliation documentée, avec traitement des événements retardés.
6. Vérifier le webhook avec le corps brut de requête et la signature Stripe ; ne pas se baser sur `success_url`.
7. Assurer l'idempotence des événements, commandes, emails et opérations de stock, même en cas de retry et de concurrence.
8. Ne jamais révéler les coordonnées des acheteurs sur une page accessible uniquement avec un identifiant prévisible.

## API

- `POST /api/checkout` : validation panier + pays + adresse + email ; réservation transactionnelle ; création Order pending et Stripe Checkout Session test ; réponse URL/session Stripe ; rollback ou annulation contrôlée en cas d'échec externe.
- `POST /api/webhooks/stripe` : vérification signature, idempotence, vérification de la session et du statut de paiement, passage de commande à `PAID`, consommation des réservations, email et logs sûrs.
- Les pages produits peuvent lire directement côté serveur en Prisma ; pas besoin d'API catalogue publique supplémentaire.

## Paiement et données sensibles

Activer seulement les moyens de paiement `card`. Exiger `sk_test_` côté serveur, `pk_test_` si une clé publique est utilisée. Aucun switch silencieux en live. Masquer les données personnelles des logs ; ne pas enregistrer les données de carte. Limiter l'exposition de données de livraison au navigateur aux besoins de validation et de confirmation autorisée.

## Données personnelles / performance

Limiter la collecte à l'exécution de commande (nom destinataire, email, adresse). Informer des traitements, définir une politique de conservation avant production. Server Components pour catalogue ; Client Components seulement si interaction utile ; images optimisées et repli si média absent. Métadonnées SEO sobres en français et accessibilité clavier.

## Évolutivité V2

Compte admin sécurisé avec rôles, gestion des stocks et catalogue, consultation des commandes, audit des modifications ; aucune route admin publiquement modifiable en V1.
