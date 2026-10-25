# 08 — Backlog priorisé

## Priorité P0 — sans régression

- PO-01 : conserver flux V1 de paiement test, commandes, stocks et email.
- PO-02 : migration catalogue sans perte des prix/stock/commandes ni seed destructif.
- PO-03 : site accessible et conforme sur smartphone.

## Sprint V1.1 — features

| ID | User story | Priorité | Effort indicatif |
|---|---|---|---|
| US-01 | En tant qu'étudiant, je navigue dans Livres > Coran/Hadith/Fiqh | P0 | M |
| US-02 | En tant que client, je vois Mukhtasar al-Akhdari en Fiqh, marqué à venir | P0 | S |
| US-03 | En tant que client, je vois une couverture authentique si autorisée, sinon un repli fiable | P1 | M |
| US-04 | En tant qu'étudiant, je lance un quiz ludique et réponds aux 2 questions validées | P0 | M |
| US-05 | En tant que joueur, je vois mon score, la correction et peux rejouer | P0 | S |
| US-06 | En tant qu'acheteur, le mini-panier confirme l'ajout d'un livre | P1 | M |
| US-07 | En tant qu'acheteur français, je sais combien il reste avant la livraison offerte | P1 | S |
| US-08 | En tant qu'acheteur, je comprends les étapes de confirmation et d'envoi email | P1 | S |
| US-09 | En tant que mainteneur, je dispose de tests/CI et doc d'évolution catalogue et quiz | P0 | M |

Efforts indicatifs S/M uniquement, non estimations de temps garanties.

## À compléter par le PO (après V1.1)

- Valider **prix + stock + édition** du Mukhtasar al-Akhdari avant activation de la vente.
- Fournir **8 questions**, réponses et éventuelles explications afin de passer au quiz à 10 questions actives.
- Fournir des photos de ses vrais exemplaires (ou autorisations de reproduction des photos externes).

## Hors périmètre V1.1

Admin, compte client, fidélité, paiement réel, PayPal, commandes expédiées, concours/leaderboard connecté, timer, badges réels, chatbot, catalogue volumineux et recommandations algorithmiques.

## Proposition V1.2 / V2

- V1.2 : validation finale des 10 questions, recherche catalogue, optimisation SEO quand boutique prête.
- V2 : back-office sécurisé (produits, catégories, stocks, commandes), création de quiz côté admin avec relecture éditoriale, import multi-images par produit.
