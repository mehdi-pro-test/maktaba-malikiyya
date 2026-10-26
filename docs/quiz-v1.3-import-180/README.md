> **Actualisation :** le propriétaire a confirmé « verif ok / mets en prod ». Les six rapports d’approbation sont enregistrés et le total passe à 420 questions publiées. Voir [l’activation déclarée](ACTIVATION-2026-10-26.md). Le bilan initial ci-dessous décrit l’état avant cette confirmation.

# Import éditorial de 180 questions — audit et état de publication

Base récupérée : `main@bc8df4071c87db6037afd86136b0c698406f6223` le 26 octobre 2026. Aucun contenu religieux recherché, rédigé ou corrigé. Les 15 fichiers du ZIP sont archivés à l’identique sous `source/`, avec leurs empreintes dans `IMPORT-SHA256.json`.

## Inventaire

| Ouvrage                      | Publiées préservées | Importées en circuit éditorial | Accord éditorial enregistré | Nouvelles publiées | Total rédigé | Reste à rédiger vers 100 |
| ---------------------------- | ------------------: | -----------------------------: | --------------------------: | -----------------: | -----------: | -----------------------: |
| `moukhtassar-al-akhdari`     |                  40 |                              0 |                           0 |                  0 |           40 |                       60 |
| `matn-ibn-ashir`             |                  40 |                              0 |                           0 |                  0 |           40 |                       60 |
| `al-achmawiyya`              |                  40 |                              0 |                           0 |                  0 |           40 |                       60 |
| `al-mouqaddima-al-izziyya`   |                  10 |                             30 |                          30 |                  0 |           40 |                       60 |
| `ashal-al-masalik`           |                  10 |                             30 |                          30 |                  0 |           40 |                       60 |
| `ar-risala-ibn-abi-zayd`     |                  10 |                             30 |                          30 |                  0 |           40 |                       60 |
| `moukhtassar-khalil`         |                  10 |                             30 |                          30 |                  0 |           40 |                       60 |
| `sharh-al-dardir`            |                  10 |                             30 |                          30 |                  0 |           40 |                       60 |
| `hashiyat-al-dasuqi`         |                  10 |                             30 |                          30 |                  0 |           40 |                       60 |
| `bidayat-al-mujtahid`        |                  10 |                              0 |                           0 |                  0 |           10 |                       90 |
| `al-istidhkar`               |                  10 |                              0 |                           0 |                  0 |           10 |                       90 |
| `issal-as-salik`             |                  10 |                              0 |                           0 |                  0 |           10 |                       90 |
| `al-waraqat-sharh-al-hattab` |                  10 |                              0 |                           0 |                  0 |           10 |                       90 |
| `murtaqa-al-wusul`           |                  10 |                              0 |                           0 |                  0 |           10 |                       90 |
| `maraqi-as-suud`             |                  10 |                              0 |                           0 |                  0 |           10 |                       90 |
| **Total**                    |             **240** |                        **180** |                     **180** |              **0** |      **420** |                **1 080** |

Les six ouvrages concernés conservent chacun **10 questions jouables**, avec 30 nouvelles candidates non publiées. Les trois débutants conservent leurs 40 questions approuvées chacun. Les six autres ouvrages restent à dix. Les compteurs publics restent donc à **240**, pas 420. Pour les six banques importées, il manque 360 questions à rédiger pour atteindre 100 rédigées par ouvrage ; les 180 déjà rédigées devront encore satisfaire les contrôles avant publication.

## Approbation enregistrée sans attestation inventée

La déclaration du propriétaire « j’ai validé les brouillons » est conservée octet pour octet. Le contrôleur vérifie les six SHA-256, la correspondance exhaustive des 180 IDs/livres et l’unicité de leur périmètre. Les 180 champs `citationVerified` et `attributionVerified` restent à **null**, et `publicationAllowedByThisRecordAlone` reste **false**. Aucun rapport `1.3-review-1` publiable n’est fabriqué. Les validations V1.2 et les 90 approbations débutantes existantes restent intactes.

## Points restant à vérifier, ouvrage par ouvrage

