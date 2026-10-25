# V1.1 — Architecture et décisions

## Catalogue compatible V1

La migration `202610250002_categories_drafts` est additive : création de `Category`, ajout nullable de `Product.categoryId`, rattachement des produits existants à Coran/Hadith, création de `CatalogDraft`. Elle ne touche ni prix, ni stocks, ni tables de commande/réservation/paiement/e-mail. Le runner `_MaktabaMigration` et les checksums existants sont conservés ; aucune migration V1 n’a été modifiée.

Le brouillon Akhdari est séparé de `Product`, suivant l’option de compatibilité du dossier fourni. Son prix et son stock sont NULL, et une contrainte SQL empêche d’y écrire un prix fictif. Le checkout continue de consulter exclusivement `Product` actif. Cela évite de rendre nullable le prix des produits V1, que l’ancien client suppose entier. Le statut `DRAFT` est explicite ; une publication future exigera une opération validée après fixation du prix, du stock et de l’édition, hors de cette livraison.

La relation `Category` persiste Livres et ses trois enfants. La configuration éditoriale `src/data/categories.ts` alimente menu, cartes, filtres et seed de catégories, sans lecture de la DB par le quiz. Pour ajouter une catégorie, ajouter une entrée à ce fichier puis exécuter le seed sur la base choisie : les métadonnées de catégorie sont mises à jour sans reset des produits. Le seed refuse les slugs déjà utilisés par un ouvrage. Les slugs partagent l’espace `/livres/[slug]` ; ils doivent rester distincts de ceux des produits. Les slugs et IDs des catégories initiales sont conservés.

Les routes `/livres/coran`, `/livres/hadith`, `/livres/fiqh` et les futures catégories sont résolues par le segment existant `[slug]`, avant la recherche d’un ouvrage. Les fiches V1 gardent leurs chemins. `/coran` et `/hadith` redirigent de façon permanente. Le catalogue de vente et le catalogue éditorial sont séparés pour ne jamais présenter le brouillon au checkout.

## Quiz indépendant

Le JSON du PO est conservé dans `src/data/quiz-v1.1.json`. Le chargeur serveur valide les seules questions publiées avec Zod (choix uniques, réponses valides, nombre de sélections et explication obligatoires). Le composant client reçoit deux questions valides, et non les huit brouillons. Aucun compte, cookie de quiz, API de score, DB ou outil de suivi n’est ajouté. La correction navigateur est adaptée à ce jeu sans classement ni récompense ; ce n’est pas un examen sécurisé.

Le score est dérivé des réponses validées, une seule contribution par question. Q1 : correspondance exacte des quatre imams. Q2 : seule la réponse 2 est correcte. La progression, les corrections et le résultat sont annoncés ; le focus est déplacé sur chaque question et le résultat. Rejouer réinitialise la session.

## Panier et confirmation

Le panier V1 conserve sa clé `maktaba-cart` et ses identifiants. Le mini-panier ajoute seulement un cache public de métadonnées des livres ; les totaux y sont estimatifs. En présence d’anciens articles sans ces métadonnées, il renvoie vers le panier plutôt que d’annoncer un faux total. Aucune adresse ni donnée de paiement n’est stockée dans ce cache. Le dialogue natif possède une boucle Tab explicite, Escape, focus initial et restitution au bouton d’ajout.

La progression France utilise 5 000 centimes, sans promesse de gratuité pour l’Europe. Le lien de checkout d’un panier invalide est remplacé par un bouton réellement désactivé. Prix, livraison, disponibilité, signature Stripe et idempotence restent contrôlés côté serveur comme en V1.

L’API de confirmation ajoute des lignes figées et le détail des montants, toujours protégés par le jeton opaque ; aucun nom, adresse ou e-mail client n’est renvoyé. Les états e-mail Envoyé, Non configuré, En attente, Échec et À vérifier restent distincts.

## Couvertures

`src/data/cover-references.json` conserve les pages et images candidates, les droits non vérifiés, le contrôle d’édition négatif, la date de revue et `realCoverPath=null`. Les requêtes vers les trois pages sources ont été refusées par le proxy réseau (403). Aucune licence ni correspondance au stock n’est établie. Aucune photo n’a été téléchargée, hotlinkée ou publiée. Les deux SVG V1 sont conservés, un SVG original provisoire est ajouté pour Akhdari.

`coverPath` ne sélectionne une photo locale `/images/books/…` que si droits, édition et publication sont tous validés ; sinon il garde le repli. Après autorisation, optimiser la photo, renseigner la provenance/justificatif et le chemin local, puis faire relire avant publication. Ne pas publier l’ISBN externe non approuvé comme celui d’un produit vendu.
