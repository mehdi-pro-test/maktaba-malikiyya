# 06 — Stratégie QA et recette

## Pyramide de tests

- **Unitaires** : `calculateShipping(subtotalCents, countryCode, postalCode)`, panier, disponibilité, formatage EUR, validations d'entrées, règles d'état commande.
- **Intégration** : catalogue Prisma, création commande et réservation transactionnelle, idempotence webhook, fin/réconciliation de réservation, outbox email, sécurité des données.
- **E2E** (Playwright ou équivalent) : navigation mobile/desktop, ajout panier, quantités, commande invité, validation, confirmation. Stripe test E2E en environnement autorisé si secrets configurés.
- **Qualité** : lint, typage strict, build, accessibilité basique clavier et contrastes, loading/error/empty states.

## Matrice de recette

| Cas | Attendu |
|---|---|
| 1 Coran, France métropolitaine | Sous-total 10 €, livraison 4 €, total 14 € |
| 4 Corans, France | Sous-total 40 €, livraison 4 €, total 44 € |
| 5 Corans, France | Sous-total 50 €, livraison 0 €, total 50 € |
| 1 Sahih al-Bukhari, France | Sous-total 100 €, livraison 0 €, total 100 € |
| 1 Coran, pays européen activé | Total 30 € |
| 1 Coran, pays non desservi | Rejet avant Stripe, motif explicite |
| 11 Corans pour stock 10 | Quantité rejetée, jamais -1 en stock |
| 2 acheteurs simultanés pour le dernier livre | Au maximum 1 réservation valable |
| Paiement Stripe test réussi | `PAID`, stock décrémenté 1 fois, confirmation |
| Webhook signé rejoué 2 fois | Aucun second retrait de stock ni double mail |
| Webhook sans signature valide | HTTP erreur et aucune mutation |
| Paiement annulé / expiré | Pas de vente confirmée, réservation libérée sûrement |
| Email non configuré | Commande persistée, erreur identifiée sans faux « envoyé » |
| Email invalide / adresse incomplète | Validation explicite côté serveur |
| Champs panier truqués (prix=0) | Serveur recalcule depuis la base |
| URL confirmation devinée | Aucune fuite de données client |
| Variables de Stripe LIVE | Configuration rejetée en V1 |
| Mobile 320 px et tablette | Aucun débordement ni action inaccessible |

## Definition of Done

- Fonctionnalités MVP et critères du cahier des charges satisfaits.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` passent (ou exceptions expliquées avec preuve).
- CI GitHub Actions fonctionnelle au moins sur branche/PR si accès disponible.
- `.env.example` complet ; README reproductible ; aucun secret commité.
- Aucun prélèvement réel possible ; comportement de stock idempotent attesté par tests.
- Toute fonctionnalité non vérifiée est marquée « non testée » dans le rapport Codex.
