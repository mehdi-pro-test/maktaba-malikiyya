# V1.2 — architecture et intégration

## État livré

La recherche jointe est importée : 150 questions complètes réparties en quinze ouvrages, cinq parcours. L’import conserve les textes, IDs, options, réponses, explications et références ; le test unitaire compare les données parsées à la banque d’origine. La copie source est conservée dans `recherche/` avec son registre et ses empreintes d’origine. Ce répertoire d’archive est exclu du reformatage ; les documents historiques de cahier des charges sont conservés à sa racine.

Les quinze lots sont activés après la confirmation explicite de relecture humaine du propriétaire le 26/10/2026. Voir `ACTIVATION-2026-10-26.md` pour la provenance de cette décision et le tableau courant. Les données réelles ne sont pas remplacées par des fixtures.

## Contrats et frontières

- `src/data/quiz-v1.2/research.json` : banque de recherche inchangée sur le fond.
- `src/data/quiz-v1.2/reviews.json` : rapport indépendant contenant les 150 décisions approuvées sur déclaration du propriétaire.
- `src/lib/quiz-v12.ts` : validation Zod stricte, contrôles croisés, empreinte canonique, contrôle du rapport, projection publique et adaptation au moteur historique.
- `src/lib/quiz-v12-data.ts` : chargement **server-only**. Les pages de préparation n’envoient au navigateur que les métadonnées du catalogue, jamais les questions et leurs réponses.
- `src/lib/quiz.ts` : API historique conservée ; seul le contrat optionnel des références détaillées a été ajouté.
- `src/components/quiz-game.tsx` : même moteur de sélection/score/progression, contexte d’ouvrage optionnel et références arabes après validation et dans le récapitulatif.
- `src/components/quiz-library.tsx` : catalogue rendu côté serveur, indépendant des catégories commerciales.

Routes : `/quiz` conserve les dix questions historiques ; `/quiz/niveaux` présente cinq parcours ; `/quiz/niveaux/[niveau]` présente ses ouvrages ; `/quiz/niveaux/[niveau]/[ouvrage]` affiche le lot validé ou sa préparation. Les parcours et ouvrages inconnus, ou un ouvrage demandé sous le mauvais niveau, retournent 404. Les cinq pages de niveau et les quinze pages d’ouvrage sont prérendues au build ; aucun accès DB ni appel à un site source pour consulter ou jouer aux quiz.

L’extension à un ouvrage ne demande pas de modifier un moteur : ajouter un livre et ses dix questions cohérentes, un niveau connu et, facultativement, `titleFr`. Les contraintes quantitatives quinze ouvrages/150 questions décrivent la livraison initiale dans les tests ; le schéma permet d’étendre la banque.

## Relecture et activation d’un lot

Les décisions de relecture sont séparées des questions. Une décision contient `questionId`, `bankSha256`, `decision`, `reviewerName`, `reviewedAt`, `notes`. Le nom et la date doivent provenir du rapport humain réel ; le logiciel vérifie leur forme et leur cohérence, pas l’identité ou la compétence de la personne.

Le digest de référence est le SHA256 du JSON **canonique** : clés d’objets triées récursivement, tableaux et contenus inchangés. Il est volontairement distinct de l’empreinte du fichier ZIP ou de sa mise en page. Un changement de contenu, de réponse, de source, d’ordre ou de statut change cette empreinte. Un rapport visant une ancienne banque est rejeté au chargement et à l’import, donc un build peut être bloqué plutôt que publier une revue périmée.

Commande de consultation :

```sh
npx tsx scripts/quiz-review.ts
```

Commande de validation d’un rapport humain réel, sans écrire de fichier :

```sh
npx tsx scripts/quiz-review.ts /chemin/rapport.json
```

Import d’un rapport déjà relu et validé :

```sh
npx tsx scripts/quiz-review.ts /chemin/rapport.json --import
```

Une seule décision par question est permise. Les dates antérieures à la constitution de la banque et futures selon le jour civil en `Europe/Paris` sont refusées ; une question inconnue ou une empreinte différente bloque le rapport. Une décision rejetée ou demandant des corrections ne vaut jamais approbation.

Préparer la version candidate avant son envoi au relecteur, y compris les statuts de publication envisagés. Il faut dix questions du livre approuvées pour cette empreinte exacte, les statuts `published` du livre et des dix questions, et `publicationAllowed: true` pour que le lot soit jouable. Les métadonnées `scholarlyReview` issues de la recherche ne suffisent jamais à ouvrir un lot. L’import du rapport ne modifie pas silencieusement les questions ni les statuts. Ne pas changer les statuts après signature sans une nouvelle revue portant sur la nouvelle empreinte.

Tout champ inconnu, doublon d’ID ou de choix, réponse absente, référence inconnue, attribution incohérente ou URL non HTTPS est rejeté par Zod. Les citations sont affichées comme texte React, sans HTML injecté ; édition, repère, page imprimée et page PDF restent distincts. Aucune page ou édition inconnue n’est complétée automatiquement.

## Tests des futurs lots publiés

Les vraies questions restant en revue, les tests de jeu utilisent des questions et citations **synthétiques**. `tests/fixtures/quiz-v12.ts` construit cette fixture ; elle n’est importée par aucun fichier de `src/`. Les faux noms de relecteur n’existent que dans les tests.

Playwright démarre une seconde application Next de test sur `127.0.0.1:3101`, située sous `tests/fixtures/quiz-app`. Elle monte le même composant `QuizGame` et le même adaptateur avec le contenu fictif. Aucune route de fixture ni variable permettant de publier des brouillons n’est ajoutée à l’application de production. Le premier serveur reste l’application réelle, avec les quinze lots fermés. Les deux serveurs sont pilotés et arrêtés par Playwright.

Les tests couvrent 0/10, 5/10, 10/10, le double clic sur valider sans double point, la progression et le focus clavier, les références RTL après validation, le récapitulatif, Rejouer, l’accessibilité axe et les parcours mobiles. Les tests HTTP contrôlent les quinze pages en préparation et l’absence de questions/corrections dans leur HTML/RSC.

## Absence de régression commerciale

Aucun fichier Prisma, aucune migration, aucun workflow de maintenance/sauvegarde et aucune fonction commerciale modifiés. Pas de migration V1.2. Les commandes DB de recette sont limitées à PostgreSQL 17 local, base `maktaba_test_quiz_v12` créée pour ces essais. Les migrations V1.1 et le seed n’ont été exécutés que sur cette base jetable.

Les limites Stripe/Resend de V1.1 restent documentées : aucun succès de paiement réel ni réception d’e-mail réel n’est attesté par ces tests. Les tests d’intégration utilisent des fixtures hors ligne et les E2E vérifient le blocage honnête de l’intégration indisponible.

Aucun déploiement Production ni fusion autorisés pour cette livraison.