| Ouvrage            | Questions | Citation/source à contrôler                                                                        | Attribution/couche                                       | Autres contrôles                                           |
| ------------------ | --------: | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| Al-‘Izziyya        |        30 | OCR provisoire, collation mot à mot avec édition primaire ; lien du fac-similé alternatif conservé | Auteur et matn non attestés par la déclaration           | Réponses, distracteurs et déduplication éditoriale         |
| Ashal al-Masalik   |        30 | Transcription provisoire, vers dans leur chapitre                                                  | Auteur et couche `poem` à attester                       | Réponses, distracteurs et déduplication éditoriale         |
| Ar-Risala          |        30 | Transcription provisoire à collationner                                                            | Auteur et couche `matn` à attester                       | Réponses, distracteurs et déduplication éditoriale         |
| Mukhtasar Khalil   |        30 | Transcription provisoire ; portée et exceptions à relire                                           | Auteur et couche `matn` à attester                       | Réponses, distracteurs et déduplication éditoriale         |
| Sharh al-Dardir    |        30 | Citation exacte et passage du commentaire                                                          | Distinguer `commentary` du matn et de la glose de Dasuqi | Réponses, distracteurs et déduplication éditoriale         |
| Hashiyat al-Dasuqi |        30 | Citation exacte et passage de la glose                                                             | Distinguer `gloss` du commentaire de Dardir et du matn   | Réponses, distracteurs et collisions détaillées ci-dessous |

## Doublons et anomalies

**420 identifiants uniques ; aucun énoncé normalisé identique** (comparaison globale aux 240 questions existantes et entre les 180 nouvelles). Les six banques ont chacune 30 items avec quatre choix distincts, une bonne réponse présente, une explication et une référence arabe structurées. Leurs auteurs et titres correspondent aux métadonnées du catalogue ; ce contrôle textuel ne constitue pas une preuve bibliographique.

L’outil de comparaison relève **13 paires potentielles**, listées dans `COLLISIONS.csv` et `AUDIT.json`. Il utilise le recouvrement lexical au sein d’un ouvrage et les citations identiques, sans conclure à une équivalence religieuse. Les faux positifs restent possibles. La recherche sémantique n’est ni exhaustive ni certifiée par un modèle ; elle reste une étape humaine avant publication.

Deux rapprochements avec la banque existante méritent une attention prioritaire :

- `hashiyat-al-dasuqi-v13-ia-025` ↔ `hashiyat-al-dasuqi-01` : formulations relatives à la qualification de l’eau ; contrôler si le fait évalué est distinct.
- `hashiyat-al-dasuqi-v13-ia-028` ↔ `hashiyat-al-dasuqi-09` : formulations et réponses proches concernant une cavité assez large et les gestes associés.

Une citation est également partagée par `hashiyat-al-dasuqi-v13-ia-013` et `hashiyat-al-dasuqi-v13-ia-009` ; une citation commune ne suffit pas à établir un doublon de question. Les textes et réponses restent inchangés ; aucune question suspecte n’est transférée au registre public. Le lot entier reste en attente des vérifications.

## Architecture et protections

- `src/data/quiz-v1.3-pending-180/` conserve les six banques et l’approbation d’origine. `quiz-v13-pending-180.ts` n’est importé que par les outils éditoriaux et les tests, jamais par une page ou une action publique. Le registre actif `quiz-v13-lots.ts` reste inchangé.
- Le schéma Zod reste strict et accepte le format provisoire sans perdre `quoteLayer`, `verification`, `quoteIsCertifiedVerbatim`, `alternateFacsimileUrl`, `layerAttributionRequiresHumanVerification` ou `distractorsReviewRequired`. Les anciennes banques gardent exactement leurs digests.
- Toute publication continue d’exiger un rapport séparé lié au digest canonique, une date et un relecteur déclarés, `citationVerified=true` et `attributionVerified=true` effectivement attestés. Pour le nouveau format, `deduplicationReviewed=true` et `distractorsReviewed=true` sont également exigés. Aucun de ces indicateurs n’est renseigné pour les six lots importés.
- Lors d’une éventuelle publication future vérifiée, l’adaptateur conserve la couche de citation fournie (`matn`, `poem`, `commentary`, `gloss`) au lieu de la remplacer systématiquement par `matn`. Les données de provenance ne sont jamais réécrites automatiquement.
- Les quinze quiz, le tirage de dix sans remplacement, les tentatives stables, les scores, les sources et Rejouer restent inchangés. Aucun changement boutique, Prisma, migrations, commandes, stocks, paiements, e-mails ou sauvegardes.
- L’auto-déploiement Vercel de cette seule branche est désactivé, conformément à la livraison sans déploiement. Aucun déploiement ni fusion demandé ou exécuté.

Audit reproductible sans écriture : `npx tsx scripts/quiz-180-audit.ts`. Voir `VALIDATION.md` pour les résultats réels.
