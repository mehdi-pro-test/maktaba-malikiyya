# PACK UNIQUE — Reprise éditoriale Maktaba Malikiyya V1.3

**Archive unique du dépôt GitHub + documentation + banque de questions existantes et nouvelles.**

Cette branche documentaire est dérivée de `main@c25a20696b6c44ba6e7ba0cac25ba7e9cd640980`. Elle **n'altère aucun code applicatif, prix, stock, commande ni migration**; elle ajoute des fichiers sous `docs/quiz-v1.3-pack/`. Codex doit vérifier si `main` a reçu depuis des commits et partir de la dernière version.

## Quelles questions-réponses sont physiquement dans ce ZIP ?

| Bloc | Ouvrages | Questions complètes | Statut |
| --- | ---: | ---: | --- |
| Base V1.2 | 15 | **150** (10 par ouvrage) | publiées dans `src/data/quiz-v1.2/research.json`, revue propriétaire enregistrée |
| Reprise V1.3, lot A | 3 débutants | **90** (30 par ouvrage) | `research-draft`, non publiées, relecture spécialisée nécessaire |
| **Total rédigé dans l'archive** | 15 | **240** | 150 publiées + 90 candidats |
| Objectif de trois ouvrages débutants | 3 | **300** | actuellement 120 dont 90 candidats, reste 180 à rédiger |
| Objectif final quinze ouvrages | 15 | **1 500** | actuellement 240, reste 1 260 à rédiger |

**Ne jamais confondre contenu rédigé, contenu validé et contenu publié.** En particulier, **le ZIP éditorial de 300 questions précédemment annoncé n'a pas été retrouvé** : cette nouvelle recherche a réellement produit 90 nouvelles questions, pas 300. Les trente anciennes (10 × 3) + les 90 nouvelles représentent 120 questions, soit 40 par ouvrage débutant.

## Où sont les données ?

- `src/data/quiz-v1.2/research.json` : 150 anciens QCM complets (source de vérité applicative).
- `src/data/quiz-v1.2/reviews.json` : 150 avis enregistrés, portant sur l'empreinte V1.2.
- `docs/quiz-v1.3-pack/QUESTIONS-REPONSES-V1.2-150.csv` : export pour lire les 150 questions.
- `docs/quiz-v1.3-pack/recherche-v1.3/01-akhdari-30-candidats.json` : 30 nouveaux QCM d'Akhdari.
- `docs/quiz-v1.3-pack/recherche-v1.3/02-ibn-ashir-30-candidats.json` : 30 nouveaux QCM d'Ibn Ashir.
- `docs/quiz-v1.3-pack/recherche-v1.3/03-achmawiyya-30-candidats.json` : 30 nouveaux QCM d'al-'Achmawiyya.
- `docs/quiz-v1.3-pack/recherche-v1.3/QUESTIONS-REPONSES-NOUVELLES-90.csv` : export lisible de toutes les nouvelles questions-réponses.
- `docs/quiz-v1.3-pack/recherche-v1.3/MANIFEST-90-QUESTIONS.json` : état contrôlé des 90 questions.
- `docs/quiz-v1.3-pack/recherche-v1.3/README.md` : sources, vérifications et limites.

## Le développement Codex

Lire `PROMPT-A-COLLER-DANS-CODEX.md`, `01-ETAT-DU-REPO.md`, `02-DONNEES-IMPORT-ET-DEDUP.md`, `03-TIRAGE-ALEATOIRE.md`, `04-REVUE-ET-SOURCES.md`, `05-TESTS-ET-NON-REGRESSION.md` et `06-LIVRAISON.md`. Certains de ces documents antérieurs parlent d'un corpus V1.3 de 300 questions **qui n'est pas présent** et d'un ZIP externe : la vérité de ce pack est le tableau ci-dessus.

Ne pas demander à Codex de rechercher, inventer ou corriger le contenu religieux : il est intégrateur uniquement.

Le tirage doit être sans remise : 10 questions différentes tirées uniformément d'un pool d'au moins 10 questions **approuvées** de cet ouvrage, stable durant une partie et renouvelé lors de « Rejouer ». Actuellement 10 questions sont approuvées par ouvrage; ne jamais présenter les 90 nouveaux brouillons comme publiés.

## Non-régression

La V1.2 actuelle a supprimé l'ancien quiz classique : `/quiz` redirige vers les niveaux. Préserver les quinze pages quiz, l'accueil, la boutique, les frais de livraison, panier, Akhdari actuel, Stripe TEST, Resend, Neon/Prisma Production, workflows et sauvegardes. Aucune fusion/déploiement sans accord.
