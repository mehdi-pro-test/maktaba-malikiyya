# État V1.1 constaté et anti-régression

Base contrôlée : `main@cad05a9cf7200ce11f5f51dcbe0d3610ef87434a`, issue de la PR #2 fusionnée. **Toujours vérifier à nouveau le HEAD de main au début du travail Codex.** L'état ci-dessous est une photographie du dépôt, pas une attestation de l'environnement de production à une date ultérieure.

## Fichiers et contrats existants

- `src/data/quiz-v1.1.json` : **10 questions publiées**, dont Q1 choix multiples, Q2 choix unique et Q3–Q10 avec liens éditoriaux. Ne pas les effacer, les renuméroter ou les requalifier artificiellement comme issues des 15 livres.
- `src/lib/quiz.ts` : validation Zod, filtrage des questions publiées, vérification d'une sélection exacte et score 1/0. Conserver l'API `publishedQuestions`, `isCorrect`, `quizScore` ou maintenir une compatibilité stricte.
- `src/lib/quiz-data.ts` : chargement du quiz historique.
- `src/components/quiz-game.tsx` : expérience interactive sans chrono, focus, progression, score, feedback, sources et bouton Rejouer.
- `src/app/quiz/page.tsx` : route historique `/quiz`, déjà jouable. La métadonnée description est encore « Deux questions » malgré les dix questions : une correction éditoriale isolée est autorisée, sans modifier le parcours.
- `src/app/page.tsx` : compteur quiz calculé depuis les questions publiées ; ne pas le remplacer par les 150 slots en brouillon.
- `src/components/navigation.tsx` : navigation Accueil/Livres/Quiz. Garder les catégories Coran/Hadith/Fiqh sous Livres.
- `src/data/categories.ts` : catégories de la **boutique**, ne pas y enregistrer les niveaux pédagogiques.
- `tests/quiz.unit.test.ts` : invariants du quiz V1.1 et progression livraison.
- `tests/e2e/v11.spec.ts`, `tests/e2e/accessibility.spec.ts`, `tests/e2e/shop.spec.ts` : E2E existants ; ne pas affaiblir les assertions.
- `AGENTS.md` : règles de Next.js 16 ; lire la documentation locale `node_modules/next/dist/docs/` avant d'implémenter.
- `package.json` : Node 24, Next 16.4.3, React 19.2, Prisma 7.10.1, Zod 4, Vitest et Playwright.
- `.github/workflows/ci.yml` : format, lint, typecheck, unitaires, intégration PostgreSQL, build et E2E sur Chromium/Firefox/WebKit.
- `docs/v1.1/FINALISATION.md` : référence opérationnelle V1.1 et limites Stripe/Resend.

## Contrats commerciaux non négociables

- Coran 10 €, Sahih al-Bukhari 100 € comme valeurs **initiales** V1 ; **ne jamais réinitialiser les prix ou stocks courants en base**.
- Akhdari actif : 15 € et stock **initial** 15, édition Maktaba Malikiyya, id/slug existants conservés.
- France : livraison 4 € sous 50 €, offerte à partir de 50 € ; pays européens autorisés : 20 € sans gratuité.
- Panier et `maktaba-cart` conservés, checkout invité et anciens liens livres conservés.
- Stripe exclusivement TEST (`sk_test_`), signatures et idempotence serveur ; réservations et stocks transactionnels ; Resend/outbox et rapprochement intacts.
- **Ne pas modifier** `prisma/schema.prisma`, `prisma/migrations/`, `src/lib/orders.ts`, `src/lib/payments.ts`, `src/lib/rules.ts`, `src/lib/email.ts`, les API de commande/webhook, `scripts/migrate.ts`, les workflows de sauvegarde/maintenance, sauf justification technique formelle et revue explicite. Pour le quiz, une base de données n'est pas requise.
- Les migrations existantes `202610250001_initial`, `202610250002_categories_drafts`, `202610250003_akhdari_active` restent immuables.
- Les SVG existants restent en place ; ne pas ajouter de visuels externes sans autorisation.

## État réel des validations passées

La PR #2 rapporte 65 unitaires, 35 intégration et 56 E2E locaux, plus des vérifications de Preview et Production. Ce sont des **résultats historiques**, pas des tests relancés dans ce pack. L'intégration Stripe et Resend externe n'était pas validée (réponses 401/403). Les workflows de maintenance/sauvegarde sont livrés mais leur activation automatisée dépend encore des secrets/droits GitHub. Ne pas déclarer ces points « réglés » par la V1.2.

## Définition d'absence de régression

- `/quiz` doit rester accessible et proposer les **10 questions historiques** ; nouveaux parcours ajoutés à `/quiz/niveaux` (pas de rupture de route).
- Accueil, Livres, catégories, fiches, Panier, commande et confirmation doivent conserver leur comportement.
- Aucun appel réseau externe pour jouer ; aucune dépendance aux secrets, cookies, comptes ou à PostgreSQL pour les quiz.
- Toute nouvelle question est isolée par un identifiant stable et un statut éditorial ; aucun brouillon ne doit être compté ni affiché comme jouable.
- Les sources et les corrections ne doivent apparaître qu'après validation de la réponse et dans le récapitulatif (éviter de divulguer la solution avant le choix).
- Aucun test supprimé, skip ou assertion affaiblie pour « faire passer » la CI.
