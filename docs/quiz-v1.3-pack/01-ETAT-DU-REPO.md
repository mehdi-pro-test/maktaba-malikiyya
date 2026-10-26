# Audit source — version actuelle à préserver

## Git

- Dépôt : https://github.com/mehdi-pro-test/maktaba-malikiyya
- `main` observé : `c25a20696b6c44ba6e7ba0cac25ba7e9cd640980`, merge PR #4, quiz du header → niveaux, classique retiré.
- PR #3 fusionnée : V1.2, 150 questions validées par décision déclarée du propriétaire, empreinte canonique `eb1b6ab9830e22a543603e0093f6c9ac100f6e9209cae403413c1528a26598fa`.
- Ne jamais supposer que le HEAD ci-dessus est encore le plus récent. Codex repart du dernier `origin/main`.

## Contrats précis constatés

- `src/data/quiz-v1.2/research.json` : livre, questions, références; 15 × 10; statut `published`.
- `src/data/quiz-v1.2/reviews.json` : 150 décisions de validation liées au digest canonique du **JSON V1.2**.
- `src/lib/quiz-v12.ts` : Zod valide banque/revue, vérifie 10 questions par livre et empreinte SHA, adapte pour le moteur.
- `src/lib/quiz-v12-data.ts` : `server-only` ; `library`, `findQuizBook`, `bookQuestions`.
- `src/lib/quiz.ts` : moteur de score et QCM, API `isCorrect`, `quizScore`, `publishedQuestions`.
- `src/components/quiz-game.tsx` : question, sélection, feedback, références arabes, score, Rejouer.
- `src/components/quiz-library.tsx` : niveaux/livres avec indications de disponibilité.
- `src/app/quiz/niveaux/page.tsx` : cinq niveaux.
- `src/app/quiz/niveaux/[niveau]/page.tsx` : ouvrages par niveau.
- `src/app/quiz/niveaux/[niveau]/[ouvrage]/page.tsx` : page réelle; génération statique selon la V1.2 actuelle; adaptation nécessaire au tirage dynamique.
- `/quiz` : redirection 308 vers `/quiz/niveaux` à préserver; ancien quiz V1.1 archivé dans `docs/v1.1/archive/`.
- `AGENTS.md` : Next.js 16 ; lire `node_modules/next/dist/docs/`.
- `docs/quiz-v1.2/ACTIVATION-2026-10-26.md` et `docs/quiz-v1.2/NAVIGATION-QUIZ.md` : décisions PO **qui priment** sur les documents anciens.

## Anti-régression boutique

Préserver Accueil, Livres/Coran/Hadith/Fiqh, fiches et slugs, Akhdari actif (prix initial 15 €/stock initial 15), Coran et Bukhari, panier et mini-panier, conditions France/Europe, invité, Stripe TEST, signatures et idempotence, stocks/réservations, Resend/outbox, Prisma/Neon, scripts de migrations, sauvegardes/maintenance et CI. Ne pas remettre les stocks à leurs valeurs de départ.

La V1.3 **n'exige pas intrinsèquement** de migration Prisma. Préférer les données éditoriales versionnées sous `src/data/quiz-v1.3/`. Ne pas modifier les migrations déjà appliquées, ni lancer un seed sur Production pour un quiz.

## Régression éditoriale critique

Éviter absolument de modifier directement `src/data/quiz-v1.2/research.json`, car même un changement mineur invaliderait son registre de 150 relectures, lié au digest global. V1.3 doit être additive. Ne pas assimiler la validation des 150 anciennes questions à la validation des 300 nouvelles. Ne pas afficher 100 questions « validées » sur la base d'une simple présence dans le JSON de recherche.