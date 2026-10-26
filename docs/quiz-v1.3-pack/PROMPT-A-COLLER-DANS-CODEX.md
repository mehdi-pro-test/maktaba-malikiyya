# PROMPT UNIQUE CODEX — Maktaba Malikiyya V1.3

Tu travailles sur **le dépôt GitHub existant**, pas sur un nouveau site : https://github.com/mehdi-pro-test/maktaba-malikiyya.

Je te fournis **une seule archive** : le ZIP de la branche documentaire `docs/pack-unique-quiz-v1.3-20261026`. Il contient **l'intégralité du code à la date du snapshot**, 150 questions-réponses V1.2 complètes dans `src/data/quiz-v1.2/research.json`, 150 validations dans `src/data/quiz-v1.2/reviews.json`, un export lisible `docs/quiz-v1.3-pack/QUESTIONS-REPONSES-V1.2-150.csv`, et la documentation V1.3 sous `docs/quiz-v1.3-pack/`.

**Ta mission est UNIQUEMENT technique.** Tu ne dois **jamais** rédiger, chercher, inventer ou modifier doctrinalement une question/réponse/source. L'équipe éditoriale fournit le contenu religieux séparément; seuls les fichiers effectivement présents comptent.

## Audit obligatoire

1. Lis `AGENTS.md`, les guides locaux Next.js 16, `docs/quiz-v1.3-pack/README-COMMENCER-ICI.md`, `03-TIRAGE-ALEATOIRE.md`, `05-TESTS-ET-NON-REGRESSION.md`, et toute la documentation jointe.
2. Récupère le **tout dernier HEAD de `main`**, qui peut être plus récent que le snapshot `c25a20696b6c44ba6e7ba0cac25ba7e9cd640980`. Crée `feat/quiz-v1.3-tirage-aleatoire` depuis la vraie dernière version, en intégrant la documentation utile sans écraser d'autres commits. Ne modifie jamais directement `main`.
3. Vérifie le nombre réel de questions : **15 livres × 10 = 150** sur ce snapshot. Vérifie leurs schémas, 4 choix, bonnes réponses, références, status et validations. Les 150 réponses et leurs sources doivent rester intactes.
4. **Blocage éditorial explicite :** le lot annoncé de 300 questions débutantes (3 × 100) n'a PAS été joint à cette archive. Il n'existe donc **aucune banque de 100 effectivement disponible dans ce ZIP**. Ne la reconstruis pas, ne recycle pas des QCM existants, ne duplique pas des questions, et ne prétends pas livrer 300 ou 1 500 questions. Note cette absence dans ton rapport.

## Mission V1.3 : préparer un système de tirage réel

- Un visiteur choisit `/quiz/niveaux` puis l'un des 15 ouvrages.
- Chaque **nouvelle partie** sélectionne uniformément au hasard **exactement dix IDs distincts sans remise** parmi les questions **publiées et autorisées** du livre, en utilisant un Fisher–Yates sur copie ou un équivalent testable.
- Une fois la partie commencée, les dix questions et leur ordre restent stables durant la réponse, correction, progression, retour et résultat; ils ne changent pas sur un rerender/hydration. `Rejouer` crée une tentative différente et **relance le tirage** (un chevauchement entre deux tentatives reste possible).
- Si le livre ne contient que **10** questions admissibles, conserver ses dix questions actuelles sans annoncer `10 parmi 100`. Si **100** questions distinctes et validées sont importées ultérieurement, le même moteur devra tirer 10 parmi ces 100. Si moins de dix, afficher une indisponibilité honnête.
- Score sur 10, quatre choix, feedback, textes et citations arabes, références HTTPS après validation et dans le récapitulatif, RTL et accessibilité mobile/clavier.
- Protéger le chargement côté serveur et éviter d'envoyer au navigateur les réponses et questions d'ouvrages indisponibles. Pas de sélection figée au build Next.js. Un tirage aléatoire testable est injecté via une source d'aléa maîtrisable dans les tests.
- Préparer un adaptateur **additif** pour de nouvelles banques de 100 dans `src/data/quiz-v1.3/` quand le fichier éditorial authentique sera fourni; garder la revue V1.3 séparée, liée à un SHA-256 du nouveau contenu. Aucun statut `research_verified` ne vaut `published`.
- Préserver la V1.2 et les relectures signées sur son empreinte canonique; ne pas modifier leurs données pour passer de 10 à 100.
- La base existante n'a pas besoin d'être migrée pour préparer le tirage. Si tu juges qu'un stockage PostgreSQL/Prisma dédié est nécessaire pour les 1 500 questions futures, **propose d'abord** un schéma séparé et une migration additive; ne l'applique jamais à Production et ne crée pas de dépendance bloquante pour les quinze quiz actuellement en ligne sans validation.

## Non-régression absolument prioritaire

- **Ne recrée pas** le quiz classique V1.1 : à la demande du propriétaire, il a été supprimé et `/quiz` redirige vers `/quiz/niveaux`. Le header, l'accueil et le pied de page doivent continuer à mener aux niveaux.
- Préserve les quinze quiz V1.2, leurs URL et leurs scores, ainsi que les références et le processus de revue.
- Préserve Accueil / Livres / Coran / Hadith / Fiqh / Panier, identifiants et slugs, prix et stocks **actuels**, Akhdari actif (prix 15 € et stock initial 15), frais FR/Europe, panier `maktaba-cart`, mini-panier, commande invitée, Stripe exclusivement TEST, signatures de webhook/idempotence, Resend/outbox, bases Neon, scripts de migrations, sauvegardes, workflows CI et Vercel. Aucun reset, aucun secret commité, aucun paiement live.
- Ne supprime, n'affaiblis, ne skippe aucun test pour obtenir un résultat vert.

## Vérification et rendu

1. Ajoute des tests robustes pour tirage de 10 sur 10/100, absence de doublons, stabilité durant la partie, replay, score 0/10–10/10, contrôle des sources/status, protection HTML/RTL, desktop/mobile/clavier, et régression des quinze ouvrages.
2. Exécute réellement `npm ci`, format, lint, typecheck, tests unitaires, build et E2E. Les tests PostgreSQL **destructifs** ne s'exécutent que sur une DB **jetable** dont le nom contient `maktaba_test`, jamais Neon Production. Signale toute commande non exécutée.
3. Fournis audit du pool par ouvrage, nombre d'items existants, nouveaux réellement importés (ce sera **zéro** tant que le fichier de 300 manque), nombre approuvé/jouable et anomalies.
4. Ouvre une **PR non fusionnée** depuis la branche de fonctionnalité. Pas de déploiement Production, pas de migration ni de fusion sans mon accord.

**Commence par audit/diff/plan bref puis réalise l'implémentation uniquement avec les données existantes. Si on te demande de livrer 100 questions par matn alors que le lot 300 est absent, déclare le blocage éditorial au lieu d'inventer des questions.**
