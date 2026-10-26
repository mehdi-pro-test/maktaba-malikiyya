# Correction de la contextualisation et de la sélection globale

Base : `main` au commit `4a783967040bbd797d8e1c6a92614fc68ddd41c2`. Branche dédiée `fix/quiz-contexte-pedagogie`. Aucune mise en Production dans cette livraison.

## Changements

- Chaque question affiche son ouvrage en français et en arabe et son niveau avant la réponse, puis dans le récapitulatif. Ces métadonnées sont issues du référentiel serveur, jamais inférées du texte ou d’un identifiant client.
- Pour les 270 ajouts V1.3 concernés, les instructions de workflow devenues incohérentes (« avant publication », « reste soumise ») sont séparées du texte explicatif affiché. Une mention actuelle indique : « Question publiée après validation déclarée par le propriétaire. Cette validation ne constitue pas une certification indépendante des citations et des attributions. » Seules quatre fins de paragraphe exactes sont reconnues ; tout texte inconnu reste intact.
- Les questions présentant des défauts de contexte ou de propositions sont écartées du seul mode global. Aucun changement aux questions, réponses, citations, sources, validations éditoriales ou empreintes d’origine. Les quinze quiz par ouvrage conservent leurs 610 questions. Le moteur global tire dix questions uniformément dans la sélection restante de 469, sans quota par livre.

Il s’agit d’une sélection pédagogique, pas d’une révocation d’approbation du propriétaire ni d’une certification de fiqh. Les questions écartées sont conservées et peuvent être réintroduites après une correction éditoriale documentée. L’interface ne prétend plus que toutes les questions publiées conviennent au tirage transversal : elle annonce une sélection de questions autonomes.

## Périmètre de l’audit

Les cinq parties en Production ont montré des défauts dépassant la contextualisation du bandeau. Les 180 ajouts intermédiaires/avancés ont ensuite été parcourus avec leurs quatre propositions : 43 ne présentent pas les défauts de formulation retenus, 137 sont écartés de ce mode. Quatre autres cas sont écartés : deux questions d’Al-Istidhkār renvoyant à « ce point », une question historique de la Bidāya renvoyant à « cet avis », et une citation d’Ibn Ashir à la typographie détériorée. Ces décisions sont conservatrices et ne signifient pas que chaque bonne réponse est fausse. Elles ne constituent pas une revue doctrinale exhaustive des 610 questions.

Le registre `src/data/quiz-global-quality.json` est explicite, par identifiant. Aucun classificateur automatique, aucune expression régulière exécutée à chaque tirage pour retirer de futures questions. Les tests vérifient que chaque exclusion correspond à une question encore publiée et qu’aucune n’entre dans le pool global. Les autres futures questions approuvées restent automatiquement éligibles.

### Exemples pris en charge

- `al-istidhkar-v13-ultime-039` : « sur ce point » sans objet juridique précisé — hors sélection globale.
- `hashiyat-al-dasuqi-v13-ia-017` : « le quatrième avis » non présenté et propositions non homogènes — hors sélection globale.
- `moukhtassar-khalil-v13-ia-013` : choix sur la terre et un récipient en réponse à une question sur un vêtement souillé — hors sélection globale.
- « Quelle source l’auteur donne-t-il… » : l’ouvrage et le niveau sont désormais visibles avant la question.
- Instructions « avant publication » : affichage séparé actualisé, explication substantielle, réponse et citation d’origine conservées.

Voir [EXCLUSIONS-GLOBALES.csv](EXCLUSIONS-GLOBALES.csv) pour les 141 identifiants et motifs : `missing-context`, `off-topic-options`, `ambiguous-options`, `quote-typography`.

## Inventaire

| Ouvrage                      | Publiées dans le quiz par ouvrage | Éligibles au global | Écartées du global |
| ---------------------------- | --------------------------------: | ------------------: | -----------------: |
| `moukhtassar-al-akhdari`     |                                40 |                  40 |                  0 |
| `matn-ibn-ashir`             |                                40 |                  39 |                  1 |
| `al-achmawiyya`              |                                40 |                  40 |                  0 |
| `al-mouqaddima-al-izziyya`   |                                40 |                  21 |                 19 |
| `ashal-al-masalik`           |                                40 |                  20 |                 20 |
| `ar-risala-ibn-abi-zayd`     |                                40 |                  20 |                 20 |
| `moukhtassar-khalil`         |                                40 |                  11 |                 29 |
| `sharh-al-dardir`            |                                40 |                  15 |                 25 |
| `hashiyat-al-dasuqi`         |                                40 |                  16 |                 24 |
| `bidayat-al-mujtahid`        |                               150 |                 149 |                  1 |
| `al-istidhkar`               |                                60 |                  58 |                  2 |
| `issal-as-salik`             |                                10 |                  10 |                  0 |
| `al-waraqat-sharh-al-hattab` |                                10 |                  10 |                  0 |
| `murtaqa-al-wusul`           |                                10 |                  10 |                  0 |
| `maraqi-as-suud`             |                                10 |                  10 |                  0 |
| **Total**                    |                           **610** |             **469** |            **141** |

## Non-régression et limites

Aucune modification de prix, stock, panier, frais de livraison, checkout, Stripe, commandes, e-mails, schéma Prisma, migrations, sauvegardes, workflows ou secrets. Aucune migration Production. Les corrections et les réserves sur les sources des 190 questions Ultime restent inchangées.

Les défauts des propositions conservées dans les quiz par ouvrage ne sont pas corrigés par une réécriture religieuse : cette livraison corrige la sélection transversale et l’affichage. Une révision éditoriale des questions écartées reste nécessaire avant leur retour dans ce mode. Leur simple approbation de publication ne lève pas automatiquement une exclusion pédagogique.

## Tests

- Formatage, lint, TypeScript et build : exécutés.
- Tests unitaires : 136 réussis, notamment provenance des 610 questions, séparation des 270 notices, immutabilité, 141 exclusions, 469 éligibles, présence des quinze ouvrages et rejet effectif lors des tirages.
- Playwright : 128 tests réussis en une exécution complète (7,1 minutes), sur les quatre profils du dépôt, y compris les parcours commerciaux et quinze quiz individuels. Les nouvelles assertions vérifient l’ouvrage/niveau avant réponse, le compteur global calculé, l’absence de questions écartées et de consignes « avant publication » dans les corrections.
- PostgreSQL : aucun changement de persistance dans cette livraison ; les E2E utilisent uniquement la base locale isolée `maktaba_test_v13`. Aucun test contre Neon Production, aucun paiement externe ou envoi Resend réel attesté.

### Reprises de vérification

Le chargement initial d’un nouveau JSON en ESM par Playwright a nécessité l’attribut d’import JSON explicite ; la collecte a été relancée. Un passage navigateur intermédiaire a été interrompu avant le dernier ajustement de défilement pour exécuter ensuite toute la suite sur le build final. Un test unitaire historique de contrôle des empreintes a dépassé ses cinq secondes pendant l’exécution simultanée des navigateurs et de plusieurs outils ; la suite unitaire a été relancée seule, sans modifier son délai ni ses assertions. Les résultats annoncés correspondent aux exécutions finales complètes.
