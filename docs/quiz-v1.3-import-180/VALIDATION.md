> **Actualisation :** le propriétaire a confirmé « verif ok / mets en prod ». Les six rapports d’approbation sont enregistrés et le total passe à 420 questions publiées. Voir [l’activation déclarée](ACTIVATION-2026-10-26.md). Le bilan initial ci-dessous décrit l’état avant cette confirmation.

# Validation technique de l’import des 180 questions

Contrôles du 26 octobre 2026, sur une branche dédiée issue de `main@bc8df4071c87db6037afd86136b0c698406f6223`. Aucun contenu religieux rédigé ou corrigé. Aucun test hébergé ou de Production effectué pour cet import.

| Contrôle exécuté                    | Résultat                                                                                                                                                                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsx scripts/quiz-180-audit.ts` | Six SHA-256 conformes, 180 IDs/choix/réponses/références structurés ; 420 IDs uniques au total ; aucune collision d’énoncé normalisé ; 13 signaux de proximité non certifiés                                                                                           |
| `npm test`                          | **110 tests réussis** : validations existantes conservées, égalité des fichiers livrés, couverture de l’approbation, refus de l’approbation comme rapport de publication, nouvelles métadonnées conservées, garde-fous citation/attribution/déduplication/distracteurs |
| `npm run lint`                      | Réussi                                                                                                                                                                                                                                                                 |
| `npm run typecheck`                 | Réussi                                                                                                                                                                                                                                                                 |
| `npm run format:check`              | Réussi ; archives et copies originales exclues volontairement, intégrité contrôlée par SHA et comparaison des octets                                                                                                                                                   |
| `npm run test:integration`          | **35 tests réussis**, exclusivement avec `DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test_v13`                                                                                                                                                           |
| `npm run db:seed`                   | Catalogue de test préparé après intégration, sur cette même base isolée uniquement                                                                                                                                                                                     |
| `npm run build`                     | Réussi, avec cette même base de test                                                                                                                                                                                                                                   |
| `npm run test:e2e -- --workers=2`   | **112 cas distincts validés** : passage complet 110/112, puis nouveau test de non-diffusion corrigé et rejoué **4/4** sur Chromium desktop/mobile, Firefox et WebKit mobile                                                                                            |

Les dépendances et le lockfile sont inchangés ; aucune installation de nouvelle dépendance. La CI existante exécute `npm ci` séparément. Aucun test n’est supprimé ou ignoré, aucun workflow n’est modifié.

## Non-régression

Le diff confirme l’absence de modification des 150 questions V1.2, de leurs validations, des trois lots débutants actifs et de leurs rapports, du registre actif, des routes publiques, du moteur/scoring, du catalogue, des prix/stocks, du panier/mini-panier, des frais, du checkout, des commandes, de Stripe/Resend, de Prisma/migrations/seed et des sauvegardes. Les tests existants de ces parcours sont conservés.

La suite PostgreSQL couvre les cas métier existants (réservations, stocks, commandes, signatures/idempotence, expiration, outbox). Stripe et Resend y sont simulés ; aucune recette Stripe hébergée ni aucun e-mail réel n’est envoyé. Les navigateurs emploient les clés vides pour vérifier l’indisponibilité honnête du paiement, sans créer de commande métier.

Le nouveau cas navigateur vérifie les compteurs inchangés des quinze ouvrages et cherche les 180 identifiants dans le HTML, les scripts JavaScript effectivement chargés et les réponses des actions de démarrage des six quiz concernés. Ces assertions exigent également que les dix questions V1.2 restent jouables. Les deux échecs du passage complet concernaient uniquement la collecte du corps réseau (Chromium desktop/mobile). Ce nouveau cas a été corrigé puis validé sur les quatre profils. La collecte du corps réseau a été corrigée après un échec initial de `response.text()` côté protocole Chromium ; la réponse est désormais capturée avant remise au navigateur, sans affaiblir les assertions de non-diffusion.

Le rapport de collisions reste une aide de comparaison textuelle, pas une vérification doctrinale ni une déduplication sémantique exhaustive. Les points manquants par ouvrage figurent dans [le bilan d’import](README.md).

## Livraison

PR non fusionnée. Aucun déploiement : l’auto-déploiement Git de cette seule branche est désactivé dans Vercel. Aucune migration Production ni intervention Neon.
