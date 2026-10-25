# V1.2 — audit, recette et livraison

## Audit initial

Le HEAD distant de main a été revérifié avant modification : `cad05a9cf7200ce11f5f51dcbe0d3610ef87434a`. La branche locale `feat/quiz-v1.2-niveaux` était à cette base et propre. Aucun développement ultérieur sur main n’a été écrasé. Les guides Next.js locaux sur les composants serveur/client, paramètres asynchrones et génération statique ont été lus.

Le moteur V1.1 fournit déjà choix simples/multiples, validation, score, progression, focus et récapitulatif. Il est réutilisé avec un contexte d’ouvrage et des références enrichies optionnels. Le quiz historique est conservé à l’identique dans ses données. Les trois migrations V1.1, le schéma et les fichiers commerciaux n’appellent aucun changement.

## Réalisation

- Catalogue de cinq parcours et quinze ouvrages ; pages de niveau et d’ouvrage prérendues, 404 pour slug inconnu ou association incorrecte.
- Import complet des 150 QCM, avec validation Zod stricte et tests d’absence de perte de contenu.
- Séparation de la banque serveur et de la projection publique ; aucun contenu de brouillon transmis aux pages publiques ni trouvé dans les chunks client du build.
- Barrière de publication et import d’un rapport humain lié à l’empreinte canonique de la banque ; refus des rapports périmés, inconnus, dupliqués ou datés de manière incohérente.
- Jeu commun aux deux versions, références arabes RTL après validation, résultat sur dix, récapitulatif et Rejouer. Les parcours publiés futurs sont testés avec des données fictives exclusivement dans une application de test séparée.
- Aucun quiz V1.2 publié artificiellement : les quinze pages réelles affichent « Quiz en préparation ».

## Tableau effectif des lots

| Parcours      | Ouvrage                                      | Questions importées | Approuvées humainement | Publiées | État           |
| ------------- | -------------------------------------------- | ------------------: | ---------------------: | -------: | -------------- |
| debutant      | مختصر الأخضري                                |                  10 |                      0 |        0 | En préparation |
| debutant      | المرشد المعين على الضروري من علوم الدين      |                  10 |                      0 |        0 | En préparation |
| debutant      | المقدمة العشماوية                            |                  10 |                      0 |        0 | En préparation |
| intermediaire | المقدمة العزية للجماعة الأزهرية              |                  10 |                      0 |        0 | En préparation |
| intermediaire | أسهل المسالك في مذهب الإمام مالك             |                  10 |                      0 |        0 | En préparation |
| intermediaire | الرسالة                                      |                  10 |                      0 |        0 | En préparation |
| avance        | مختصر خليل                                   |                  10 |                      0 |        0 | En préparation |
| avance        | الشرح الكبير على مختصر خليل                  |                  10 |                      0 |        0 | En préparation |
| avance        | حاشية الدسوقي على الشرح الكبير               |                  10 |                      0 |        0 | En préparation |
| ultime        | بداية المجتهد ونهاية المقتصد                 |                  10 |                      0 |        0 | En préparation |
| ultime        | الاستذكار                                    |                  10 |                      0 |        0 | En préparation |
| usul          | إيصال السالك إلى أصول مذهب الإمام مالك       |                  10 |                      0 |        0 | En préparation |
| usul          | الورقات مع قرة العين بشرح ورقات إمام الحرمين |                  10 |                      0 |        0 | En préparation |
| usul          | مرتقى الوصول إلى علم الأصول                  |                  10 |                      0 |        0 | En préparation |
| usul          | مراقي السعود لمبتغي الرقي والصعود            |                  10 |                      0 |        0 | En préparation |
| **Total**     | **15 ouvrages**                              |             **150** |                  **0** |    **0** | **review**     |

Les 30 questions débutantes sont bien importées. Les réponses et sources sont présentes : la condition manquante pour ouvrir les nouveaux quiz est la revue doctrinale humaine, pas la rédaction du contenu. Le [tableau documentaire détaillé](recherche/TABLEAU-VALIDATION.md) et le [rapport de recherche](recherche/RAPPORT-RECHERCHE.md) conservent les limites éditoriales.

## Contrôles effectivement exécutés

