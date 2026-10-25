# PROMPT À COPIER DANS CODEX — Maktaba Malikiyya V1.2 / quiz par niveau

Tu interviens sur le dépôt EXISTANT https://github.com/mehdi-pro-test/maktaba-malikiyya, sans repartir de zéro. Je te transmets l'archive GitHub de la branche documentaire `docs/quiz-v1.2-codex-20261025`. Elle contient l'intégralité du code V1.1 et le dossier `docs/quiz-v1.2/`. Lis **tous** les documents de ce dossier, `AGENTS.md` et `docs/v1.1/FINALISATION.md` AVANT de modifier quoi que ce soit.

## 1. Base et protection de l'existant

La branche documentaire a été créée à partir de `main@cad05a9cf7200ce11f5f51dcbe0d3610ef87434a` (25/10/2026, PR #2 fusionnée). Vérifie `origin/main` au début : si `main` a avancé, repars du **HEAD le plus récent**, réapplique le dossier documentaire sans écraser les développements ultérieurs, et travaille sur une nouvelle branche `feat/quiz-v1.2-niveaux` (ou suffixe distinct si elle existe). Ne pousse jamais directement sur `main`. Avant le code, dresse un inventaire du quiz, de la boutique, des migrations et des tests présents. Lis les guides Next.js locaux imposés par `AGENTS.md`.

Préserve intégralement : navigation Accueil/Livres (Coran, Hadith, Fiqh)/Quiz/Panier ; pages livres et slugs ; Akhdari actif à 15 € avec stock initial 15 et édition Maktaba Malikiyya ; Coran et Bukhari ; panier `maktaba-cart`, frais de port, checkout invité, Stripe **TEST uniquement**, signature webhook, réservations, idempotence, Resend/outbox, procédures Neon et CI. Aucun reset de stock, aucune migration SQL existante modifiée, aucun secret publié, aucune photo externe ajoutée. Ne touche pas aux fichiers de commerce ni au schéma Prisma pour cette fonctionnalité sans justification et approbation explicites. Les blocages externes Stripe/Resend et les limites de maintenance documentées en V1.1 restent des blocages tant qu'ils ne sont pas réellement levés.

## 2. Fonctionnalité demandée

Ajouter un parcours de quiz par **niveau ET par ouvrage**, sans supprimer le quiz historique de dix questions de `/quiz` :
- **Débutant : 3 quiz distincts de 10 questions** : مختصر الأخضري, متن ابن عاشر / المرشد المعين, العشماوية.
- **Intermédiaire :** المقدمة العزية, أسهل المسالك, الرسالة لابن أبي زيد القيرواني.
- **Avancé :** مختصر خليل, الشرح الكبير للدردير, حاشية الدسوقي.
- **Ultime :** بداية المجتهد ونهاية المقتصد (édition critique ou commentaire à justifier), الاستذكار لابن عبد البر.
- **Oussoul al-fiqh malikite :** إيصال السالك, الورقات مع شرح الحطاب, مرتقى الوصول لابن عاصم الغرناطي, مراقي السعود.

Les 15 ouvrages figurent dans `docs/quiz-v1.2/ouvrages.v1.2.json` avec statut **draft**. Les 12 autres quiz de 10 sont une cible proposée, soit **150 questions visées au total** ; les 30 questions débutantes sont la demande quantitative ferme, **sous réserve de validation des sources**. Ne confonds pas les niveaux du quiz avec les catégories de produits.

## 3. Sources arabes : aucune invention

La recherche approfondie en arabe a été lancée séparément ; **son rapport final et ses citations primaires ne figurent pas encore dans ce pack**. Ne prétends pas qu'il est inclus. Recherche d'abord les textes arabes et éditions fiables accessibles (bibliothèques arabes, manuscrits/éditions, commentaires), ou attends l'import du rapport de recherche. Vérifie titre, auteur, chapitre, attribution et avis juridique. N'invente **jamais** question, réponse, citation arabe, page, édition, URL, ou validation d'un savant. Chaque question publiée doit posséder : ouvrage arabe, auteur, section/chapitre, courte citation arabe exacte, URL directe HTTPS si disponible, édition/page seulement si réellement vérifiées, réponse correcte non ambiguë, explication française et statut de relecture. Distingue texte primaire, sharh, hashia et source secondaire. Signale les divergences entre écoles, notamment chez Ibn Rushd. Vérifie l'attribution d'Issal as-Salik et de Maraqi as-Su'ud ; le matn al-Waraqat est d'al-Juwayni.

**Règle absolue :** si tu n'as pas dix questions **réellement sourcées et relues** pour un ouvrage, laisse ce quiz `draft`/« En préparation » et indique combien de questions manquent. Ne fabrique pas de contenu pour atteindre un quota. Le propriétaire pourra importer le rapport arabe plus tard ; prépare un format d'import stable et un registre de traçabilité. Le quiz historique V1.1, avec ses dix questions, reste distinct.

## 4. Interface et architecture

- Garde `/quiz` jouable comme aujourd'hui (dix questions, score, feedback, Rejouer, sources). Ajoute un CTA vers `/quiz/niveaux`.
- Crée `/quiz/niveaux` (5 parcours) et `/quiz/niveaux/[niveau]/[ouvrage]` (ouvrage + quiz si publié, sinon « En préparation » ; 404 pour slug inconnu).
- Affiche des cartes de niveaux/ouvrages avec un compteur de quiz **réellement disponibles**. Ne présente pas 150 questions en brouillon comme jouables.
- Réutilise le moteur existant `src/lib/quiz.ts` et `src/components/quiz-game.tsx` autant que possible, sans casser leur contrat ; privilégie une couche de données V1.2 distincte `src/data/quiz-v1.2/` avec validation Zod. Conserve les 10 questions de `src/data/quiz-v1.1.json`.
- Chaque quiz publié : 10 questions, 4 gros choix pour les questions simples, choix multiples explicites si nécessaire, 1 point pour sélection exacte, progression, correction après validation avec source arabe/lien, résultat sur 10, récapitulatif et Rejouer.
- Design cohérent avec le site, mobile-first, accessible clavier/lecteurs d'écran, RTL pour l'arabe, liens `noopener noreferrer`, aucune dépendance DB, aucun compte, chrono, tracking, ou appel externe pour jouer.
- Corrige éventuellement la description SEO historique `src/app/quiz/page.tsx` qui mentionne encore « deux questions », mais n'altère pas le fonctionnement.

## 5. Validation et livraison

Ajoute des tests de validation éditoriale (IDs uniques, source primaire requise, dix questions publiées par quiz, aucune réponse orpheline, aucun brouillon jouable), des tests unitaires score/filtrage, E2E desktop/mobile/clavier et vérification du quiz V1.1. N'affaiblis aucun test existant.

Exécute, avec un environnement sûr : `npm ci`, `npm run db:generate`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. Pour `npm run test:integration`, utilise **exclusivement** une base PostgreSQL jetable dont le nom contient `maktaba_test` ; ne touche jamais à Neon Production. Rapporte les commandes non exécutées au lieu d'affirmer qu'elles passent. La CI existante teste également PostgreSQL 17 et Chromium/Firefox/WebKit.

Livrables attendus : code et tests sur une branche dédiée, documentation V1.2 actualisée, inventaire par livre (`published`/`draft`, nombre de questions sourcées, URLs primaires vérifiées), rapport de non-régression (routes boutique, quiz historique, stock/paiement), captures responsive, liste des risques et **PR non fusionnée**. Ne déploie pas en Production et ne fusionne pas sans mon accord.

**Commence par me présenter ton audit de l'état actuel et un plan court. Puis implémente de manière incrémentale. Si les sources arabes manquent, livre le moteur, les pages et les brouillons propres, mais pas de faux quiz publiés.**
