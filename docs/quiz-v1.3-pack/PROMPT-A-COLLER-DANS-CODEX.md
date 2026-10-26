# PROMPT CODEX — Maktaba Malikiyya V1.3, RECHERCHE RÉELLE JOINTE

Je te donne un **seul ZIP** : l'archive de la branche `docs/recherche-edito-quiz-v1.3-20261026`, reprenant le projet GitHub Maktaba Malikiyya (https://github.com/mehdi-pro-test/maktaba-malikiyya), la V1.2 et le lot de recherche éditoriale V1.3.

**TA MISSION EST UNIQUEMENT TECHNIQUE. INTERDICTION DE RECHERCHER, INVENTER OU RÉDIGER DES QUESTIONS-RÉPONSES RELIGIEUSES.**

## 1. Auditer le dépôt et le contenu de mon ZIP

- Lis `AGENTS.md`, les documents `docs/quiz-v1.3-pack/`, surtout `README-COMMENCER-ICI.md`, `03-TIRAGE-ALEATOIRE.md`, `05-TESTS-ET-NON-REGRESSION.md` et `recherche-v1.3/README.md`.
- Récupère **le dernier `origin/main`**, pas seulement le commit ancien `c25a20696b6c44ba6e7ba0cac25ba7e9cd640980`; compare tous les développements V1.2 récents.
- Crée une branche `feat/quiz-v1.3-tirage`; pas de travail directement sur `main`.
- Vérifie les **150 QCM V1.2 publiés** : 15 livres avec 10 questions chacun dans `src/data/quiz-v1.2/research.json` et leurs 150 validations indépendantes dans `reviews.json`.
- Vérifie les **90 nouvelles questions V1.3** effectivement présentes, 30 par matn débutant, dans `docs/quiz-v1.3-pack/recherche-v1.3/`. Chaque candidat possède 4 choix, réponse, explication et référence arabe. **Ce sont des BROUILLONS NON APPROUVÉS**, pas 90 nouveaux jeux déjà publiables.
- Inventaire honnête : 40 rédigées par ouvrage débutant (10 V1.2 + 30 V1.3), mais **seules les 10 V1.2 sont publiées**. Manquent 60 questions nouvelles par matn débutant, soit 180 pour arriver à 100 sur chacun. Ne prétends jamais que le ZIP contient 300 questions débutantes publiées.

## 2. Construire le moteur d'échantillonnage

- Lors du lancement d'une **nouvelle partie** d'un ouvrage, sélectionner aléatoirement **10 questions distinctes sans remplacement** parmi le pool **effectivement approuvé** de cet ouvrage.
- Si le pool contient 100 questions validées ultérieurement, sélectionner uniformément 10 parmi 100; s'il en contient 10, garder la compatibilité V1.2 (10 parmi 10, ordre éventuellement mélangé); s'il en contient moins de dix, afficher « En préparation ».
- La sélection reste **immuable pendant une tentative**, corrections incluses; un `rerender` ne doit pas modifier le tirage.
- Le bouton « Rejouer » génère un nouveau tirage indépendant (des recoupements entre parties restent possibles).
- Score sur 10, explications, citations arabes, liens sûrs HTTPS, RTL, responsive, accessibilité clavier/lecteur d'écran.
- Aucun contenu brouillon ni bonne réponse des ouvrages indisponibles dans leur HTML/RSC ou leur payload.
- Utiliser un générateur d'aléa injectable pour des tests reproductibles; ne pas rendre le quiz aléatoire définitivement au build.
- Prévoir une architecture d'extension **additive** permettant d'importer des lots futurs de 100 questions par ouvrage, avec déduplication et revue SHA distincte.
- Les 90 questions `research-draft` du pack peuvent servir aux tests du parseur/editorial import et sont conservées comme objets éditoriaux lisibles, mais **NE DOIVENT PAS DEVENIR `published` SANS MON ACCORD ET UNE REVUE SPÉCIALISÉE**.
- Ne pas altérer le SHA canonique de la banque V1.2 (les 150 approbations y sont rattachées), et ne pas écrire sur la base Neon Production.

## 3. Protection de la V1.2 et de la boutique

- Le quiz classique **a été retiré** sur la dernière version du site : `/quiz` redirige en 308 vers `/quiz/niveaux`. Conserver menu, accueil et pied de page conduisant aux niveaux.
- Préserver les quinze ouvrages, niveaux, URL et résultats.
- Ne modifier ni prix ni stocks courants, ni panier, ni mini-panier, ni frais, ni commande invitée, ni Stripe TEST/webhooks, ni Resend/outbox, ni Prisma/migrations, ni sauvegardes, ni CI.
- Ne pas réinitialiser la BD; migrations additives éventuelles uniquement après justification explicite, jamais exécutées en Production.

## 4. Tests et livrables

- Exécuter format, lint, TypeScript, unitaires, build, Playwright multi-écrans, et tests PostgreSQL uniquement sur une BD locale dédiée si nécessaires.
- Couvrir les sélections 10/10, 10/100 (avec fixtures synthétiques clairement identifiées), absence de doublons, rejouer, stabilité du tirage, score, RTL/références, refus des brouillons, non-régression boutique.
- Fournir tableau des questions réellement enregistrées/validées/jouables par ouvrage; signaler **180 nouvelles questions débutantes encore à rédiger éditorialement**.
- Ouvrir une PR **non fusionnée** et ne pas déployer sans validation.

Commence par l'audit du dernier dépôt, lis les fichiers exacts du ZIP, puis intègre techniquement la fonction de tirage. **Si l'on te demande 100 questions réellement publiées par matn à ce stade, signale le manque de données éditoriales plutôt que d'inventer.**
