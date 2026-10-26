# Module Stock — fiabilité transactionnelle avant UX

## Invariants existants

- `Product.stockOnHand` : stock physique disponible en inventaire comptable de cette boutique.
- `StockReservation` avec `status='ACTIVE'` : quantité réservée pendant le checkout.
- `available = max(0, stockOnHand - SUM(reservations actives))` ; pas de double soustraction pour `CONSUMED`.
- Les commandes `PAID` décrémentent déjà le stock physique via `applySession`, qui consomme la réservation et évite les doubles débits.
- `commerceTransaction` / lock PostgreSQL `pg_advisory_xact_lock(741825)` protège **toutes** les transitions de stock, y compris les futures mutations admin.

## UI

Tableau par produit : image, SKU/ID, titre, stock physique, réservé, disponible, seuil alerte, statut actif, dernière correction. Recherche/filtrage faible stock, zéro disponible, articles archivés. Afficher des totaux en unités, jamais des colonnes trompeuses.

## Opérations admin

- **Entrée de stock** : `+N`, motif (`réapprovisionnement`, `retour qualifié`, `autre`), date, note ; quantité positive entière.
- **Sortie/casse/perte** : `-N`, motif obligatoire ; refuser si futur stock physique inférieur à réservations actives.
- **Inventaire** : définir stock physique compté, calculer delta sous verrou ; confirmer avant écriture et contrôler le stock réservé.
- **Retour** : réintégrer seulement si le produit est effectivement récupéré et contrôlé, sans rembourser ni marquer une commande payée artificiellement.
- Éviter les stocks négatifs, décimaux, NaN, valeurs extrêmement grandes, même via API directe.

## Modèle additionnel proposé

`InventoryMovement(id, productId, type, delta, beforeOnHand, afterOnHand, reservedAtChange, reason, createdAt, adminId, relatedOrderId?, idempotencyKey?)`.

La mutation du stock et l'insertion d'un mouvement sont dans **la même transaction**. Une action envoyée deux fois ne doit jamais compter deux réapprovisionnements (clé idempotente). Pour une commande payée, conserver le comportement actuel ; les écritures associées aux webhooks ne doivent pas être comptabilisées deux fois dans les ajustements manuels.

## Concurrence / transaction

Sous le verrou commerce transaction partagé : lire état courant, somme des réservations actives, valider le nouveau stock physique >= réservations, écrire l'ajustement conditionnel, enregistrer audit et mouvement, commit. Tester une vente simultanée et un inventaire admin : pas de survente ni de perte de mise à jour.

## Effets du catalogue

Un livre peut être inactif tout en ayant des réservations ou des lignes de commandes ; **archiver ne signifie pas supprimer ou remettre le stock à zéro**. Affichage des quantités au checkout inchangé.
