# Ultime — intégration des 190 questions propriétaire-approuvées

Branche `feat/quiz-v1.3-ultime-190-approuvees`, créée depuis le dernier `main@0633b61cf14dfaac1bf40b5f540ee9abbcca9a52`. Aucun contenu religieux recherché, rédigé, corrigé ou complété. Les fichiers fournis et les approbations individuelles sont préservés.

## Inventaire sur cette branche

| Ouvrage                       | Historiques préservées | Ajouts propriétaire-approuvés | Pool jouable sur la branche | Questions par partie |
| ----------------------------- | ---------------------: | ----------------------------: | --------------------------: | -------------------: |
| Bidāyat al-Mujtahid           |                     10 |                           140 |                     **150** |                   10 |
| Al-Istidhkār                  |                     10 |                            50 |                      **60** |                   10 |
| Treize autres ouvrages        |       **400 au total** |                             0 |            **400 au total** |                   10 |
| **Total des quinze ouvrages** |                **420** |                       **190** |                     **610** |               **10** |

**Ce ne sont pas des brouillons éditoriaux.** La validation des 190 questions est acquise et enregistrée sous la politique explicite `owner-editorial-approval`. La Production reste à 420 questions tant que cette PR n’est pas fusionnée et déployée sur instruction distincte. Les sous-banques 140/50 et le CSV sont des exports, pas des lots supplémentaires.

## Approbation éditoriale et sources : deux états différents

Le contrat existant `1.3-review-1` reste inchangé : les anciens lots gardent leurs approbations et leurs exigences de citation/attribution. Le nouveau format reçu `1.3-owner-editorial-approved-190-1` possède un contrat séparé et strict, conforme à la décision explicite du propriétaire d’autoriser ces questions sans leur attribuer de certification scientifique. Il ne passe pas par une falsification des anciennes cases de collation.

- L’approbation du propriétaire, sa date, les 190 IDs et la portée 140/50 sont contrôlés contre la banque exacte. Chaque question doit avoir son approbation individuelle et une décision correspondante dans le registre. Retirer l’autorisation du lot ou passer une décision à `pending`/`rejected` retire les questions concernées du pool.
- Les titres, auteurs, chapitres, URL, domaines, quatre choix et bonnes réponses sont validés structurellement. Un lot malformé, modifié, contenant un ID en collision, un énoncé normalisé identique dans le même ouvrage ou une décision hors périmètre est rejeté. Une question au statut `draft` ne peut pas emprunter ce contrat.
- `scholarlyReview.status: not-attested`, `references[].textCheck: requires-editorial-collation`, les éditions/pages nulles et les sources `editorialValidation: pending` sont conservés. Aucun `citationVerified=true`, `attributionVerified=true`, `read-facsimile`, spécialiste ou page n’est créé.
- Le modèle de jeu garde `publicationBasis: owner-editorial-approval` et `sourceVerification: not-attested`. Dans la correction et le récapitulatif des nouveaux items, une mention distingue la validation éditoriale du propriétaire de la collation des citations et de l’attribution des avis non attestées. Elle ne s’affiche pas avant réponse ni sur les questions historiques.

La publication sur cette branche est donc une **autorisation éditoriale du propriétaire**, pas un certificat de vérification des sources. Aucune seconde approbation des questions-réponses n’est demandée. Les contrôles de sources et d’avis comparés restent précisément identifiés comme non attestés.

## Empreintes et provenance

La banque canonique reçue a le SHA-256 brut `aaa66d64eaf0c32321d60639e0f9083e25311779127d678a124d3f5bf96970d5`, identique à `newOwnerApprovedBankSha256` et au manifeste. Le registre `integrity.json` relie cette empreinte brute à une empreinte canonique calculée sur le JSON complet ; cette dernière est contrôlée lors du chargement côté serveur. Les tests recalculent aussi l’empreinte brute sur les octets livrés et comparent les copies applicatives à l’archive.

L’empreinte de recherche antérieure `a77fbca1eb81e1a556ae844af5ebcc210f0f4429658f52bd2a93f460d61e9c53` concorde entre le manifeste et le registre, mais son payload antérieur n’est pas fourni : **elle n’est pas prétendue recalculée**. Cette limite n’affecte pas la vérification de la banque approuvée effectivement livrée.

Les deux exports par ouvrage correspondent exactement aux sous-ensembles de la banque canonique. Les 22 notices séparées concordent avec les notices internes hors `editorialValidation` : l’export qualifie le corpus de propriétaire-approuvé tandis que les notices internes gardent l’état de collation `pending`. Ces deux états de provenance sont conservés, sans réécriture.

## Collisions

Le registre compte **610 identifiants uniques et 610 énoncés normalisés uniques** parmi les 610 questions. Aucune attribution de titre/auteur ne contredit les métadonnées des deux ouvrages. Ce rapprochement de chaînes ne prouve pas l’exactitude de chaque avis comparé.

La comparaison lexicale produit **45 rapprochements** dans `RAPPROCHEMENTS.csv` et `AUDIT.json`, sans citation identique entre les paires signalées. L’examen des libellés retrouve surtout des formulations communes (« quel avis Ibn Rushd attribue-t-il… ») sur des sujets ou interlocuteurs différents. Aucun doublon littéral ou collision bloquante d’identifiant n’a été identifié. Il ne s’agit pas d’un certificat d’absence de doublon doctrinal ; aucun item n’est supprimé, reformulé ou approuvé de nouveau par l’intégrateur.

## Moteur et absence de régression

Le plafond partagé est explicitement relevé de 100 à **200 questions par ouvrage**. La même constante est utilisée par l’assemblage serveur et le moteur de tirage ; le format strict des anciens lots reste limité à 100 items par lot, ce qui ne limite plus les pools des ouvrages. Le nouveau format contient exactement 190 questions réparties 140/50. Au-delà de 200 dans un ouvrage, l’erreur explicite demeure : aucune troncature silencieuse.

Fisher–Yates sur copie reste inchangé. Seules les dix questions sélectionnées au démarrage ou à Rejouer sont transmises au navigateur. L’introduction, le HTML/RSC et les scripts ne contiennent pas la banque de 150/60 questions. Les parties gardent leur ordre, leurs réponses, leur score sur dix et leurs corrections RTL. Les vingt historiques restent candidates au tirage.

Les routes, les quinze ouvrages, la navigation vers les niveaux et la redirection de `/quiz` sont préservés. Aucun changement commercial : produits, prix/stocks, frais, panier, commandes, Stripe TEST, Resend, Prisma/Neon, migrations, sauvegardes, workflows ou dépendances. Les seuls changements Vercel empêchent le déploiement automatique de cette branche ; aucun déploiement demandé pour la livraison.

Audit reproductible : `npx tsx scripts/quiz-ultime-audit.ts`. Bilan des commandes réellement exécutées : `VALIDATION.md`.