| Contrôle                                              | Résultat local                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `npm ci`                                              | Réussi, Node 24 et dépendances du lockfile                         |
| `npm run db:generate`                                 | Réussi, génération uniquement                                      |
| `npm run format:check`                                | Réussi                                                             |
| `npm run lint`                                        | Réussi, sans avertissement                                         |
| `npm run typecheck`                                   | Réussi                                                             |
| `npm test`                                            | 83 tests réussis                                                   |
| `npm run test:integration`                            | 35 tests réussis sur PostgreSQL 17 local                           |
| `npm run build`                                       | Réussi ; 5 pages de niveau et 15 pages d’ouvrage prérendues        |
| `npm run test:e2e -- --workers=2`                     | 80 tests réussis, 20 sur chacun des 4 projets                      |
| Contrôle ciblé après correction du numéro de parcours | 12 tests réussis sur les 4 profils navigateur                      |
| `python3 docs/quiz-v1.2/recherche/verifier.py`        | 150 entrées cohérentes ; aucune approbation humaine revendiquée    |
| `sha256sum -c SHA256SUMS.txt` dans `recherche/`       | Les fichiers de l’archive d’origine conservent leurs empreintes    |
| `npx tsx scripts/quiz-review.ts`                      | Empreinte et usage affichés ; aucun rapport humain inventé/importé |

La première exécution E2E a relevé des défauts de la fixture et de structure du récapitulatif. Ils ont été corrigés, puis la suite entière a été rejouée avec 80 succès. Aucun test historique n’a été supprimé, désactivé ou affaibli. Les anciens tests couvrent également les scores du quiz historique, les catégories, fiches, panier, frais de livraison, formulaire invité et confirmation. Les nouvelles assertions couvrent notamment les quinze pages fermées, les 404, clavier, 320 px, accessibilité axe, RTL, 0/10, 5/10, 10/10, double validation et Rejouer.

Le projet desktop utilise Chromium ; mobile utilise l’émulation iPhone sous Chromium ; Firefox est desktop ; `webkit-mobile` est une émulation iPhone sous WebKit. Aucun appareil Safari réel, VoiceOver ou NVDA n’a été vérifié. Les dépendances partagées et le lanceur WebKit disponibles dans l’environnement ont été utilisés ; la CI installe normalement les navigateurs via Playwright.

## Isolement et non-régression de la boutique

Toutes les commandes utilisant PostgreSQL ont reçu explicitement :

```text
DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test_quiz_v12
```

Cette base jetable a été créée dans le conteneur PostgreSQL 17 local existant. Les migrations et le seed V1.1 y ont servi uniquement à préparer la recette. Aucun appel Neon Production ni Preview, aucune lecture ou écriture de commandes ou stocks Production. Les variables Stripe/Resend ont été laissées vides pour les E2E ; les intégrations utilisent des mocks hors ligne dans leurs tests dédiés.

Le [registre de comparaison](PROTECTION-V11.json) atteste l’identité de 31 fichiers protégés avec la base V1.1 : migrations, Prisma, commandes, paiements, règles de livraison, e-mails, API, catégories, quiz historique, fiches, checkout, workflows, scripts de migration/déploiement, images et manifestes npm. Aucun prix ni stock n’a été réinitialisé. La comparaison porte sur le code ; elle ne prétend pas mesurer les lignes d’une base Production qui n’a pas été consultée.

Les blocages de configuration Stripe/Resend, maintenance et sauvegardes décrits en V1.1 ne sont pas déclarés résolus. Les tests ne prouvent ni un paiement hébergé réussi ni la réception d’un véritable e-mail.

## Captures

Les [captures](../screenshots/quiz-v1.2/) comprennent le catalogue desktop et 320 px, un ouvrage en préparation, le quiz classique, et le jeu de test avec correction arabe. Les captures portant `fixture-` montrent explicitement du contenu synthétique et ne sont pas une publication de contenu religieux.

## Livraison et limites

Code sur `feat/quiz-v1.2-niveaux`, PR vers main non fusionnée. Aucun déploiement Production ni migration V1.2. Les contrôles ci-dessus sont des résultats locaux ; le statut de CI distante est à consulter sur la PR. La publication des quinze nouveaux lots attend une revue humaine effective et un accord de livraison ultérieur.
