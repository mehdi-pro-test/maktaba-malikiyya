# Prompt Codex — Maktaba Malikiyya V1.3, accord éditorial du propriétaire

Je fournis **UN SEUL ZIP** contenant exactement 180 nouveaux QCM, 30 par ouvrage pour les trois ouvrages intermédiaires et les trois ouvrages avancés, avec réponses, citations et URL source, plus un nouvel accord du propriétaire dans `validation-proprietaire/APPROBATION-PROPRIETAIRE-180.json`.

Le propriétaire a déclaré le 26/10/2026 : **« j'ai validé les brouillons »**. Cette déclaration approuve éditorialement les 180 QCM, dans leur état exact. Elle n'atteste **pas explicitement** la confrontation des citations arabes avec une édition primaire ni la vérification des attributions. Il ne faut pas inventer ces deux attestations ni prétendre qu'un spécialiste indépendant les a signées.

**Tâche technique uniquement** :

1. Audite le dernier `main` de https://github.com/mehdi-pro-test/maktaba-malikiyya (dernier HEAD observé : `bc8df4071c87db6037afd86136b0c698406f6223`). Lis `AGENTS.md`, les documents V1.2/V1.3 du dépôt, les six banques `banques/*.json`, et les documents de validation du ZIP. Crée une branche dédiée et une PR non fusionnée.
2. Préserve les données publiées existantes, les 90 questions débutantes déjà intégrées, les validations V1.2/V1.3, et les tirages aléatoires en place. Le quiz classique a été supprimé ; ne le réintroduis pas.
3. Vérifie les SHA-256 des six fichiers JSON d'origine selon `APPROBATION-PROPRIETAIRE-180.json` ; audite les 180 IDs, 4 options, réponses, URL, citations, déduplication exacte et sémantique avec la V1.2 et les banques existantes. Ne corrige aucun fait religieux ni référence sans demande explicite à l'éditeur.
4. Intègre les six lots dans le circuit éditorial du projet de façon **additive**. Les schémas du site peuvent avoir des champs différents : adapte le validateur sans affaiblir les contrôles ni perdre les champs `quoteLayer`, `verification`, `quoteIsCertifiedVerbatim` et `distractorsReviewRequired`.
5. Le document d'accord vaut approbation éditoriale du propriétaire. **Il ne vaut pas attestation automatique `citationVerified=true` ou `attributionVerified=true`.** Le validateur actuel (`src/lib/quiz-v13-editorial.ts`) bloque à juste titre la publication si ces conditions sont absentes. Ne supprime pas cette barrière, ne marque pas les citations comme vérifiées et ne publie pas le contenu sur la seule base de cette déclaration. Présente au propriétaire la vérification manquante, ouvrage par ouvrage.
6. Lorsque ces attestations seront explicitement données, produis un rapport de revue `1.3-review-1` distinct pour chacun des six lots, avec SHA canonique `candidateDigest()` de la banque réellement importée, décisions cohérentes et attribution au propriétaire seulement. Active alors les nouvelles questions dans les quiz après les validations techniques et autorisation de mise en ligne.
7. Conserve le tirage de 10 questions distinctes parmi les questions **publiées** (10/10 tant que le pool contient 10, puis 10/40 si quarante sont effectivement approuvées, et 10/100 lorsque 100 existent), stable pendant la partie et renouvelé sur « Rejouer ».
8. Ne modifie pas la boutique, les produits, stocks et prix, le checkout, Stripe TEST, Resend, Prisma/Neon Production, sauvegardes ou workflow. Aucun reset DB, aucune fusion ni déploiement sans accord.
9. Lance les contrôles lint/TypeScript/build/unitaires/E2E et les tests DB seulement avec une base isolée. Fournis un inventaire et un bilan exacts, une PR non fusionnée, et les points bloquants s'il en reste.

**Codex ne recherche, ne rédige et n'invente aucune nouvelle question-réponse religieuse.**
