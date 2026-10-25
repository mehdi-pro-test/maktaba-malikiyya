# 01 — Cahier des charges V1.1

## Vision

Maktaba Malikiyya est une librairie française de livres religieux **en arabe** pour étudiants en sciences islamiques, à prix accessibles. La V1.1 enrichit l'exploration des ouvrages et propose un petit quiz éducatif, sans compromettre le paiement de démonstration de la V1.

## Périmètre fonctionnel

### A. Architecture de contenu

- **Livres** est la section parente, pas une catégorie de même niveau que Coran/Hadith.
- Sous-catégories initiales de Livres : **Coran**, **Hadith**, **Fiqh**.
- Ajout facile d'autres sous-catégories futures (par exemple Aqida, langue arabe, Tajwid) sans modifier tous les composants.
- Arborescence accessible en navigation desktop et mobile ; fil d'Ariane sur les pages.
- `Livres > Toutes les catégories` affiche le catalogue, puis filtres/onglets par sous-catégorie.
- Anciennes URLs `/coran` et `/hadith` redirigées vers `/livres/coran` et `/livres/hadith` (redirect permanent ou redirection compatible Next).

### B. Catalogue V1.1

| Produit | Arabe | Sous-catégorie | Prix | Disponibilité |
|---|---|---|---:|---|
| Coran (Moshaf) | مصحف القرآن الكريم | Coran | 10 € | Stock V1 préservé |
| Sahih al-Bukhari | صحيح البخاري | Hadith | 100 € | Stock V1 préservé |
| Mukhtasar al-Akhdari | مختصر الأخضري | Fiqh | **À définir** | **Brouillon : non achetable** |

- Ne pas inventer ni synchroniser les prix avec des boutiques concurrentes.
- Pas d'édition inventée : images de références **illustratives** tant que les exemplaires physiques ne sont pas identifiés.
- Les fiches des deux ouvrages existants conservent leurs slugs, contenu, paniers et liens.
- Pour Akhdari, affiche « Prix à venir » / « Bientôt disponible » et désactive le CTA d'achat ; **aucune tentative de checkout** ne doit accepter cet article.

### C. Quiz éducatif

- Entrée principale **Quiz**, hors de Livres.
- Interface dynamique et ludique inspirée par les *patterns* d'un jeu de quiz géographique : grosses options en cartes, réponse sélectionnée bien visible, numérotation, jauge, score et écran final.
- Identité **entièrement propre à Maktaba Malikiyya** : aucune carte du monde ou copie de l'interface, des illustrations, du nom/logo/typographie propriétaires de GeoGuessr.
- 10 emplacements au total ; **2 questions disponibles maintenant**, **8 brouillons** à remplir par le PO.
- 1 question multi-sélection et 1 question choix unique (voir `04-QUIZ-SPECIFICATIONS.md`).
- Quiz sans compte, sans collecte de nom/email, score local/éphémère et bouton Rejouer.
- Interface, commentaires et aides en français ; termes arabes correctement présentés.

### D. Confort d'achat V1.1

- **Mini-panier** ou tiroir latéral après ajout (ouvrage, prix, quantité, bouton « Voir le panier » / « Continuer ») avec gestion clavier et lecteur d'écran.
- **Barre de progression vers la livraison gratuite en France** : reste = max(0, 5 000 - sous-totalCentimes), exprimé en euros ; seulement en France métropolitaine ; changer le pays recalcule le message ; pas de gratuité Europe.
- Page de confirmation plus explicite : référence, total, statut de paiement et d'email réellement issu du serveur ; pas de message « envoyé » anticipé.
- Garantir UI mobile-friendly, palette et ambiance V1 conservées.

## Règles de gestion non négociables

1. Ne jamais re-seeder les stocks des livres existants et ne pas altérer les commandes V1.
2. Le calcul prix/livraison/stock reste **côté serveur** ; les éléments de l'UI ne font que présenter des estimations.
3. Stripe demeure strictement en mode test ; les webhooks signés et réservations idempotentes sont préservés.
4. Ne jamais accepter un produit brouillon/inactif/sans prix dans le panier validé serveur ou checkout.
5. Le quiz ne modifie jamais le prix ou l'état du panier.
6. Les photos tierces requièrent un examen des droits, et un contrôle de correspondance édition/photo avant publication commerciale.

## Critères d'acceptation métier

- Depuis l'accueil, clic « Livres » : catalogue de tous les livres ; sous-catégories Coran/Hadith/Fiqh visibles.
- Filtrer Fiqh : Akhdari apparaît « Bientôt disponible » ; aucun bouton actif d'achat.
- Les anciennes URLs Coran/Hadith continuent de fonctionner via redirection.
- Le Coran et le Bukhari restent achetables en **test**, aux prix V1 et aux conditions existantes.
- Le Quiz fonctionne sur clavier/tactile ; 2 questions réelles, 8 slots cachés.
- Le score est exact ; réponses fausses explicitées ; « Rejouer » remet l'état à zéro.
- Pas de fausse image d'édition présentée comme celle du livre vendu ; provenance documentée.
