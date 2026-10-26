# Recette V1.4 — tests, preuves et refus de régression

## Tests unitaires et contrat de sélection

Ajouter des tests explicites, déterministes, avec RNG injecté et fixtures synthétiques (ne pas créer de fausses questions de fiqh dans la banque réelle).

1. Pool de 9 : renvoie `[]` et signale « en préparation ».
2. Pool de 10 : 10 IDs distincts, pas de perte, comportement des quiz V1.3 conservé.
3. Pool de 200, 201, 610, 1 000 : renvoie exactement 10 IDs uniques, toutes issues du pool (pas de limite 200 héritée du tirage par livre).
4. Aucun doublon dans les dix, aucun doublon de l'ensemble global; ID dupliqué doit provoquer une erreur claire, pas de suppression silencieuse.
5. Cas RNG aux bornes (0, 0.999999...), générateur invalide (<0, ≥1, NaN) rejeté.
6. La sélection n'altère jamais l'ordre ni les objets du pool initial.
7. Test de propriété statistique raisonnable sur 10 000 simulations synthétiques : la première place et le taux d'inclusion ne doivent pas être biaisés; seuil probabiliste non fragile ou bien preuve via tests déterministes des permutations sur petit N.
8. Test d'intégration du pool agrégé : utiliser **tous les livres `available`** et seulement les questions publiées, avec **au moins un ID provenant de chaque niveau** dans le pool total (ne pas imposer ce résultat dans chaque tirage de dix). Vérifier les comptes par livre et l'absence d'archive comptée deux fois.
9. Une nouvelle question publiée dans un pool source synthétique devient automatiquement accessible au global sans modifier le code de tirage.
10. La validation et les sources existantes restent immuables; vérifier les empreintes V1.2, V1.3 et Ultime déjà testées.

## Tests d'intégration serveur

- Appeler la nouvelle server action sans paramètre : elle renvoie uniquement 10 questions admissibles; la contrôler avec mocks du pool global.
- Aucun ID choisi dans un brouillon, un ouvrage indisponible ou une banque rejetée.
- Plusieurs appels indépendants n'utilisent pas un cache figé; la sortie change selon le RNG injecté. Ne jamais rendre obligatoire « zéro question commune entre deux parties ».
- Aucune méthode POST ne modifie les prix, stocks, paniers, commandes ni table Prisma.
- Compteur global = nombre d'IDs admissibles; ne confond pas le compteur de livres avec celui des questions.

## E2E Playwright

Sur Chromium, WebKit, Firefox et mobile, selon la matrice du repo :

- `/quiz/niveaux` affiche une carte « Mode aléatoire » avant les cinq parcours; les liens existants restent accessibles.
- Ouvrir `/quiz/aleatoire`, lire la présentation et lancer le quiz. Une partie de dix questions différentes s'affiche; le score démarre à 0/10.
- Répondre aux dix : feedback, explication et lien vers passage arabe après validation, score correct au résultat.
- `Rejouer` génère une nouvelle tentative, réinitialise les réponses, le score et l'index sans fuite d'état.
- Simuler un chargement long, un double-clic et une erreur réseau : ne pas commencer deux tentatives ni laisser une interface bloquée; message accessible.
- Rendu arabe RTL, clavier, axe-core, focus et contrastes inchangés.
- Les anciens `/quiz/niveaux/[niveau]/[ouvrage]` et `/quiz` (redirection 308) fonctionnent comme avant. Les cinq niveaux sont visibles. URLs inconnues : 404 conformément au code courant.
- Aucune question en brouillon dans le rendu initial HTML/RSC de `/quiz/aleatoire` ou de la liste des niveaux.

## Commandes sur dépôt réel

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Les tests d'intégration BD, si nécessaires, se font **uniquement sur PostgreSQL local isolé** (base à nom explicite `maktaba_test_*`) et jamais sur Neon Production. Le mode global ne requiert pas de migration BD, donc ne pas créer de tâche destructrice. Rapporter chaque commande et son statut réel; ne jamais affirmer un succès non exécuté.

## Livrables d'acceptation

- PR non fusionnée depuis la dernière branche `main`.
- Diff limité aux composants de quiz, accès global et tests/docs; aucune modification commerciale ni migration.
- Capture(s) desktop et mobile de la carte, de la page aléatoire, d'une correction et du score sur 10.
- Tableau « questions par niveau/livre » recalculé à partir de la source serveur au dernier HEAD; nombre global exact (sans hardcode).
- Compte rendu des tests, limites éventuelles et confirmation que Production n'a pas été déployée.
