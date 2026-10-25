# Format d’import — version `1.2-research-1`

Cette banque est un livrable documentaire, pas une modification du schéma de l’application. Codex doit ajouter une validation Zod et un adaptateur explicite vers le moteur existant. Aucun import SQL n’est nécessaire.

## Correspondance avec l’exemple du ZIP initial

| Recherche | Exemple documentaire initial | Règle |
| --- | --- | --- |
| `book.id` / `bookId` | `bookId` | Même slug d’ouvrage, inchangé |
| `level` | `level` | `debutant`, `intermediaire`, `avance`, `ultime`, `usul` |
| `questionFr` | `promptFr` | Copier sans réécriture silencieuse |
| `options[].id`, `textFr` | `options` | Quatre options ; une seule bonne réponse |
| `correctOptionId` | `correctOptionIds` | Transformer en tableau d’un élément uniquement si requis |
| suffixe numérique de `id` | `order` | Ordre 1 à 10 dans le lot |
| implicite | `type` | Toujours `single` dans cette banque |
| `explanationFr` | `explanationFr` | Explication originale française |
| `references` | `sources` | Conserver tous les champs documentaires utiles |
| `workTitleAr` | `bookTitleAr` | Titre primaire |
| `sectionAr` | `chapterAr` / `sectionAr` | Titre de section ; `locator` précise le repère |
| `printedPage` | `page` | Seulement quand vérifiée dans le fac-similé |
| `pdfPage` | champ additionnel | Position PDF, ne pas confondre avec page imprimée |
| `sourceId` | champ additionnel | Renvoi au registre `sources` |
| `textCheck` | contrôle textuel séparé | Ne vaut pas approbation doctrinale |
| `scholarlyReview` | relecteur/date/statut | `pending`, identité/date nulles dans la livraison |

Les livres et questions sont `review`. Le quiz connu doit afficher « En préparation » tant que dix questions ne réunissent pas les conditions de publication. `publicationAllowed: false` exprime l’état de livraison, pas un bouton à passer automatiquement à vrai.

## Lecture des références

`quoteLayer` vaut `author`, `matn`, `commentary`, `gloss`, `poem` ou `quoted-poem`. Pour les livres enchâssés dans un commentaire, le registre de source explique la zone réellement attribuable à chaque auteur. Les titres et auteurs sont également conservés à chaque référence afin de rendre chaque question lisible sans jointure implicite.

`matched-transcription` signifie qu’un segment a été retrouvé dans le texte numérique consulté, avec normalisation pour la recherche puis conservation du segment. `read-facsimile` signifie une lecture visuelle du PDF. Aucun de ces états n’équivaut à une collation critique ou à la validation d’un savant.

`edition: null` et `printedPage: null` sont intentionnels. Les remplacer par une édition non consultée est une erreur. Certaines descriptions d’exemplaires mentionnent l’éditeur ou l’éditeur scientifique effectivement vu sans prétendre que la date est connue.

## Relecture à importer ultérieurement

Prévoir un rapport indépendant contenant, au minimum :

```json
{
  "bankSha256": "empreinte réelle de la banque examinée",
  "questionId": "moukhtassar-al-akhdari-01",
  "decision": "approved | changes-requested | rejected",
  "reviewerName": "identité réelle du relecteur",
  "reviewedAt": "date réelle ISO 8601",
  "notes": "observations ou références complémentaires"
}
```

Ce bloc est un **exemple de protocole**, pas un rapport de validation. La décision doit être liée au contenu exact revu ; une modification après approbation invalide celle-ci. Ni la réussite des tests, ni une génération par modèle, ni l’accord technique de déploiement ne remplacent la revue doctrinale demandée.

## Validation documentaire

`python3 verifier.py` contrôle les volumes, IDs, options, statuts, références et champs de provenance. Il n’interroge pas les sources externes et ne tranche pas le fiqh. Les tests de l’application appartiennent au travail de Codex ; ils n’ont pas été exécutés dans cette livraison de contenu.
