# Module Commandes — états séparés et traçabilité

## Données existantes à respecter

`Order.status` est un **état de paiement/traitement technique** (`PENDING_PAYMENT`, `PAID`, `EXPIRED`, `REQUIRES_REVIEW`) ; il est alimenté via la création Stripe, le webhook sécurisé et la réconciliation. `OrderItem` porte les prix et titres historiques. Ces champs ne doivent jamais être réécrits par un changement de catalogue.

## Interface liste

- Filtres : date, paiement Stripe, expédition, pays, anomalies, recherche par référence / e-mail ; pagination serveur (pas toutes les adresses chargées d'un coup).
- Colonnes : référence, date, client (identité limitée), articles, total, état du paiement, état d'expédition, suivi.
- Dashboard : commandes `PAID` non expédiées, `REQUIRES_REVIEW` à examiner, `PENDING_PAYMENT` encore actives ; chiffre d'affaires calculé exclusivement sur les commandes **réellement `PAID` en Stripe TEST** en excluant les commandes en attente et les doublons d'événements. Afficher le libellé TEST clairement.

## Détail

Afficher adresse de livraison seulement après accès admin, articles, prix d'achat au moment de l'achat, sous-total/frais/total, référence Stripe (lecture seule), historique des événements, e-mail de confirmation (état), notes internes, suivi et statut logistique.

## États logistiques ADDITIFS (ne pas détourner Order.status)

Proposition de champ `fulfillmentStatus`: `UNFULFILLED` (défaut), `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED` (à préciser métier selon Stripe). Garder dates `shippedAt`, `deliveredAt`, `carrier`, `trackingNumber` et `internalNote` ou table d'historique dédiée. Tracer chaque transition dans l'audit.

Transitions recommandées :
- `UNFULFILLED -> PREPARING -> SHIPPED -> DELIVERED` pour commande Stripe `PAID` uniquement.
- Retour arrière uniquement via action explicitement confirmée et auditée, pas par édition libre du statut.
- `PENDING_PAYMENT/EXPIRED/REQUIRES_REVIEW` ne doivent jamais pouvoir être marqués « expédiés » comme payés sans résolution de paiement via mécanisme fiable.
- Une annulation logistique ne **rembourse pas automatiquement** une transaction et n'incrémente pas le stock sans procédure définie ; dissocier les flux.

## Paiement et remboursement

La V1.4 ne doit pas permettre de taper `PAID` dans une liste déroulante. Pour annuler/rembourser un paiement, utiliser le flux Stripe **TEST** approprié et une confirmation explicite ; si les remboursements sont trop risqués à implémenter correctement maintenant, afficher « Traitement depuis Stripe » et tracer la demande dans l'admin (P1). **Ne jamais déclencher un remboursement sans consentement/intent clair.**

## Exports

CSV limité aux filtres sélectionnés, accès propriétaire uniquement, pas d'URL statique persistante publique ; audit de l'export, entêtes anti-cache et neutralisation des formules CSV en début de cellules à risque (`=`, `+`, `-`, `@`).

## Cas d'erreur

Commande inconnue, webhook tardif/dupliqué, paiement confirmé après expiration, réservations incohérentes, tentative d'expédition non payée, double clic, refresh concurrent, Stripe indisponible : gérer sans changer frauduleusement le statut de paiement. Les parcours publics de suivi de commande par token restent identiques.
