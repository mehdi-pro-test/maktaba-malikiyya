# PROMPT CODEX — MAKTABA MALIKIYYA — MODE ALÉATOIRE GLOBAL

Je te fournis une archive documentaire unique pour réaliser la dernière évolution du quiz de mon site **Maktaba Malikiyya** :

**Dépôt GitHub :** https://github.com/mehdi-pro-test/maktaba-malikiyya
**Site :** https://maktaba-malikiyya.vercel.app/quiz/niveaux

Lis impérativement **`AGENTS.md`**, les guides Next 16 dans `node_modules/next/dist/docs/`, puis tous les documents du ZIP, dans cet ordre : `00-LIRE-EN-PREMIER.md`, `06-ETAT-DU-DEPOT.md`, `01-CADRAGE-FONCTIONNEL.md`, `02-ARCHITECTURE-TECHNIQUE.md`, `03-RECETTE-TESTS.md`, `04-NON-REGRESSION.md`.

## Objectif précis

**Ajouter un nouveau « Mode aléatoire — Tous les ouvrages »** sans retirer ou altérer les quiz actuels par niveau et par livre. Un joueur clique sur ce mode, puis sur « Commencer ». Le serveur sélectionne **10 questions distinctes et uniformément aléatoires parmi TOUTES les questions publiées et autorisées actuellement jouables** dans les pools du quiz (tous les livres et cinq niveaux). Il ne faut pas faire un tirage équilibré par ouvrage; chaque **question** a une probabilité identique d'être choisie.

Il joue les dix questions, voit les corrections et références arabes réelles, obtient un score sur 10, et peut cliquer sur « Rejouer » pour effectuer un **nouveau tirage global**. Des questions peuvent se retrouver dans deux parties distinctes : c'est normal. Chaque tentative reste fixe pendant la partie et se renouvelle uniquement au démarrage/replay.

## Réalisation technique

1. Récupère le **dernier HEAD de `origin/main`**, qui peut être plus récent que le snapshot observé `5713c38f531354b2dc0dcf0decb091bf499ab6fc`. Crée une branche `feat/quiz-mode-aleatoire-global`, sans commit direct sur main.
2. Audite les pools approuvés existants depuis `src/lib/quiz-v12-data.ts` (`library`, `bookQuestions`). Ils comprennent la V1.2, des lots V1.3 et les 190 questions Ultime selon leur revue et publication. **Prends uniquement la projection serveur approuvée, pas les brouillons ni les fichiers docs/exports**. Dans les tests du snapshot, on attendait 610 QCM autorisés au total; **recalcule** le nombre au dernier main. Ne l'écris pas en dur.
3. Crée un **agrégateur global `server-only`** : `library.filter(b=>b.available)` → `bookQuestions(b.level,b.id)` → vérification de `status === 'published'` et unicité des IDs → `flatMap`. Toute future question autorisée ajoutée aux pools devra être incluse automatiquement.
4. Dans `src/app/quiz/actions.ts`, ajoute une server action sans paramètre de pool fourni par le client, `startGlobalQuizAttempt()`, qui prend le pool du serveur et échantillonne 10 questions différentes. Utilise un générateur côté serveur issu de `node:crypto`, injectable en test via fonction pure.
5. **Important : `src/lib/quiz-draw.ts` rejette actuellement les pools >200 (`MAX_APPROVED_POOL=200`). Le global regroupe davantage de questions.** Extrais ou ajoute un tirage sans remise permettant un nombre total arbitraire raisonnable (610, 1000, etc.), sans supprimer les validations de périmètre par ouvrage qui servent aujourd'hui. Tests de non-régression impératifs.
6. Ajoute `/quiz/aleatoire` (page serveur) avec un titre « Quiz aléatoire — Tous les ouvrages », un compteur dynamique du pool, et réutilise `QuizGame` avec `availableCount={N}`, `loadAttempt={startGlobalQuizAttempt}` et un contexte générique « Tous les niveaux ». Ne passe jamais le pool complet au client ou dans HTML/RSC; seulement les dix questions tirées sont retournées par la server action lors du lancement/replay.
7. Ajoute une **carte ou un CTA visible en haut de `/quiz/niveaux`** pointant vers `/quiz/aleatoire`. Conserve la navigation du header sur `/quiz/niveaux`. Préserve la redirection de `/quiz` vers les niveaux et ne ressuscite pas l'ancien classique.
8. Réutilise `QuizGame` et ses corrections, citations arabes, score, clavier et mobile. Si tu dois adapter son `QuizContext`, fais-le **de manière rétrocompatible** pour les quiz par ouvrage. Montre la provenance de chaque question via sa vraie source, jamais une attribution globale factice.
9. Ne crée ni question-réponse nouvelle, ni validation éditoriale fictive, ni migration Prisma. Ne touche pas aux données religieuses déjà approuvées. **Aucun changement au panier, produits, prix, stocks, livraison, Stripe TEST, commandes, Resend, Neon, sauvegardes ou sécurité.**
10. Exécute format-check, lint, typecheck, tests unitaires, build et Playwright. Ajoute tests de tirage pour N=9,10,201,610,1000; absence de doublons, uniformité, pool inchangé, nouvelles questions automatiquement incluses, refus des brouillons, stabilité des tentatives/replay et UI/accessibilité. Exécute tests DB seulement sur une base locale jetable.

## Livrable attendu

Une **Pull Request non fusionnée**, un rapport des fichiers changés, un tableau du nombre de questions éligibles par ouvrage/niveau et au global, un bilan honnête des tests réellement exécutés et captures desktop/mobile. **Pas de fusion et pas de déploiement en Production sans mon accord.**

**Ce besoin porte seulement sur le nouveau mode global. Les quiz existants sont déjà opérationnels et ne doivent pas être refaits.**
