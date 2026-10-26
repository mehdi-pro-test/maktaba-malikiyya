# Livraison Codex V1.3 — paquet consolidé

## Périmètre effectivement joint

Ce ZIP est un instantané du dépôt GitHub V1.2 actuel **avec** la documentation technique V1.3. Il contient les **150 questions-réponses déjà publiées** dans `src/data/quiz-v1.2/research.json` et les **150 décisions de relecture** dans `src/data/quiz-v1.2/reviews.json`, ainsi qu'un export lisible dans le dossier de ce pack.

**Il ne contient pas** la banque séparée de 300 questions débutantes issue de la recherche approfondie V1.3, car cet artefact n'était pas disponible dans la conversation lors de la constitution de cette archive. Ne pas affirmer qu'il s'agit d'une livraison de 300 ou 1 500 questions V1.3. Aucune question nouvelle n'a été fabriquée pour combler cette absence.

## Travail technique

1. Vérifier le HEAD de `origin/main` puis partir du dernier `main` (sans régression des commits plus récents).
2. Créer `feat/quiz-v1.3-random-10` et préserver les données et revues V1.2 inchangées.
3. Implémenter un tirage sans remplacement de 10 parmi N questions **effectivement disponibles, uniques et approuvées** par ouvrage. Si N=10, les dix existantes restent jouables. Si N=100, le tirage doit varier à chaque nouvelle partie. Ne pas afficher 100 si N=10.
4. Les 300 questions débutantes peuvent être importées **uniquement lorsque leur fichier source réel aura été fourni**. Sinon, signaler le manque et ne rien inventer.
5. Tester le scoring, la stabilité du tirage, le replay, les citations arabes, les routes, la boutique et la sécurité; ne pas déployer et ouvrir une PR non fusionnée.

## Protection

La V1.2 du propriétaire a supprimé le quiz classique et fait pointer `/quiz` vers `/quiz/niveaux`; cette décision prévaut sur la V1.1 historique. Ne modifier ni Prisma/Neon Production, ni stocks, ni checkout/Stripe TEST, ni commandes, ni Resend, ni workflows de sauvegarde.

## Livrables

Une PR non fusionnée, une trace des tests exécutés et des limitations, un tableau clair des questions disponibles/validées par livre, et une demande explicite du vrai fichier éditorial V1.3 pour achever les banques 100/ouvrage.
