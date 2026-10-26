# Données et intégration — V1.3, état réel du ZIP unique

## Deux ensembles distincts dans cette archive

1. **V1.2 en Production / GitHub** : `src/data/quiz-v1.2/research.json` conserve **150 questions publiées** (10 pour chacun des 15 ouvrages). Les `150` décisions originales dans `src/data/quiz-v1.2/reviews.json` sont liées au SHA canonique V1.2. Ne modifier ni fichier ni empreinte. Les exports CSV de ces 150 items figurent à la racine de ce dossier.
2. **V1.3 candidat à la relecture** : `recherche-v1.3/01-akhdari-30-candidats.json`, `02-ibn-ashir-30-candidats.json`, `03-achmawiyya-30-candidats.json`. **90 QCM nouveaux**, 30 par ouvrage débutant, `editorialStatus: research-draft`. CSV lisible `recherche-v1.3/QUESTIONS-REPONSES-NOUVELLES-90.csv`. Ils comprennent 4 choix, bonne réponse, explication, citation arabe, lien source, mais **ne doivent pas être activés automatiquement**. Les citations sont issues de transcriptions en ligne : vérifier la leçon sur une édition sûre, puis obtenir une relecture spécialisée.

## Comptage

| Ouvrage | Publiées V1.2 | Nouvelles rédigées V1.3 | Total rédigé (pas total publié) | Manquantes vers 100 |
|---|---:|---:|---:|---:|
| Mukhtasar al-Akhdari | 10 | 30 | 40 | 60 |
| Matn Ibn Ashir | 10 | 30 | 40 | 60 |
| Al-Achmawiyya | 10 | 30 | 40 | 60 |
| **Total débutant** | **30** | **90** | **120** | **180** |

Les 12 autres livres restent à 10 questions chacun (120). Total **240 questions rédigées** dans ce ZIP : **150 publiées + 90 en brouillon**.

## Contrôle des importations

- Schéma Zod spécifique pour les candidats, distinct du schéma V1.2 existant; aucune publication implicite.
- IDs globaux et `bookId` immuables et uniques; (bookId, normalized question) unique; contrôle plus poussé des **doublons sémantiques** par l'éditeur.
- Quatre options distinctes, un identifiant de réponse existant, explication française, référence arabe, titre/auteur/chapitre, URL HTTPS. Sans preuve de pagination imprimée, laisser `edition` et `printedPage` à `null`.
- Déploiement autorisé seulement après rapport de relecture humaine réelle `approved` (identité/date/perimètre/digest SHA256), qui ne réutilise pas la validation V1.2 pour signer les 90 nouvelles entrées.
- La prochaine livraison de contenu est exclusivement du ressort de l'assistant de recherche éditoriale; **Codex n'écrit pas de questions religieuses**.

## Évolution technique (Codex uniquement)

Conserver `src/lib/quiz-v12.ts`, `src/lib/quiz-v12-data.ts` et `src/components/quiz-game.tsx` autant que possible; adapter la sélection aux pools approuvés de taille variable. Si pool=10, conserver 10 questions jouables; si pool=100, tirer 10 sans remplacement; si pool<10, statut en préparation. Les 90 brouillons peuvent seulement être parsés et inspectés en mode éditorial, jamais affichés dans le quiz public. Ne pas migrer la base Neon Production pour une banque statique sans autorisation expresse.
