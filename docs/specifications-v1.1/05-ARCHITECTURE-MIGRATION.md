# 05 — Architecture, migration et compatibilité V1

## Partir de l'existant

Le dépôt utilise Next.js App Router + TypeScript + Tailwind, Prisma/PostgreSQL, un catalogue `Product` avec `category` string, un panier local et Stripe test ; CI GitHub Actions et build Vercel existent. **Ne pas repartir d'un starter.** Lire `AGENTS.md`, README, schema Prisma, routes V1 et CI avant modification.

## Routes

- Ajouter `/livres` toutes les catégories, `/livres/coran`, `/livres/hadith`, `/livres/fiqh`, `/quiz`.
- Garder `/livres/[slug]` pour fiches. Attention au conflit route statique/dynamique : priorité des segments statiques ; tester `/livres/fiqh` et un produit portant un slug similaire.
- Garder `/coran` et `/hadith` en redirections pour compatibilité liens externes ; vérifier SEO/metadata de catégories.
- Navigation header : Accueil, **Livres** (sous-liens), **Quiz**, Panier.

## Modèle et stratégie prudente

**Option cible :** modèle `Category` : `id, slug UNIQUE, nameFr, parentId?, sortOrder, active, ...` avec relation parent/enfants. Le parent `livres` a 3 enfants `coran`, `hadith`, `fiqh`. Ajouter lien product -> Category ; conserver temporairement le champ `Product.category` si la migration en deux temps est nécessaire.

**Ne pas modifier des identifiants ni slugs existants**. Mettre à jour les produits existants pour pointer vers la catégorie enfant correspondante en utilisant une migration idempotente (ne pas écraser prix/stock). Préserver intégralement `Order`, `OrderItem`, `StockReservation`, `WebhookEvent`, `EmailDelivery`.

**Brouillon Akhdari :** choix technique recommandé `Product.status='DRAFT'`, `priceCents` nullable **uniquement** quand statut DRAFT (contrainte CHECK DB + validation TypeScript), stock null ou 0 clairement différencié de l'état commercial. Si migration trop risquée, utiliser table `CatalogDraft` ou une fiche brouillon non présente dans les requêtes checkout ; mais ne jamais insérer un produit à 0 € achetable.

Adapter `catalog()` pour afficher produits actifs + brouillons dans les pages, mais toujours exclure brouillons lors du checkout (`reserveOrder`), tout en conservant une sémantique de `available` cohérente. Vérifier que la page d'accueil ne force pas les compteurs `02` devenus erronés.

## Panier et paiement

Ne pas réécrire le code de réservation `commerceTransaction`, la vérification serveur, les webhooks ou email outbox. Mini-panier = UI client sur contexte actuel ; recalcul des totaux côté serveur inchangé. Adapter si besoin les propriétés du produit nouvellement optionnelles côté présentation sans accepter d'articles inactifs.

**Bug UX à prévenir :** un lien `aria-disabled=true` n'est pas désactivé en HTML ; remplacer la navigation active vers checkout en cas de stock invalide par une vraie condition ou un bouton réellement désactivé. Vérifier les étapes du checkout et le renouvellement des stocks après retour.

## Quiz

Implémentation statique : composants `QuizIntro`, `QuizGame`, `QuizQuestion`, `QuizResults`; données typées et séparées. Aucune persistance côté base requise. Structure extensible à 10 (et plus), sans forcer des contenus inventés. Aucune dépendance à GeoGuessr ; créer des styles maison dans le thème existant.

## Couvertures

Préparer un champ d'asset local `imagePath` existant, avec un registre de provenance ou attributs d'édition séparés. Garder images SVG en repli. Suivre `03-CATALOGUE-ET-COUVERTURES.md` pour références de vraies couvertures et vérification de droits.

## Migration et rollback

1. Inspecter les tables/migrations déjà en production, les logs et les scripts `scripts/migrate.ts` / `scripts/vercel-build.ts`.
2. Sauvegarder la base avant migration si c'est un environnement partagé. Générer une **nouvelle** migration SQL versionnée, jamais éditer migration existante.
3. Tester sur une DB de test dédiée. Vérifier valeurs produits/commandes avant/après.
4. Appliquer migration explicitement à la base adéquate (l'existant ne migre pas automatiquement à chaque build Vercel). Éviter toute migration destructive.
5. Tester l'ancien et le nouveau code avec une stratégie de compatibilité en cas de déploiements chevauchés ; rollback applicatif ne doit pas effacer les nouvelles données. Si la compatibilité n'est pas garantie, arrêter et demander approbation.

## Traçabilité

Mettre à jour README, docs/VALIDATION.md et historique de décision pour le prix manquant, contenu quiz partiel, photos/licences, environnement Stripe.
