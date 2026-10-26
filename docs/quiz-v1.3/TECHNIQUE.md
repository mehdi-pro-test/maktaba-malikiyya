> **Actualisation :** les trois lots de 30 questions sont désormais enregistrés avec leurs rapports séparés, après la confirmation du propriétaire du 26 octobre 2026. Le registre n’est plus vide. Voir [activation des 90 questions](ACTIVATION-90-2026-10-26.md). Les descriptions de la livraison initiale sans activation ci-dessous sont historiques.

# V1.3 — tirage technique et import futur

## Base et périmètre

Branche `feat/quiz-v1.3-tirage` créée depuis le dernier `origin/main` récupéré : `c25a20696b6c44ba6e7ba0cac25ba7e9cd640980`. Audit initial : 85 tests unitaires et build réussis. Liste des fichiers et routes capturée avant modification. Le ZIP est un apport documentaire, pas un remplacement du dépôt.

Aucun contenu religieux recherché, rédigé ou corrigé. Les deux fichiers V1.2, leurs 150 validations et leur SHA canonique restent inchangés : `eb1b6ab9830e22a543603e0093f6c9ac100f6e9209cae403413c1528a26598fa`.

## Tentative

1. La page d’ouvrage conserve ses paramètres statiques et affiche seulement l’introduction, les métadonnées du livre et le nombre de questions approuvées. Aucune banque ni réponse n’est sérialisée dans son HTML/RSC initial.
2. Au clic sur Commencer, `startQuizAttempt` (Server Action POST) valide niveau/ouvrage, recontrôle la disponibilité et charge uniquement le pool approuvé côté serveur. Les protections de corps et d’origine Next.js restent actives. Pas de compte, cookie, écriture ou mutation métier.
3. `drawQuestions` effectue Fisher–Yates sur une copie avec un RNG injectable. Le serveur emploie `node:crypto.randomInt`. Le résultat contient exactement dix IDs distincts ; seule cette sélection avec les corrections utiles est retournée au client. Aucun cache applicatif ne mémorise un tirage. Les tirages ne sont jamais effectués au build.
4. `QuizGame` conserve la tentative dans un état React. Choisir, valider, afficher le score, rendre à nouveau le parent et afficher le récapitulatif ne changent ni les questions ni leur ordre. Rejouer redemande une sélection et réinitialise réponses, score et progression. Les sélections peuvent se recouper, voire exceptionnellement être identiques.
5. Chargement et double clic sont protégés ; en cas d’erreur réseau, un message accessible permet de réessayer. Une erreur à Rejouer conserve le résultat précédent. Les sources arabes restent affichées après validation et dans le récapitulatif, en RTL, avec liens HTTPS sûrs.

Une tentative n’est pas persistée sur disque : recharger complètement la page revient à l’introduction. Le moteur historique de score exact-match et le rendu de correction sont réutilisés. La prop `questions` du moteur reste disponible pour les fixtures de compatibilité ; les quinze routes publiques utilisent uniquement le chargeur serveur.

Pool inférieur à dix : préparation, aucune complétion artificielle. Pool de dix : les dix questions, ordre mélangé. Pool jusqu’à cent : dix sans remplacement. Au-delà de cent : erreur explicite, aucune troncature silencieuse. Aucune promesse que deux parties seront nécessairement différentes.

## Import éditorial additif après validation

Le pack original reste sous `docs/quiz-v1.3-pack/`, exclu du formatage pour préserver ses octets. `quiz-v13-editorial.ts` définit un schéma strict distinct pour ses candidats, un digest canonique SHA256 indépendant et une adaptation au moteur existant. Le registre serveur `quiz-v13-lots.ts` reste **vide**. Aucun des 90 brouillons n’est importé par une page publique ou une action.

Pour un futur lot, après revue éditoriale réelle :

- Conserver les IDs et les questions fournis ; ne jamais modifier `research.json` ou `reviews.json` V1.2. Le parseur ne normalise que les clés de comparaison pour détecter les doublons ; il ne réécrit aucun texte.
- Enregistrer un rapport `schemaVersion: "1.3-review-1"`, avec `batchSha256` égal au `candidateDigest` du lot, `publicationAllowed: true`, et les décisions par question : `questionId`, `decision` (`approved`, `changes-requested`, `rejected`), `reviewerName`, `reviewedAt` (date française ISO), `citationVerified`, `attributionVerified`, `notes`.
- Une approbation exige les deux contrôles à true, une identité réelle et une date cohérente. Le logiciel vérifie la structure, pas la compétence du relecteur ni l’authenticité de sa signature. Le propriétaire valide ces documents dans la PR de contenu.
- Ajouter explicitement `{ batch, report }` au registre serveur. L’absence de rapport ou de permission de publication n’active rien. Digest erroné, rapport V1.2 réutilisé, revue dupliquée/inconnue, date invalide ou citation/attribution non vérifiée bloquent le lot. Les questions rejetées ou non relues sont exclues.
- La déduplication couvre les IDs globaux et les énoncés normalisés par ouvrage, y compris contre V1.2 et les autres lots. Les équivalences sémantiques restent une responsabilité éditoriale. Aucun alias bibliographique n’est approuvé automatiquement.
- Le pool s’ajoute aux dix questions V1.2, sans changer leur validation. Un lot de 90 nouvelles questions approuvées permet donc de passer à 100. Les compteurs de l’introduction, du catalogue et de l’accueil utilisent la taille réellement autorisée. Dépasser cent nécessite une nouvelle règle du propriétaire.

Le format actuel des candidats correspond à des transcriptions en ligne avec édition/page nulles. Pour un prochain format contenant une pagination collationnée, étendre explicitement le schéma dans une nouvelle PR ; ne pas inventer ces champs.

Audit reproductible, sans écriture : `npx tsx scripts/quiz-v13-audit.ts`. Voir `INVENTAIRE.md` et `INVENTAIRE.json`.

## Livraison sans déploiement

PR non fusionnée, aucun déploiement demandé. `vercel.json` désactive exclusivement l’auto-déploiement Git de `feat/quiz-v1.3-tirage` via `git.deploymentEnabled`. Les autres branches, dont main, gardent leur comportement existant. Une Preview attendra un accord explicite et la levée de ce blocage pour cette branche. Aucune migration Prisma n’est nécessaire ni ajoutée.
