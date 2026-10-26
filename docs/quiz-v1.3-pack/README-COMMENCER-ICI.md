# Maktaba Malikiyya — PACK UNIQUE Codex V1.3

**Commencer ici.** Archive de la branche documentaire `docs/pack-unique-quiz-v1.3-20261026`, basée sur `main@c25a20696b6c44ba6e7ba0cac25ba7e9cd640980` (26/10/2026). Le ZIP GitHub de cette branche contient la **copie complète du code du site** à cette révision, les **150 questions-réponses V1.2** et tous les documents du présent dossier. Ce pack ne change aucun fichier applicatif : les ajouts sont cantonnés à `docs/quiz-v1.3-pack/`.

## Contenu réel vérifié (ne pas confondre avec la cible)

- **150 questions-réponses réellement présentes** dans `src/data/quiz-v1.2/research.json`, réparties entre 15 ouvrages, 10 par ouvrage.
- Leurs **150 décisions de relecture enregistrées** dans `src/data/quiz-v1.2/reviews.json`, validées sur déclaration du propriétaire. Elles ne valent pas certification d'un relecteur religieux indépendant.
- Un **export CSV complet** des 150 questions en `docs/quiz-v1.3-pack/QUESTIONS-REPONSES-V1.2-150.csv` : texte de chaque question, 4 choix, réponse correcte, explication, citation arabe et URL source. Le **JSON original** demeure la source technique de référence.
- Les **33 notices de sources** figurent dans `research.json`.
- **Le lot éditorial V1.3 de 300 questions débutantes n'est PAS présent** : le ZIP indépendant annoncé dans l'espace Deep Research n'était pas accessible à la génération de ce pack. Aucune question V1.3 nouvelle n'a été reconstruite ou inventée. Pour obtenir effectivement 100 questions par ouvrage débutant, il faut importer ce **vrai fichier éditorial** (pas la description du fichier). Ne pas considérer une banque de 10 comme une banque de 100.
- **Objectif à terme : 1 500 questions (100 par ouvrage)**. Le pack ne contient aujourd'hui que les 150 questions V1.2. Les 1 350 questions additionnelles sont hors de cette archive.

## Documentation comprise dans le ZIP

- `PROMPT-A-COLLER-DANS-CODEX.md` : prompt autonome, prioritaire.
- `01-ETAT-DU-REPO.md` : photographie précise des routes, composants et décisions V1.2.
- `02-DONNEES-IMPORT-ET-DEDUP.md` : règles pour l'import éventuel de la banque éditoriale V1.3 et la déduplication.
- `03-TIRAGE-ALEATOIRE.md` : 10 questions distinctes par partie, 10/100 quand 100 existent, rejouer.
- `04-REVUE-ET-SOURCES.md` : bibliographie et barrières de publication.
- `05-TESTS-ET-NON-REGRESSION.md` : matrice de tests et de sécurité.
- `06-LIVRAISON.md` : état réel et règles d'acceptation.
- `MANIFEST-ET-ETAT-EDITORIAL.json` : comptes réels et statut du lot absent.
- `QUESTIONS-REPONSES-V1.2-150.csv` : consultation humaine facile des réponses et références.
- Et **tous les fichiers du dépôt** : code source, scripts, tests, SQL versionné, anciennes documentations.

**Priorité en cas de contradiction :** présent README + `PROMPT-A-COLLER-DANS-CODEX.md` + décisions récentes du propriétaire `docs/quiz-v1.2/NAVIGATION-QUIZ.md`; les autres textes peuvent décrire un état historique et parler d'un deuxième ZIP **qui n'est pas livré ici**.

## Procédure de passage à Codex

1. Télécharger **ce ZIP unique** puis le transmettre à Codex.
2. Copier le contenu de `PROMPT-A-COLLER-DANS-CODEX.md` dans Codex.
3. Codex doit lire les données existantes et adapter **le moteur** sans rédiger d'autres questions.
4. Si la banque V1.3 de 300 questions manque, Codex peut préparer le tirage dynamique avec les 10 questions V1.2 par ouvrage et les fixtures de test; il **ne doit pas prétendre** livrer 100/ouvrage en Production.
5. Une fois la vraie banque éditoriale de 300 questions disponible, la fusionner dans **une nouvelle version du même ZIP unique** et déclencher son import avec revue séparée. Ne pas publier sans approbation.

## Non-régression

Le site a déjà supprimé l'ancien quiz classique ; `/quiz` redirige vers `/quiz/niveaux` et le header mène aux niveaux. Ne pas le restaurer. Préserver intégralement boutique, Akhdari à 15€ / stock initial 15, Coran et Bukhari, panier, prix/stocks courants, commandes, Stripe en test, Resend, Prisma/Neon, sauvegardes, CI. Toute modification doit passer par branche/PR et tests, sans migration Production ni déploiement sans accord.
