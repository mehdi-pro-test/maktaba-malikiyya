# 02 — UX / UI — Parcours et navigation

## Plan du site cible

```text
Accueil                         /
Livres (parent)                 /livres
  Toutes les catégories         /livres
  Coran                         /livres/coran
  Hadith                        /livres/hadith
  Fiqh                          /livres/fiqh
  Produit                       /livres/[slug] (préserver slugs V1)
Quiz                            /quiz
Panier                          /panier
Commande test                   /commande
Confirmation                    /commande/confirmation
Informations                    /informations
```

> `/coran` et `/hadith` sont des aliases qui redirigent, pas des catégories racines ni des produits.

## Header desktop

Logo typographique existant « Maktaba Malikiya » | Accueil | **Livres ▾** | Quiz | Panier (badge). Le menu Livres ouvre : Tous les livres, Coran, Hadith, Fiqh. Le menu s'ouvre au clic et clavier, pas uniquement au survol. Le lien parent Livres doit rester utilisable. Fil d'Ariane « Accueil > Livres > Fiqh > Mukhtasar al-Akhdari ».

## Header mobile

Nav accessible via bouton « Menu » ou version compacte avec sous-navigation ; ne pas cacher Fiqh derrière un hover inexistant. Zone tactile >=44px recommandée. Conserver panier visible. Pas de débordement 320px.

## Accueil

- Conserver bannière bibliothèque et CTA « Découvrir nos livres » => `/livres` ou ancre catalogue, en cohérence avec le nouvel IA.
- 3 cartes catégories cliquables Coran, Hadith, Fiqh (Fiqh => 1 ouvrage bientôt disponible).
- Bloc discret « Testez vos connaissances » avec CTA « Commencer le quiz » vers `/quiz`.
- Ne pas prétendre qu'il y a 10 questions jouables, afficher « 2 questions disponibles — d'autres arrivent ».

## Cartes livres

- Photo réelle de couverture **seulement si utilisée avec autorisation / édition explicitement illustrative** ; voir références.
- Titre FR puis AR avec `lang="ar" dir="rtl"`; prix stock pour produits actifs.
- Produit brouillon : badge « Bientôt disponible », « Prix à venir », bouton achat absent ou désactivé (avec message compréhensible).
- Image alternative locale si autorisation ou chargement indisponibles.
- Même hauteur visuelle, zones de CTA cohérentes et mobile responsive.

## Mini-panier

Après ajout d'un livre actif : tiroir léger qui montre couverture, nom, quantités, sous-total, livraison estimée, possibilité de fermer, continuer les achats ou ouvrir panier. Focus initial logique ; Tab contenu au tiroir ; Escape ferme et restaure focus sur bouton d'origine. Ne pas créer de mise à jour de stock serveur lors de l'ouverture du tiroir.

## Barre frais de port

- France : montant restant vers 50 €, barre = min(100, sous-total/50€ *100). À 50 € : « Vous profitez de la livraison offerte en France métropolitaine ».
- Europe : « Livraison à 20 € pour ce pays » ; supprimer la barre ou la montrer sans objectif trompeur.
- Avec panier vide : texte clair sans barre prétendant une réduction.

## Quiz UI

- Carte centrale dans un fond illustré abstrait (motifs géométriques très subtils), interface de jeu distinctive.
- Haut : « Question n sur N », progression, score, quitter.
- Question grande police. Réponses en **larges boutons en grille** avec états repos/survol/focus/sélection/validé, identité crème/vert/doré.
- « Valider » puis résultat et brève explication. Q1 multi-sélection (sélectionner exactement 4 noms) ; Q2 choix unique (nombre de catégories de tahara).
- Animation douce facultative, `prefers-reduced-motion` respecté.
- Écran final : score `0/2`, `1/2`, `2/2`, récap des bonnes réponses, « Rejouer » et « Retour aux livres ».

## Accessibilité

HTML sémantique, `<button>` pour les choix, aria-pressed/checkbox/radio ou groupe équivalent, annonce de résultats `aria-live`, contraste WCAG AA et focus visible ; arabe en `dir=rtl` pour le contenu arabe seulement ; champs et images avec alternatives pertinentes ; aucune réponse basée uniquement sur la couleur.
