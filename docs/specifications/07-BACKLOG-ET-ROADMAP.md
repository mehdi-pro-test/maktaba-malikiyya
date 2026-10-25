# 07 — Backlog Product Owner et roadmap

## Priorisation : P0 = essentiel avant démo bout en bout

| ID | Priorité | User story | Critère d'acceptation |
|---|---|---|---|
| US-01 | P0 | En tant que visiteur, je découvre Maktaba Malikiya en français. | Accueil, proposition de valeur, CTA fonctionnels. |
| US-02 | P0 | Je filtre les ouvrages Coran/Hadith. | Deux catégories et 2 livres visibles. |
| US-03 | P0 | Je consulte un produit. | Image provisoire, titres FR/AR, prix, bouton. |
| US-04 | P0 | Je peux acheter plusieurs exemplaires. | Quantités modifiables et contrôles stock. |
| US-05 | P0 | Je connais les frais selon destination. | France 4 €/gratuit dès 50 € ; Europe activée 20 €. |
| US-06 | P0 | Je commande sans créer de compte. | Adresse complète + email validés. |
| US-07 | P0 | Je paie par carte sans débit réel. | Stripe Checkout TEST uniquement. |
| US-08 | P0 | Je vois une confirmation fiable. | Résultat basé sur état serveur/webhook. |
| US-09 | P0 | La boutique gère le stock automatiquement. | Pas de survente, décrément 1 fois, annulation sûre. |
| US-10 | P1 | Je reçois un mail de confirmation. | Après paiement confirmé si expéditeur vérifié ; erreurs traçables. |
| US-11 | P0 | Je consulte depuis mon téléphone. | Responsive, accessible au clavier. |
| US-12 | P0 | Développeur, je reproduis projet local et CI. | README, migration, seed, tests, workflow. |
| US-13 | P1 | Owner, je prépare le déploiement Vercel. | Env, webhook, preview documentés ; test après accès. |

## Itérations techniques proposées

1. **Fondation** — Initialisation projet, design system, schéma DB, seed, CI initiale.
2. **Catalogue** — Homepage, bannières, catégories, détails, panier local.
3. **Commande** — Adresse invité, livraison serveur, commandes + réservations.
4. **Paiement test** — Stripe, webhook signé, idempotence, réconciliation, emails.
5. **Durcissement** — Tests, responsive, accessibilité, docs, Vercel.

## V2 (pas dans l'implémentation initiale)

- Authentification admin solide ; back-office produit/prix/photo/stock/commandes.
- Intégration Colissimo (tarifs réels, étiquettes, suivi), éventuel retrait local.
- Conditions commerciales complètes, nouvelles catégories et ouvrages.
- Paiements réels seulement après validation réglementaire, fiscale, juridique, technique.

## Questions non bloquantes à trancher avant production

Liste pays UE desservis, statut vendeur, TVA livres, SIRET/identité éditeur, retour/rétractation, adresses support, frais réels de colis, provenance et licence des visuels.
