# PROMPT POUR CODEX — MAKTABA MALIKIYYA V1.4 (ADMIN UNIQUE)

Tu vas réaliser la **V1.4 de mon site Maktaba Malikiyya** : un espace administrateur sécurisé, moderne et entièrement fonctionnel pour **un seul compte propriétaire**. Je te fournis **un ZIP documentaire unique** contenant le cahier des charges et tous les détails d'architecture, UX, sécurité et tests.

GitHub : https://github.com/mehdi-pro-test/maktaba-malikiyya
Production actuelle : https://maktaba-malikiyya.vercel.app
Dernier SHA `main` observé au moment de la préparation : `d29c6dfe7862fcd8b34ef00b7543512914bc4d7d` (il peut avoir avancé).

## Étape 0 — Audit puis branche

1. Clone/récupère le **dernier** `origin/main`. **Ne jamais modifier directement `main` ni déployer.** Crée une branche `feat/v1.4-admin-unique`.
2. Lis **en entier** `AGENTS.md`, les docs locales Next 16 dans `node_modules/next/dist/docs/`, puis **TOUS** les fichiers du ZIP, dans l'ordre de `00-COMMENCER-ICI.md`.
3. Vérifie le schéma Prisma actuel, les flux commande/Stripe/stock, le catalogue, les couvertures, les quiz JSON additionnels et le tirage global. Fournis un court audit initial (fichiers et points de risque) puis passe à l'exécution.

## Mission P0 — vrai back-office, un seul admin

**A. Sécurité :** créer `/admin/connexion` et des routes `/admin/*` privées, avec un **seul propriétaire autorisé**, MFA obligatoire via solution d'auth maintenue compatible Next.js 16, sessions sécurisées, logout/révocation, bootstrap privé, protections anti-bruteforce et CSRF. Ni signup public ni rôles multiples ni comptes fictifs. **Toutes les lectures et écritures sont vérifiées côté serveur**, pas seulement le layout. Ne jamais hardcoder l'email, le mot de passe ou des clés.

**B. Dashboard :** KPIs de commandes et ventes clairement marqués Stripe **TEST**, commandes à préparer, alertes stock réel, dernières activités, navigation latérale claire. Vraies données DB avec états vides honnêtes, responsive mobile.

**C. Commandes :** liste paginée, filtres, recherche, détails client/produits/total, préparation, expédition, livraison, suivi et historique. **Séparer le statut de paiement Stripe `Order.status` du statut logistique** : l'admin ne peut jamais se déclarer « PAID ». Pas de suppression de transaction, pas de changement des `OrderItem` historiques. Éviter tout remboursement automatique non explicitement autorisé.

**D. Stocks :** montrer physique, réservé, disponible ; entrée/correction/sortie justifiée, suivi des mouvements, alertes bas stock. Réutiliser **`commerceTransaction`**, verrou `pg_advisory_xact_lock(741825)`, préserver les réservations existantes et refuser un ajustement sous la quantité réservée. Journal transactionnel et idempotence pour chaque mutation.

**E. Catalogue :** CRUD de livres (créer brouillon, modifier, publier, archiver), titre FR/AR, description FR (+ AR facultative), catégorie, prix en centimes, couverture téléversée durablement sur stockage objet autorisé, photo prévisualisable ; quantité uniquement via les mouvements de stock. **Conserver IDs et slugs des livres vendus** et les historiques de commande. Faire en sorte que la photo choisie en admin ne soit pas masquée par `src/lib/media.ts` / `cover-references.json`. Aucun upload sur disque éphémère Vercel. Contrôler formats, taille et droits de réutilisation.

**F. Quiz :** interface pour rechercher des questions par niveau/ouvrage, ajouter, éditer les quatre propositions/la bonne réponse/l'explication/la citation arabe/l'URL, prévisualiser, publier et archiver. Le propriétaire est l'unique validateur éditorial ; ne pas fabriquer une vérification religieuse indépendante. **Ne pas modifier les JSON historiques et leurs empreintes/approbations** : ajouter une couche DB d'overrides versionnés + nouvelles questions et archives. Une ancienne question éditée conserve son ID et son ancienne révision jusqu'à la nouvelle publication. Les modifications publiées doivent être visibles **sans redéploiement** dans les quiz par ouvrage ET `/quiz/aleatoire`, tout en respectant les exclusions `quiz-global-quality.json`, les sources RTL et le tirage 10 questions distinctes. Les brouillons ne sont jamais transmis aux visiteurs.

**G. Journal :** historique consultable des mutations admin : commande/logistique, prix, couverture, stock, quiz ; acteur, date et modifications expurgées, sans secrets ni données personnelles superflues.

## Contraintes absolues de non-régression

- Préserver site public, navigation, accueil, livres, catégories, recherche et panier, livraison FR/Europe, checkout invité, webhooks Stripe TEST et leur idempotence, réconciliation, Resend/outbox, sauvegardes, déploiements et configuration Vercel.
- Conserver les quinze quiz, leurs données exactes, le mode global, scores, « Rejouer », références arabes, et absence de quiz classique.
- Aucune donnée de commande, stock ou question supprimée par la migration. Les mises à jour de catalogue ne réécrivent pas les commandes antérieures.
- Toutes les migrations Prisma sont **additives**, versionnées, approuvables ; ne change pas les anciens SQL/empreintes `_MaktabaMigration`. **Ne lance aucune migration sur Neon Production** et n'active pas l'admin sur Production avant mon accord.
- Stripe reste **TEST seulement**, ne jamais basculer en live.
- Si une dépendance externe est nécessaire (auth MFA, stockage images), prépare les variables d'environnement et instructions de configuration, mais ne devine ni ne demande de commiter les secrets. Si elle n'est pas connectée, **ne simule pas** la fonctionnalité comme opérationnelle ; laisse-la bloquée et indique précisément ce qu'il manque.

## Méthode de développement

Travaille par étapes testables : auth + modèle DB → commandes + suivi → stocks → catalogue + médias → quiz avec overlay et global → audit/UX/régression. Construis de vrais formulaires et actions sécurisés, pas seulement une interface statique. Réutilise les composants et l'architecture existants. Évite de multiplier les dépendances ou les migrations non justifiées.

## Validation obligatoire

Exécute `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`, et les intégrations uniquement sur DB isolée et jetable. Vérifie : refus d'accès admin anonyme et sans MFA, sécurité des Server Actions, transitions de commandes, concurrence du stock avec réservation, upload réel en stockage persistant, édition/publication/archivage de questions sans briser les banques JSON et le quiz aléatoire global, préservation des 15 quiz et des fonctions commerciales. Aucun skip/suppression de test pour faire vert.

## Livrables finaux

1. Une **PR GitHub non fusionnée** depuis la branche feature.
2. Une interface admin moderne fonctionnelle (ordinateur et mobile), un compte propriétaire unique protégé par MFA, et des écrans réellement reliés à la BD.
3. Migrations additives, scripts réversibles/rollback et documentation de configuration auth/stockage sans les secrets.
4. Rapport réel des tests exécutés et non exécutés, captures pertinentes, checklist sécurité et non-régression.
5. Liste des éventuels blocages externes ou fonctionnalités non terminées — **ne pas affirmer que tout marche si ce n'est pas vérifié**.

**Ne fusionne pas la PR, n'exécute aucune migration de Production, ne déploie pas et ne change pas le mode Stripe TEST sans mon autorisation explicite.**
