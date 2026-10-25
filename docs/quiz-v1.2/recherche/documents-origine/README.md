# Pack Codex — quiz par niveau V1.2 (documentation, sans changement applicatif)

**État : cahier des charges et prompt de développement, pas livraison du contenu savant vérifié.**
**Base Git vérifiée :** `cad05a9cf7200ce11f5f51dcbe0d3610ef87434a` (`main`, V1.1 fusionnée le 25/10/2026).
**Branche de préparation :** `docs/quiz-v1.2-codex-20261025`.
**Dépôt :** https://github.com/mehdi-pro-test/maktaba-malikiyya

## Ce que contient l'archive

L'archive GitHub de cette branche est **l'intégralité du dépôt V1.1** (code, tests, scripts, migrations et documentation existants) **plus le dossier `docs/quiz-v1.2/`**. Aucun fichier applicatif, migration ou configuration de la boutique n'est modifié dans cette branche documentaire. Ce pack peut être ouvert dans Codex, mais il est préférable de travailler avec le dépôt Git pour conserver l'historique et les futures modifications de `main`.

- `PROMPT-CODEX.md` : consigne intégrale à copier dans Codex.
- `BASELINE-ET-ANTI-REGRESSION.md` : inventaire réel V1.1 et règles de protection.
- `SPECIFICATIONS.md` : parcours, UX, modèle et critères d'acceptation.
- `SOURCES-ET-REVUE.md` : protocole de recherche en arabe et revue doctrinale.
- `RECETTE.md` : tests, déploiement et rollback.
- `ouvrages.v1.2.json` : catalogue éditorial **en brouillon**, 15 ouvrages, 5 parcours, 10 questions prévues par ouvrage ; **aucune question inventée**.
- `question-exemple.draft.json` : contrat de données illustratif **non publiable**.

## Attention : recherche approfondie

La recherche approfondie en arabe demandée séparément a été lancée, mais **son rapport final n'a pas été récupéré ni intégré au moment de la constitution de ce pack**. Les 150 questions constituent une **cible**, pas 150 questions déjà rédigées ou vérifiées. L'utilisateur demande explicitement **3 quiz de 10 questions au niveau débutant** ; les autres 12 quiz de 10 sont un découpage proposé, à confirmer avec le contenu sourcé. Ne pas publier de questions sans preuve de source primaire. Les 10 questions V1.1 restent jouables, distinctes de ce nouveau parcours.

## Démarrage recommandé pour Codex

1. Lire `AGENTS.md`, ce README, les cinq documents du pack et `docs/v1.1/FINALISATION.md`.
2. Vérifier le HEAD réel de `main` ; **si des commits sont arrivés après la base du pack, rebaser sur le dernier `main` avant tout développement**.
3. Créer une branche de fonctionnalité depuis le HEAD le plus récent, sans toucher directement à `main`.
4. Implémenter le moteur et les pages avec des ouvrages `draft`/« À venir » ; intégrer ensuite les questions primaires vérifiées quand le rapport arabe sera disponible.
5. Exécuter les tests, produire un rapport de diff et ouvrir une PR. Aucune fusion ni migration Production sans validation humaine.

## Frontières

Aucun secret, aucune photo tierce, aucun contenu fictif publié, aucun paiement live. Ne pas confondre les catégories de livres du commerce avec les niveaux du quiz. Conserver les anciennes URLs, la boutique et les données.