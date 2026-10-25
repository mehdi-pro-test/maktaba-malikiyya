# PROMPT À COPIER-COLLER DANS CODEX — MAKTABA MALIKIYYA V1.1

Tu es Codex. Interviens comme équipe senior (Product Owner technique, UX/UI, Full Stack, QA, DevOps) pour livrer **la V1.1 du projet existant Maktaba Malikiyya**.

**Dépôt existant :** https://github.com/mehdi-pro-test/maktaba-malikiyya  
**Site actuel :** https://maktaba-malikiyya.vercel.app

## Avant toute modification

1. Analyse le dépôt, `AGENTS.md`, README, Prisma, catalogue, panier, checkout Stripe, tests, CI et docs.
2. Lis **l'intégralité de la documentation de ce dossier V1.1** (`README.md`, `01-...` à `08-...`, `data/*`). Considère la V1 comme un socle à **préserver**, sans refonte ni écrasement des commandes ou stocks.
3. Synchronise ta copie locale avec GitHub, puis crée la branche `feat/v1.1-livres-quiz` depuis `main`. Ne modifie aucun autre dépôt. Ne pousse pas directement sur main.
4. Avance de manière autonome ; demande confirmation uniquement sur un choix bloquant ou une action sensible. Ne devine jamais les données commerciales manquantes.

## Fonctionnalités à développer

### A. Nouvelle navigation et catégories

- Menu principal : **Accueil | Livres (sous-menu : Tous les livres, Coran, Hadith, Fiqh) | Quiz | Panier**.
- « Livres » est le **parent** ; **Coran, Hadith et Fiqh sont des sous-catégories**, extensibles à d'autres disciplines plus tard.
- Routes `/livres`, `/livres/coran`, `/livres/hadith`, `/livres/fiqh`, conserver `/livres/[slug]` et rediriger `/coran`, `/hadith` pour compatibilité.
- Ajouter des breadcrumbs et catégories navigables sur ordinateur et mobile.

### B. Catalogue

- Conserver **Coran (Moshaf) à 10 €** et **Sahih al-Bukhari à 100 €**, et leur stock réel actuellement en base sans le réinitialiser.
- Ajouter dans Fiqh **Mukhtasar al-Akhdari (مختصر الأخضري)** avec page produit, mais **prix, stock et édition inconnus** : créer un statut brouillon/« Bientôt disponible », non commandable côté UI ET côté API. Ne mets jamais de faux prix, y compris 0 €.
- Utilise les **références de vraies couvertures** trouvées en ligne dans `03-CATALOGUE-ET-COUVERTURES.md` et `data/cover-references.json`. Prépare les images locales optimisées et les fiches, en conservant la traçabilité source. IMPORTANT : les droits de réutilisation et la correspondance des éditions ne sont pas confirmés ; **ne publie pas de photos tierces sur le site public sans permission ou droit de réutilisation établi**. En attendant, garde une image de repli SVG et livre un registre clair des couvertures candidates afin que nous puissions valider les vrais visuels.

### C. Quiz (UI inspirée de la dynamique de GeoGuessr)

- Ajouter `/quiz` et une section d'accroche depuis l'accueil.
- Interface de jeu originale dans les couleurs de la Maktaba : très **gros boutons/cartes**, état sélectionné clair, barre de progression, score, corrections, écran final et bouton « Rejouer », mobile first, accessible clavier.
- Le Quiz a **10 slots éditoriaux** mais le Product Owner ne donne que 2 questions pour l'instant. Utilise exactement les données validées dans `data/quiz-v1.1.json` : Q1 imams des quatre écoles (4 bonnes réponses), Q2 deux types de tahara (al-hadath et al-khabath). **Les 8 slots manquants restent draft, invisibles et non notés.** Affiche honnêtement « 2 questions disponibles » et prévois la complétion ultérieure. Ne crée pas 8 questions fictives.
- Ne copie ni le logo, ni la marque, ni les ressources graphiques ou l'interface exacte de GeoGuessr. Reprends seulement le principe d'interactions ludiques par choix visuels.

### D. Expérience d'achat

- Mini-panier accessible qui s'ouvre après ajout, avec quantités, sous-total et CTA.
- Indicateur du seuil de livraison offerte **uniquement France métropolitaine** : 4 € sous 50 € ; gratuit dès 50 €. Europe autorisée = 20 € forfaitaires et **jamais** livraison offerte.
- Améliorer clarté confirmation commande et statut de l'envoi e-mail (pas de faux envoi).
- Garder paiement **Stripe TEST uniquement**, panier invité, webhooks signés et stock transactionnel existants.

## Exigences de qualité

- Faire les migrations Prisma/SQL **additives et sûres** suivant le runner du dépôt existant ; ne pas casser `Order`/`OrderItem`, ni réinitialiser stocks.
- Tests unitaires et intégration (quiz, catégorie parente et enfants, brouillon non commandable, prix/livraison, aucune régression paiement), E2E Playwright desktop/mobile et accessibilité.
- `npm ci`, lint, typecheck, tests, build, CI GitHub Actions et preview Vercel si autorisée. Si accès externe/secrets manquants, l'indiquer sans simuler le succès.
- Pas de clé live, pas de secret dans repo, pas d'upload de photos sans droits validés.
- Ne pas mélanger les variables ou bases Production/Preview ; protéger les commandes existantes.
- Committer, ouvrir une PR et résumer précisément livrables, commandes lancées, captures, tests réellement réussis, blocages, questions restant au PO.

## Definition of Done

V1 reste fonctionnelle ; navigation Livres/Coran/Hadith/Fiqh correcte ; Akhdari brouillon ; quiz 2 questions jouables/8 en attente ; mini-panier et seuil FR ; responsive ; sécurité et qualité vérifiées ; documentation et PR mises à jour. **N'annonce pas d'achat Stripe Vercel ou d'email réussi sans preuve d'un essai externe effectif.**

Commence par un audit bref du code existant et un plan de changements, puis passe à l'implémentation de manière autonome.
