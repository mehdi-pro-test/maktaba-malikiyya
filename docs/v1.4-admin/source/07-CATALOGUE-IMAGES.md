# Module Catalogue — livres administrables et images persistantes

## Champs fiche produit

Existant : `id`, `slug`, `titleFr`, `titleAr`, `category/categoryId`, `priceCents`, `stockOnHand`, `active`, `imagePath`, dates. À ajouter, avec migration **additive** : `descriptionFr?`, `descriptionAr?` (facultatif), éventuellement `lowStockThreshold`, `updatedByAdminId?`, `version` pour éviter le conflit d'écrasement. Traiter correctement `CatalogDraft`, en préservant ses entrées et son workflow.

L'admin doit pouvoir :
- créer un livre en brouillon avec ID stable, slug unique, titre FR/AR, catégorie, prix EUR en centimes, stock initial, description, couverture ;
- modifier sa fiche, visualiser le rendu public avant activation, publier ou archiver ;
- voir la date de dernière modification ;
- ajuster le **stock via le module Inventaire transactionnel**, pas via un champ libre qui bypass les mouvements ;
- modifier le prix en prévenant que les commandes anciennes **conservent leurs montants et titres historiques** ;
- changer le slug uniquement via migration / redirection contrôlée (idéalement le rendre immuable en V1.4) ;
- préserver toute référence d'une commande passée.

## Cohérence catégories

`Product.category` et `Product.categoryId` existent simultanément ; `src/data/categories.ts` alimente certains parcours. Codex doit choisir/implémenter **une seule source cohérente** pour la catégorie des livres affichée en boutique, sans désynchroniser filtre, navigation, futur back-office et seed. Si la gestion de la hiérarchie des catégories est hors V1.4, ne pas exposer de CRUD catégorie non effectif.

## Téléversement de couverture : sécurité et persistance

Vercel a un système de fichiers applicatif non durable : ne **jamais** faire reposer les couvertures uploadées sur un écriture locale vers `public/` en Production. Utiliser un stockage objet pérenne contrôlé (Vercel Blob, S3 ou autre) avec credentials **serveur uniquement**, coûts documentés, et procédure de configuration simple.

1. Admin authentifié + MFA ; upload limité en taille (p.ex. 5 Mo) et formats (PNG/JPEG/WebP uniquement, SVG interdit pour upload libre).
2. Vérifier MIME **et** signature réelle du fichier (magic bytes), dimensions et quota. Rejeter scripts et contenu mixte. Re-encoder l'image dans un format sûr, retirer EXIF et métadonnées sensibles si outil disponible ; éventuellement générer miniature.
3. Ne pas accepter comme chemin de fichier une URL distante arbitraire/SSRF. Stocker clé contrôlée / URL autorisée HTTPS ; empêcher lecture croisée de données privées et overwrite imprévu.
4. Demander au propriétaire de confirmer qu'il a le droit d'utiliser l'image ; ne pas inventer une validation d'édition. Alt descriptif. L'aperçu n'est pas une publication.
5. Conserver la précédente couverture pour rollback sans supprimer un objet encore référencé.

## Point important : `coverPath()`

`src/lib/media.ts` peut substituer `Product.imagePath` par la couverture réelle issue de `src/data/cover-references.json`. Une nouvelle image uploadée dans l'admin ne doit **pas** être masquée par cette règle. Définir une priorité claire et testée : **couverture explicitement validée via admin > référence statique historiquement autorisée > fallback `Product.imagePath`**. Respecter les droits d'usage des images historiques. Aucun changement visuel silencieux de couverture lors de la migration.

## Archivage et suppression

Un produit présent dans `OrderItem` ou `StockReservation` ne peut être hard-deleted. Utiliser `active=false` et conserver toutes ses références. La suppression d'un brouillon sans lien commercial peut être étudiée séparément, avec confirmation.
