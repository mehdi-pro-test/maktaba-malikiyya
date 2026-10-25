# 06 — Recette, tests et Definition of Done

## Parcours de navigation

| ID | Scénario | Attendu |
|---|---|---|
| NAV-01 | Header > Livres | Liste complète et 3 sous-catégories |
| NAV-02 | Livres > Coran | Coran seul, prix V1 10 € |
| NAV-03 | Livres > Hadith | Bukhari seul, prix V1 100 € |
| NAV-04 | Livres > Fiqh | Akhdari visible, « prix à venir », aucun achat possible |
| NAV-05 | `/coran` puis `/hadith` | Redirection conservant accès et liens |
| NAV-06 | Retour depuis fiche | Breadcrumb accessible vers parent |
| NAV-07 | Mobile 320px | Menu et catégories accessibles sans overflow |

## Panier / commande

| ID | Scénario | Attendu |
|---|---|---|
| SHOP-01 | Ajouter Coran x1 | Mini-panier affiche titre, 10 € et quantité 1 |
| SHOP-02 | France, Coran x1 | Livraison 4 €, total 14 € |
| SHOP-03 | France, Coran x5 | Livraison offerte, total 50 € |
| SHOP-04 | Belgique, Coran x5 | Livraison 20 €, total 70 € |
| SHOP-05 | Augmenter de 4 à 5 en France | Progression devient « Offerte » |
| SHOP-06 | Ajouter Akhdari (UI ou API forcée) | Rejet serveur, pas de session Stripe |
| SHOP-07 | Stock existant | Aucune modification de prix/stock après migration |
| SHOP-08 | Checkout V1 Stripe test | Process et webhooks régressions OK, sans utilisation de clé live |
| SHOP-09 | Confirmation de commande | Montant, référence, statut email réels, pas de faux succès |

## Quiz

| ID | Scénario | Attendu |
|---|---|---|
| QUIZ-01 | Ouvrir `/quiz` | Interface jeu + 2 questions disponibles |
| QUIZ-02 | Q1 4 bons imams | +1 point |
| QUIZ-03 | Q1 3 bons + 1 mauvais | 0 point |
| QUIZ-04 | Q1 3 réponses seulement | Bouton valider désactivé ou guidance |
| QUIZ-05 | Q2 option `2` | +1 point et explication des deux catégories |
| QUIZ-06 | Q2 option `3` | 0 point, correction visible |
| QUIZ-07 | 8 slots DRAFT | Jamais visibles, compteur `2` |
| QUIZ-08 | Rejouer | Réinitialisation totale et score = 0 |
| QUIZ-09 | Clavier + accessibilité | Choix, validation, progression, annonce de score accessibles |

## Photos

- Chaque produit possède un **lien de provenance de couverture réelle** dans la doc ; le statut de droits est explicitement non vérifié.
- Aucun lien cassé ni hotlink de production non autorisé ; si image non autorisée utiliser SVG existant.
- Si autorisation fournie ultérieurement, photo locale optimisée, alt, correspondance édition approuvée.

## CI et validité des tests

- Exécuter `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration` sur DB **distincte**, `npm run test:e2e`, `npm run build` / `npm run vercel:build` selon l'environnement.
- Screenshots desktop/mobile de `/`, `/livres`, `/livres/fiqh`, `/quiz`, panier.
- Tests des principaux navigateurs mobiles et revue clavier, performance et reduced-motion.
- Préciser dans la livraison : (1) tests lancés effectivement, (2) résultat, (3) environnement, (4) tests non réalisés. Une capture locale n'est pas une preuve de fonctionnement sur Vercel.

## Définition de Terminé

[ ] Tous les critères de navigation et panier satisfaits, [ ] quiz avec 2 questions jouables + 8 slots brouillon, [ ] jamais de produit à prix inventé, [ ] migration non destructive, [ ] lint/typecheck/tests/build OK, [ ] PR revue, [ ] déploiement Vercel constaté et tests de fumée effectués, [ ] limites de photos/droits communiquées honnêtement.
