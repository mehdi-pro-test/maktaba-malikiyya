# Activation des 180 questions — confirmation du propriétaire

Après la livraison de la PR #9 et de ses points à vérifier, le propriétaire confirme : **« verif ok / mets en prod »**, le 26 octobre 2026. Cette confirmation porte sur les vérifications signalées (citations, attributions, distracteurs, déduplication) et autorise leur publication ainsi que la fusion et le déploiement.

Les six rapports de `src/data/quiz-v1.3-180-reviews/` enregistrent 180 décisions `approved`, chacune liée au digest canonique du lot importé. Le relecteur est enregistré comme « mehdi-pro-test — vérifications déclarées dans la conversation », sans nommer ni qualifier un tiers et sans revendiquer de contrôle religieux indépendant de Codex. Les champs `citationVerified`, `attributionVerified`, `deduplicationReviewed` et `distractorsReviewed` reprennent cette confirmation déclarée.

Le document initial d’approbation, ses attestations nulles et les métadonnées provisoires des sources restent inchangés comme trace de l’état antérieur. Aucun énoncé, option, bonne réponse, explication, citation, édition ou page n’est réécrit. Les treize rapprochements demeurent documentés ; le propriétaire confirme les vérifications et la conservation des 180 textes dans leur état fourni. Aucune absence de doublon doctrinal n’est certifiée par le logiciel.

Les six lots sont ajoutés au registre actif avec leurs rapports, sans assouplir le validateur. Le registre brut sans rapports reste utilisable pour les tests de fermeture des contenus non approuvés. Les compteurs et tirages utilisent exclusivement le pool approuvé.

| Parcours        | Ouvrages | Questions publiées par ouvrage |   Total |
| --------------- | -------: | -----------------------------: | ------: |
| Débutant        |        3 |                             40 |     120 |
| Intermédiaire   |        3 |                             40 |     120 |
| Avancé          |        3 |                             40 |     120 |
| Ultime          |        2 |                             10 |      20 |
| Oussoul al-fiqh |        4 |                             10 |      40 |
| **Total**       |   **15** |                                | **420** |

Chaque partie conserve dix questions distinctes, un ordre stable, un score sur dix, les références et un nouveau tirage à Rejouer. Les 240 questions précédemment publiées et leurs validations restent préservées.

L’audit avant activation est archivé dans `AUDIT-AVANT-ACTIVATION.json` ; `AUDIT.json` décrit l’état activé. Aucune migration Prisma ni intervention directe en base Production n’est nécessaire. Aucun changement boutique, prix/stock, commandes, paiement, e-mail ou sauvegarde.
