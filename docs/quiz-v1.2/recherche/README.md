# Maktaba Malikiyya — recherche Quiz V1.2

Livraison documentaire du 25 octobre 2026. **150 questions complètes, 15 ouvrages, 5 parcours.** Les trois ouvrages débutants contiennent chacun dix questions. Chaque entrée comporte quatre choix, une bonne réponse, une explication originale en français, un extrait arabe et son lien de consultation.

## À ouvrir

- `QUESTIONS-REPONSES-150.md` : les questions et corrections lisibles, par ouvrage.
- `banque-150-questions.json` : banque complète pour import.
- `questions/` : les quinze lots indépendants de dix questions.
- `RAPPORT-RECHERCHE.md` : méthode, résultats, nuances et limites.
- `BIBLIOGRAPHIE.md` : textes consultés et problèmes d’attribution.
- `TABLEAU-VALIDATION.md` : état réel des quinze lots.
- `PROMPT-CODEX.md` : instructions d’implémentation à donner à Codex avec ce ZIP et le ZIP du dépôt déjà fourni.
- `FORMAT-IMPORT.md` : correspondance avec le format documentaire initial.
- `preuves/registre-controle.json` : méthode de contrôle et empreinte des ressources locales consultées.
- `verifier.py` : contrôle documentaire autonome, sans connexion ni base de données.

## Ce que signifient les statuts

Toutes les questions sont `review`, et aucune n’est `published`. Le contenu est rédigé et ses passages justificatifs ont été consultés. **Aucune validation par un enseignant ou relecteur humain compétent n’est revendiquée.** Ce dernier contrôle demeure requis par les documents V1.2 avant mise en ligne. Ce ne sont pas 150 emplacements vides ; les réponses et les justifications sont fournies.

Les éditions ou pages imprimées inconnues sont `null`. Un numéro de page d’un portail n’est jamais présenté comme une page d’édition. Les trois lots contrôlés sur PDF conservent un repère de page PDF séparé. Les citations manuelles de fac-similés conservent les mots arabes, sans reproduire systématiquement voyelles et ponctuation.

## Périmètre de cette livraison

Recherche et préparation de contenu uniquement. Aucun code applicatif, migration, accès SQL, remise à zéro de stock, déploiement ou fusion n’a été effectué pour cette livraison. Le dépôt demeure à traiter par Codex. Le HEAD distant de main contrôlé le 25/10/2026 est `cad05a9cf7200ce11f5f51dcbe0d3610ef87434a` ; Codex devra le vérifier de nouveau.

Le répertoire `documents-origine/` reproduit les documents du ZIP fourni : **archives de référence**, dont certaines phrases sont désormais datées, notamment l’absence du rapport de recherche. Le nouveau `PROMPT-CODEX.md` explique précisément ce qui est fourni et ce qui reste à valider. Les documents joints ne sont pas des autorisations de modifier la production.

Contrôle : `python3 verifier.py` depuis ce répertoire. Aucun paquet à installer.
