# Guide d’intégration — ne pas confondre décision éditoriale et preuve de source

Le schéma de `01-BANQUE-190-QUESTIONS-ULTIME.json` est `1.3-owner-editorial-approved-190-1` et NON le schéma technique des lots 30 QCM de la V1.3 précédente. Ne pas faire passer ce fichier tel quel au validateur `candidateBatchSchema`, qui exige littéralement `status: not-for-publication` et `editorialStatus: research-draft`.

## Transformation Codex attendue

1. Lire `01-BANQUE-190-QUESTIONS-ULTIME.json` et `08-VALIDATION-PROPRIETAIRE-190.json`; vérifier les empreintes, les IDs et les comptes.
2. Créer une transformation **sans perte** vers le contrat technique effectif du site, en conservant séparément `ownerApproval` et l'état indépendant de vérification des citations.
3. Importer en stockage de contenu propriétaire-approuvé. Pour le rendre actif, traiter toute règle technique exigeant une preuve de collation, par vérification réelle ou décision explicite documentée, jamais par des booléens inventés.
4. Le moteur actuel plafonne à 100 QCM; une banque de 150 nécessite une adaptation explicite. Tous les 150 doivent rester candidats au tirage, seuls 10 étant utilisés par partie.
5. Conserver la base V1.2 et les autres lots V1.3 **inchangés**; les 140 + 50 QCM sont deux lots nouveaux, pas des remplacements.

## Différence importante

- `ownerApproval.decision: approved` = le propriétaire a validé les questions/réponses.
- `scholarlyReview.status: not-attested` = aucune expertise indépendante n'est revendiquée.
- `references[].textCheck: requires-editorial-collation` = aucune collation complète sur fac-similé n'est revendiquée.
- `publicationAllowed: true` = le propriétaire autorise **éditorialement** l'intégration/publication, sans avoir autorisé une fusion, un déploiement Production, ni une déclaration fausse de vérification de source.
