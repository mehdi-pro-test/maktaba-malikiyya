# Contrôles de l’intégration Ultime 190

Recette locale du 26 octobre 2026. Aucune fusion, aucun déploiement, aucun test ni migration sur la base Production.

| Commande / contrôle                    | Résultat réellement observé                                                                                                                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsx scripts/quiz-ultime-audit.ts` | 190 IDs approuvés importés une seule fois, empreinte de la banque approuvée conforme, exports 140/50 identiques aux sous-ensembles canoniques, 22 notices cohérentes hors leur libellé de validation ; 610 IDs et énoncés normalisés uniques |
| `npm test`                             | **120 tests réussis**                                                                                                                                                                                                                        |
| `npm run lint`                         | Réussi                                                                                                                                                                                                                                       |
| `npm run typecheck`                    | Réussi                                                                                                                                                                                                                                       |
| `npm run format:check`                 | Réussi ; sources originales immuables exclues, contrôlées par SHA et égalité des octets                                                                                                                                                      |
| `npm run test:integration`             | **35 tests PostgreSQL réussis** exclusivement sur `postgresql://maktaba@127.0.0.1:5432/maktaba_test_v13`                                                                                                                                     |
| `npm run db:seed`                      | Exécuté seulement pour préparer le catalogue de cette même base locale après intégration                                                                                                                                                     |
| `npm run build`                        | Réussi avec la base locale isolée                                                                                                                                                                                                            |
| `npm run test:e2e -- --workers=2`      | **120 tests réussis en un passage complet (6,4 min)** : Chromium desktop/mobile, Firefox et WebKit mobile émulé ; pas d’essai sur téléphone physique                                                                                         |

Les dépendances, le lockfile et les workflows existants restent inchangés. Aucun nouveau paquet installé. La CI existante exécute séparément `npm ci` et ses tests sur une base jetable.

## Couverture

Les unitaires contrôlent :

- 1 000 tirages sans remplacement pour chacun des pools 10, 60, 100, 150 et 200, entrée inchangée et RNG injectable ; refus de 201 questions et des IDs répétés.
- Inclusion déterministe de la 150e question dans le tirage, sans troncature à 100 ; dix questions de score exact-match, y compris réponses multiples historiques.
- Préservation des 20 historiques Ultime, des 400 autres questions, des compteurs 150/60 et du total 610.
- Intégrité brute/canonique, périmètre des 190 décisions, rejets des contenus modifiés, décisions hors périmètre, questions au statut draft ou certification savante fictive.
- Retrait d’autorisation du lot, d’une décision individuelle ou d’une question non approuvée, sans fausse attestation des sources.
- Conservation des sources `requires-editorial-collation` et `scholarlyReview: not-attested`, des champs d’approbation du propriétaire et des anciens digests/rapports.

Les nouveaux parcours navigateur jouent les deux banques réelles à 150 et 60 : dix IDs distincts du bon ouvrage, score 5/10 et 10/10, ordre stable, récapitulatif, citations RTL, mention de source non attestée après réponse, Rejouer avec seconde requête et score remis à zéro. Le HTML initial et les scripts ne doivent pas exposer la banque entière. La matrice conserve aussi les tests existants de scores 0/5/10, parcours mobiles, clavier, axe et boutique.

Pendant l’implémentation, les tests historiques ont détecté une incompatibilité du nouveau champ `textCheck` avec les valeurs historiques `matched-transcription`/`read-facsimile` : le modèle de jeu conserve désormais les trois valeurs distinctes, sans modifier les données ni attribuer une collation aux nouveaux items. Les tests historiques sont de nouveau réussis. Les assertions de plafond ont été adaptées à la nouvelle borne documentée 200 ; aucun test supprimé ou ignoré.

## Boutique et limites

Aucune modification des produits, prix/stocks, paniers, livraison, commandes, Stripe TEST, Resend, Prisma, migrations, sauvegardes ou sécurité. La suite métier PostgreSQL conserve ses cas de concurrence, réservations, signatures/idempotence, expiration et outbox sur base isolée. Stripe et Resend y sont simulés ; aucun paiement hébergé ni e-mail réel n’est testé. La Production reste inchangée.

La validation du propriétaire n’est pas présentée comme une expertise indépendante. La collation des citations et les attributions de fiqh comparé ne sont pas attestées ; aucune édition/page n’est inventée. Le hash de recherche antérieur n’est pas recalculable faute de payload ; les deux mentions de ce hash concordent et le hash de la banque approuvée reçue est effectivement vérifié. Les rapprochements lexicaux ne certifient pas l’absence de doublons doctrinaux.
