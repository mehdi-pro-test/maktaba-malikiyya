# Maktaba Malikiya — Dossier de réalisation V1

**Statut : cahier des charges validé pour démarrer un développement, pas une application déjà livrée.**

Maktaba Malikiya est une librairie en ligne française proposant des livres religieux en arabe, principalement pour les étudiants francophones en sciences islamiques, à des prix accessibles.

## Livrables de ce dossier

1. `01-CAHIER-DES-CHARGES.md` — objectifs, périmètre, règles métier et critères d'acceptation.
2. `02-UX-DESIGN.md` — identité visuelle et parcours des pages.
3. `03-ARCHITECTURE.md` — architecture, modèle de données et invariants de sécurité.
4. `04-FLUX-PAIEMENT.md` — Stripe test, réservations de stock, webhooks et e-mails.
5. `05-DEVOPS.md` — GitHub, CI, Vercel, configuration, commandes.
6. `06-PLAN-DE-TESTS.md` — tests unitaires, intégration, E2E et qualité.
7. `07-BACKLOG-ET-ROADMAP.md` — user stories et versions.
8. `08-CHECKLIST-AVANT-PRODUCTION.md` — points juridiques/commerciaux à décider avant vente réelle.
9. `09-GUIDE-CODEX.md` — comment donner ce dossier à Codex.
10. `PROMPT-CODEX.md` — instruction prête à copier/coller.
11. `.env.example` — variables attendues, sans aucun secret.

## Décisions produit déjà prises

- Nom temporaire : **Maktaba Malikiya**.
- Interface 100 % **française**, titres de livres possibles en français et en arabe.
- Catalogue V1 : **Coran (Moshaf) à 10 €** et **Sahih al-Bukhari à 100 €**, **10 exemplaires** chacun.
- Pages : Accueil, Coran, Hadith, fiche livre, Panier, commande, confirmation.
- Panier multi-quantités ; commande **sans compte**.
- Livraison : **France métropolitaine 4 €**, **gratuite à partir de 50 € de sous-total produits** ; **autres pays européens proposés : 20 €**, sans gratuité.
- Paiement **carte bancaire uniquement**, via **Stripe en mode test**. **Aucun prélèvement réel** en V1.
- Confirmation par page + e-mail, e-mail expéditeur provisoire (voir limite de Resend).
- Pas de dashboard admin ni de PayPal en V1.
- Stock décrémenté **une seule fois** après paiement test confirmé ; gestion robuste des achats simultanés.
- Style traditionnel inspiré des librairies islamiques : vert profond, crème, doré, atmosphère chaleureuse de bibliothèque/matcha ; logo typographique.
- Mobile-first et responsive.
- Projet **local + nouveau dépôt GitHub privé** `mehdi-pro-test/maktaba-malikiya` (si les accès le permettent), futur déploiement Vercel.

## Philosophie de réalisation

Coder un **MVP fiable** : pas d'architecture microservices, pas d'authentification des acheteurs, pas d'administration prématurée. Les paiements, la sécurité des données et les stocks doivent toutefois être traités sérieusement car l'objectif final est une vraie boutique.

## Première étape conseillée

Ouvrir un dossier local avec Codex, y déposer ces documents, puis lui transmettre `PROMPT-CODEX.md`. Autoriser la création d'un **nouveau** dépôt privé uniquement, jamais l'écrasement d'un dépôt existant.

Les ressources externes et les clés privées doivent être configurées par le propriétaire du projet. Codex ne doit jamais inventer qu'un paiement, un e-mail ou un déploiement a fonctionné.
