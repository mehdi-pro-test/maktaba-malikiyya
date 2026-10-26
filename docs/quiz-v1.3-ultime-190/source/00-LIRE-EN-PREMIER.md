# Maktaba Malikiyya — 190 nouvelles questions approuvées (niveau Ultime)

**Statut de ce ZIP : APPROUVÉ PAR LE PROPRIÉTAIRE, PAS UN BROUILLON.** Le 26 octobre 2026, le propriétaire a déclaré explicitement : « je valide les questions réponses donc pas de brouillon ». La déclaration s'applique à **140 nouvelles questions pour Bidāyat al-Mujtahid** et **50 pour al-Istidhkār**, soit **190 QCM**.

Les questions, les bonnes réponses, les quatre choix, les explications françaises et les citations arabes figurent bien dans cette **unique archive**. Les questions nouvelles portent le statut éditorial `owner-approved`, avec une autorisation de publication par le propriétaire (`publicationAllowed: true`). Il reste à **intégrer techniquement** le lot dans le site ; le ZIP n'est pas un déploiement.

## Récapitulatif

| Ouvrage | Anciennes questions sur le site (snapshot) | Nouvelles approuvées dans ce ZIP | Total visé après intégration |
|---|---:|---:|---:|
| Bidāyat al-Mujtahid wa Nihāyat al-Muqtaṣid | 10 | **140** | **150** |
| Al-Istidhkār | 10 | **50** | **60** |
| **Total** | **20** | **190** | **210** |

La *Bidāya* contient 51 QCM sur les ʿibādāt, 60 sur les muʿāmalāt et 29 sur les ḥudūd/infractions. Le total **150** dépasse la limite `MAX_APPROVED_POOL=100` actuellement fixée dans `src/lib/quiz-draw.ts` : Codex doit adapter cette limite **sans tronquer ni supprimer des QCM**.

## Fichiers fournis

- `01-BANQUE-190-QUESTIONS-ULTIME.json` : données complètes des 190 QCM, statut `owner-approved`.
- `02-BANQUE-bidayat-al-mujtahid-140.json` et `02-BANQUE-al-istidhkar-50.json` : exports autonomes par ouvrage.
- `03-REFERENCES-SOURCES-ARABES.json` : 22 notices de sources arabes.
- `04-QUESTIONS-REPONSES-190.csv` : export lisible de chaque énoncé/réponse/source et de la validation du propriétaire.
- `05-INVENTAIRE-ET-CONTROLES.json` : contrôles de cohérence, empreintes et limitations.
- `06-PROMPT-A-COLLER-DANS-CODEX.md` : prompt technique mis à jour pour autoriser l'activation des 190 nouvelles questions après vérification de l'intégrité technique.
- `07-CHECKLIST-REVUE-ET-RECETTE.md` : liste de contrôles restante ; ce document ne remet pas en question l'approbation du propriétaire.
- `08-VALIDATION-PROPRIETAIRE-190.json` : enregistrement nominatif, daté et lié aux empreintes du lot des **190 décisions éditoriales**.

## Portée exacte de cette validation

Le propriétaire a approuvé le **contenu des questions et des réponses**. Cette validation n'atteste **pas** qu'un savant indépendant a vérifié les citations ni que chacun des 190 passages a été collationné sur une édition imprimée. Les repères `textCheck: requires-editorial-collation` des sources sont conservés parce qu'ils décrivent un niveau de preuve différent ; on ne doit pas les transformer en `read-facsimile` sans preuve.

Codex peut **préparer et activer** la banque sur sa branche en tenant compte de la validation du propriétaire. Il doit conserver les sauvegardes, l'historique des 190 approbations et faire les contrôles techniques et documentaires nécessaires. Ne **fabriquer aucune attestation** du contrôle des citations ni contourner silencieusement des garde-fous existants. S'il faut distinguer « validation propriétaire » et « certification de source » dans les schémas, créer les deux champs séparés.

**Ne pas fusionner, déployer en Production ni appliquer de migration sur Neon Production sans instruction distincte.**
