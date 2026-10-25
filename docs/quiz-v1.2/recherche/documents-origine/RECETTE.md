# Recette, tests et stratégie de livraison V1.2

## Avant toute modification

- Vérifier `git status`, `git log -1` et le HEAD actuel de `origin/main`. Ne pas travailler sur `main` ni supposer que le snapshot du 25/10/2026 est encore le plus récent.
- Lire `AGENTS.md`, `docs/v1.1/FINALISATION.md`, les tests existants et la documentation Next locale.
- Capturer le comportement actuel de `/quiz` (10 questions), `/`, `/livres`, `/panier` et les fiches ; comparer avant/après.
- Si des commits plus récents existent, rebaser les docs et le développement **sans écraser leurs changements**.

## Tests à créer

1. Catalogue : exactement 15 ouvrages, cinq parcours, slugs uniques, 3 débutants ; brouillons non jouables.
2. Publication : 10 questions par ouvrage publiable, sources primaires vérifiées obligatoires, ID unique, réponse correcte incluse, sélection multiple exacte, ordre stable, zéro doublon.
3. UX : pages `/quiz/niveaux`, niveau et livre ; états `draft` / `review` / `published` ; 404 des routes inconnues.
4. Jeu : score 0/10, 5/10, 10/10 ; erreur, succès, Rejouer, progression, validation désactivée si sélection incorrecte en nombre, correction affichée seulement après validation.
5. Accessibilité : mobile et desktop, clavier, focus, RTL arabe, lien source HTTPS, absence de défilement intempestif et `prefers-reduced-motion`.
6. Régression : `/quiz` affiche toujours les 10 questions V1.1 ; home n'annonce pas les 150 questions en brouillon ; panier, checkout, stocks, catégories, Akhdari et confirmation intacts.
7. Sécurité : aucun secret dans le navigateur, pas de script dans les champs source, liens sortants avec `rel="noopener noreferrer"`, aucun appel DB ou externe pour jouer.

## Commandes de validation

```bash
npm ci
npm run db:generate
npm run format:check
npm run lint
npm run typecheck
npm test
# UNIQUEMENT avec une base éphémère dont le nom contient maktaba_test :
DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test npm run db:migrate
DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test npm run test:integration
npm run build
npm run test:e2e
```

Le CI `.github/workflows/ci.yml` prépare PostgreSQL 17 et les trois navigateurs ; les tests locaux d'intégration sont **destructifs** et doivent être isolés de Neon Production/Preview. Ne pas injecter les secrets Stripe/Resend réels dans les tests.

## Contrôle avant PR

- Diff minimal et expliqué, pas de suppression des tests historiques.
- Pas de changement `prisma/migrations` ni du commerce, sauf autorisation motivée.
- Rapport des commandes exécutées et de celles non exécutées, avec erreurs et limites.
- Captures desktop/mobile, inventaire des quiz publiés vs brouillons, liens de sources vérifiés.
- PR vers `main` **sans fusion automatique**, validation humaine du contenu savant et de la non-régression.

## Publication / retour arrière

Aucune migration SQL n'est nécessaire pour un quiz statique. Déployer en Preview isolée, contrôler les URLs, les scores et la boutique, puis soumettre la PR. Ne jamais lancer de migrations ou de seed sur Production pour ce changement sans besoin avéré et accord explicite. Pour revenir en arrière, utiliser un artefact de déploiement connu et conserver les données en place ; ne pas restaurer une base Neon de manière destructrice. Les limites V1.1 sur Stripe/Resend/maintenance demeurent tant que vérifiées autrement.
