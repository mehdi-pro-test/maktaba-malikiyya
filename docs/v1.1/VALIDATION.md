# Livraison V1.1 — 25 octobre 2026

Branche `feat/v1.1-livres-quiz`, créée depuis `origin/main` à jour (`2044abc`). Dossier local `/workspace/maktaba-malikiya`. La branche main et la base de Production n’ont pas reçu les changements V1.1.

## Fonctionnalités vérifiées localement

- Navigation Accueil / Livres / Quiz / Panier, sous-menu clic/clavier, trois sous-catégories et fils d’Ariane. Les anciens liens Coran/Hadith redirigent et les slugs produits V1 restent valides.
- Migration additive et rattachement persistant des catégories. Akhdari est un brouillon séparé avec prix/stock NULL, fiche visible et achat interdit par UI et API. Les deux livres V1 gardent leurs prix et leurs stocks.
- Quiz original : exactement les deux questions fournies, multi-sélection puis choix unique, validation, feedback, progression, score et Rejouer. Les huit brouillons restent invisibles et hors score. Aucun compte, tracking ou persistance du score.
- Mini-panier accessible, boucle Tab, Escape et retour au bouton d’ajout. Progression vers 50 € uniquement en France ; Europe toujours 20 €. Le panier V1 persiste, et un panier invalide n’a plus de lien de checkout actif.
- Confirmation affichant référence, total, lignes figées, livraison et états de paiement/e-mail ; aucun faux envoi déclaré ni coordonnées privées retournées par l’API.
- Couvertures : registre de provenance, sélection locale conditionnée à droits/édition/publication validés. SVG V1 conservés, SVG original Akhdari ajouté. Aucune photographie tierce publiée.

## Commandes et résultats

| Vérification exécutée                                  | Résultat                                          |
| ------------------------------------------------------ | ------------------------------------------------- |
| `npm ci`                                               | Réinstallation depuis le lockfile réussie         |
| `npm run db:generate` et `prisma validate`             | Client généré, schéma valide                      |
| `db:migrate` puis `db:seed` sur copie locale isolée    | Migration appliquée sans reset des produits       |
| `npm run lint` / `npm run typecheck`                   | Réussis                                           |
| `npm test`                                             | **65 tests réussis**, 3 fichiers                  |
| `DATABASE_URL=…/maktaba_test npm run test:integration` | **34 tests réussis**, 4 fichiers, PostgreSQL réel |
| `DATABASE_URL=…/maktaba_v11_dev npm run vercel:build`  | Readiness et build de production réussis          |
| Playwright avec Chromium système, build local          | **28 tests réussis** desktop/mobile               |
| `npm audit --omit=dev --audit-level=high`              | 0 vulnérabilité signalée                          |
| `npm run format:check`                                 | Réussi après formatage                            |

Les suites couvrent : invariants V1, concurrence du dernier livre, signatures et doublons de webhook, API refusant Akhdari sans appel Stripe, contrainte SQL refusant un faux prix, relation Livres/enfants, conservation de commandes/réservations lors de la migration, scores 0/2 et 2/2, quiz vide, brouillons cachés, media non autorisé, seuil France et absence de gratuité Europe.

Playwright vérifie notamment les redirections V1, les fiches, mini-panier et focus, formulaire invité, récapitulatif, confirmation/e-mail en erreur, quiz et replay. Les audits axe WCAG AA passent sur l’accueil, le catalogue, Fiqh, l’intro/jeu de quiz et le mini-panier. Largeur 320 px et reduced-motion vérifiés. Les tests mobiles émulent un iPhone dans Chromium ; Safari, Firefox, VoiceOver et NVDA ne sont pas attestés.

Les API Stripe/Resend sont simulées pour les tests d’intégration ; leur vérification cryptographique Stripe est réelle sur des fixtures hors réseau. Aucune transaction Checkout hébergée ni livraison effective d’e-mail n’a été validée pour cette V1.1.

## Vérifications supplémentaires

- Le quiz a été joué jusqu’à 2/2 dans un serveur dont la connexion PostgreSQL est volontairement inaccessible : succès, panier local V1 inchangé, aucune erreur JavaScript.
- Un client Prisma généré depuis le schéma V1 a lu les deux produits et exécuté une transaction de lecture des réservations sous le verrou commercial sur la base locale migrée. Cela vérifie les anciennes requêtes, pas un rollback Vercel effectif.
- Une fixture de migration V1 avec stocks 7 et 3, commande, ligne et réservation est comparée avant/après la migration : les données V1 sont conservées.
- Sauvegarde locale préalable de la base de développement, restauration dans `maktaba_v11_dev`. Aucune sauvegarde de Production ni migration distante n’est revendiquée.
- 14 captures enregistrées dans `docs/v1.1/screenshots` ; aucune erreur JavaScript pendant leur prise.

## Captures

| Écran       | Ordinateur                                     | Mobile                                        |
| ----------- | ---------------------------------------------- | --------------------------------------------- |
| Accueil     | [capture](screenshots/accueil-desktop.png)     | [capture](screenshots/accueil-mobile.png)     |
| Livres      | [capture](screenshots/livres-desktop.png)      | [capture](screenshots/livres-mobile.png)      |
| Fiqh        | [capture](screenshots/fiqh-desktop.png)        | [capture](screenshots/fiqh-mobile.png)        |
| Quiz intro  | [capture](screenshots/quiz-intro-desktop.png)  | [capture](screenshots/quiz-intro-mobile.png)  |
| Quiz jeu    | [capture](screenshots/quiz-jeu-desktop.png)    | [capture](screenshots/quiz-jeu-mobile.png)    |
| Mini-panier | [capture](screenshots/mini-panier-desktop.png) | [capture](screenshots/mini-panier-mobile.png) |
| Panier      | [capture](screenshots/panier-desktop.png)      | [capture](screenshots/panier-mobile.png)      |

## Limites externes et revue

- La PR doit être revue avant fusion. Le résultat de la CI hébergée ne doit pas être déduit des tests locaux. L’API de lecture des permissions Actions a refusé l’accès à l’intégration (403), bien que le workflow soit visible et actif.
- La configuration/secrets d’une base Vercel Preview isolée et migrée ne sont pas accessibles ici. Le build Preview ne migre jamais automatiquement une base existante. Une preview complète n’est pas validée tant que cette préparation n’a pas été réalisée ; aucun succès de déploiement V1.1 n’est annoncé sans contrôle.
- Le déploiement V1 de main restait signalé réussi avant le push V1.1 ; les vérifications de production et des stocks distants ne remplacent pas un backup de base avant migration.
- Le rollback recommandé est la promotion de l’artefact V1 existant : la reconstruction de l’ancienne révision peut être refusée par son ancien garde-fou de tables. Voir `MIGRATION-ET-PREVIEW.md` avant toute bascule.
- Prix/stock/édition Akhdari non fournis ; huit questions supplémentaires non fournies ; droits et éditions des trois photographies non validés. Les pages de référence ont refusé l’accès depuis le proxy (403) ; aucun accord de reproduction n’est supposé.
- Stripe test, Resend et l’ordonnanceur de rapprochement/réessais nécessitent une recette externe dans l’environnement choisi. Aucun paiement réel n’a été activé.

Proposer dans GitHub une protection de main : PR obligatoire, checks requis après leur premier passage, interdiction des force-push. La politique d’organisation et les droits de configuration doivent être vérifiés par le propriétaire ; cette livraison ne prétend pas avoir activé la protection.
