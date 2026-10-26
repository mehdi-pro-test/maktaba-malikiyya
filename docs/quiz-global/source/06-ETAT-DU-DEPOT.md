# Constat sur le dépôt source (26 octobre 2026)

Dépôt : https://github.com/mehdi-pro-test/maktaba-malikiyya

Révision `main` directement consultée lors de la rédaction : **`5713c38f531354b2dc0dcf0decb091bf499ab6fc`**.

Ce commit est une **photographie** : avant de coder, Codex doit relire le dernier `origin/main` et ne pas supposer que la révision ci-dessus est encore actuelle.

## Points vérifiés sur cette révision

- Route d'accueil quiz : `/quiz/niveaux`, contenant les cinq parcours (`src/app/quiz/niveaux/page.tsx`).
- Route ouvrage : `src/app/quiz/niveaux/[niveau]/[ouvrage]/page.tsx` ; charge `QuizGame` avec `startQuizAttempt.bind(null, niveau, ouvrage)`.
- Server action par ouvrage : `src/app/quiz/actions.ts`; tirage avec RNG `node:crypto`.
- Pools et source d'autorité : `src/lib/quiz-v12-data.ts` ; base V1.2, neuf lots V1.3 et ajouts Ultime (voir `quiz-v13-lots.ts` / `quiz-ultime-data.ts`).
- Moteur : `src/lib/quiz-draw.ts`, `ATTEMPT_SIZE = 10`, **`MAX_APPROVED_POOL = 200`**; échantillonnage Fisher–Yates par ouvrage, à adapter pour >200 à l'échelle globale.
- Interface : `src/components/quiz-game.tsx`, `QuizGame({availableCount,loadAttempt,context})`. Le composant charge les dix questions côté serveur à la demande, puis réutilise le même `loadAttempt` pour Rejouer.
- UI du catalogue : `src/components/quiz-library.tsx` et `src/app/quiz/niveaux/page.tsx`.
- Navigation : `src/components/navigation.tsx`, le header Quiz reste `/quiz/niveaux`.
- Test d'inventaire : `tests/quiz-ultime.unit.test.ts` affirme un **total de 610 questions approuvées** au snapshot, pour 15 ouvrages (9×40, 2 Ultime = 150+60 et 4 Usul×10). Ce nombre peut évoluer; à ne jamais coder en dur.
- Tests existants : `tests/quiz-attempt.unit.test.ts`, `tests/quiz-v13.unit.test.ts`, `tests/quiz-ultime.unit.test.ts` ; E2E Playwright sous `tests/e2e/`.
- Stack de `package.json` : Next 16.4.3, React 19.2, TypeScript 5.9, Prisma 7.10.1, Vitest 4 et Playwright.
- `AGENTS.md` demande impérativement de lire les guides Next locaux `node_modules/next/dist/docs/` avant toute modification.

**Source de l'information : fichiers du dépôt GitHub consultés, et non promesse de test réellement exécuté.** La génération de ce ZIP documentaire n'a modifié ni la branche GitHub `main` ni l'application Vercel.
