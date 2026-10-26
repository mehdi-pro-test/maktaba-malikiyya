# Maktaba Malikiyya — Mode aléatoire global (évolution Quiz V1.4)

**Pack documentaire uniquement : aucun code applicatif ni donnée religieuse modifié.**

## Objectif

Ajouter au catalogue des quiz une entrée **« Mode aléatoire — Tous les ouvrages »**. En lançant ce mode, le joueur obtient **exactement 10 questions distinctes, tirées uniformément parmi toutes les questions effectivement publiées/autorisées** de l'ensemble des quinze ouvrages et de tous les niveaux. Il conserve le score /10, les choix, explications et références arabes. **Rejouer** renouvelle le tirage global.

Le mode est **additionnel** : tous les parcours et quiz par ouvrage continuent de fonctionner de manière identique. L'accès principal « Quiz » conserve sa destination `/quiz/niveaux`. Le quiz classique V1.1 supprimé ne doit pas être réintroduit.

## Livraison et usage

1. Fournir à Codex **ce ZIP documentaire unique** et lui copier le texte de `05-PROMPT-CODEX.md`.
2. Codex récupère le dernier `origin/main` du dépôt `mehdi-pro-test/maktaba-malikiyya`, lit `AGENTS.md` et les guides Next 16 locaux, crée une branche de fonctionnalité dédiée et intègre **la seule fonctionnalité du mode global**.
3. Exécuter les tests et fournir une PR non fusionnée; **aucun déploiement ni fusion** sans accord du propriétaire.

## Ce que contient le ZIP

- `01-CADRAGE-FONCTIONNEL.md` : parcours utilisateur, règles du tirage.
- `02-ARCHITECTURE-TECHNIQUE.md` : points précis d'intégration au code actuel, sécurité serveur, limite 200 actuelle.
- `03-RECETTE-TESTS.md` : critères d'acceptation, tests unitaires et end-to-end.
- `04-NON-REGRESSION.md` : limites du périmètre, garde-fous boutique et éditoriaux.
- `05-PROMPT-CODEX.md` : instruction prête à coller à Codex.
- `06-ETAT-DU-DEPOT.md` : observations sourcées sur le dernier commit consulté.
- `MANIFEST.json` : inventaire du pack.

**Important : ce ZIP ne contient pas de nouvelles questions-réponses, et il n'en faut aucune pour cette évolution.** L'application doit agréger les banques déjà accessibles côté serveur. Il n'est pas nécessaire de migrer Prisma pour cela.
