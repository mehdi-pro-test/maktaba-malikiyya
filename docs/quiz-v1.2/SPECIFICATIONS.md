# Cahier des charges V1.2 — Quiz par niveaux et par ouvrage

## Objectif et priorité

Faire évoluer **uniquement la partie pédagogique quiz** de la V1.1, sans régression commerciale, technique ou UX. Le contenu doit être dérivé d'ouvrages arabes vérifiables et non d'une génération libre de réponses religieuses. La recherche approfondie en arabe demandée par le propriétaire est **en cours / non jointe** à ce pack : ne pas transformer les cibles en « contenu validé ».

## Périmètre éditorial

Cinq parcours : **Débutant**, **Intermédiaire**, **Avancé**, **Ultime**, **Oussoul al-fiqh malikite**. Quinze ouvrages au total, inventoriés dans `ouvrages.v1.2.json`.

- **Débutant : exactement 3 quiz distincts de 10 questions** (al-Akhdari, Ibn Ashir, al-'Achmawiyya) après vérification éditoriale.
- Intermédiaire : al-Muqaddima al-'Izziyya, Ashhal al-Masalik, ar-Risala (objectif 1 quiz de 10 par ouvrage).
- Avancé : Mukhtassar Khalil, Sharh al-Dardir, Hashiya ad-Dasuqi (objectif 1 quiz de 10 par ouvrage).
- Ultime : Bidayat al-Mujtahid, al-Istidhkar (objectif 1 quiz de 10 par ouvrage).
- Oussoul : Issal as-Salik, al-Waraqat avec Sharh al-Hattab, Murtaqa al-Wusul, Maraqi as-Su'ud (objectif 1 quiz de 10 par ouvrage).
- Total **cible : 15 quiz / 150 questions** ; seules les 30 débutant sont une exigence quantitative explicite du PO. Aucun chiffre de disponibilité ne doit inclure les questions non approuvées.

Le quiz classique V1.1 (10 questions) reste un parcours distinct. Ne pas attribuer ses dix questions aux ouvrages de cette nouvelle bibliothèque.

## UX et routes

1. `/quiz` **reste fonctionnel et joue les dix questions historiques**. Ajouter un lien/CTA clair « Explorer les quiz par niveau » vers `/quiz/niveaux`, sans casser les tests V1.1.
2. `/quiz/niveaux` : page de découverte avec cinq cartes de parcours, progression éditoriale honnête (nombre de quiz **disponibles**, pas planifiés), livres associés, message « En préparation » pour les livres sans questions validées.
3. `/quiz/niveaux/[niveau]/[ouvrage]` : page dédiée à un quiz **publié** ; route connue mais non prête = écran « Quiz en préparation » et retour au catalogue ; route inconnue = 404. Éviter les segments qui collisionnent avec les routes commerciales.
4. Parcours jeu : introduction (titre, niveau, livre, 10 questions si réellement disponibles), 1 question par écran, 4 gros boutons pour les questions à choix unique (choix multiples explicites possibles), sélection, validation, feedback avec explication, citation/source arabe, progression, résultat `x/10`, récapitulatif, Rejouer, Retour aux niveaux.
5. Navigation clavier et mobile, focus visible et déplacé après progression, annonce `aria-live` du score et du feedback, contrastes accessibles, RTL sur passages arabes. Respecter les préférences de mouvement réduit.
6. Aucun chrono, compte, classement, collecte de données personnelles, persistance du score, paiement ou accès base pour jouer. Éviter les appels externes dans le rendu ; les URLs source sont des liens sortants ouverts volontairement par le lecteur.

## Règles éditoriales

- Un ouvrage est un **support d'enseignement**, non une catégorie commerciale : ne pas le créer automatiquement comme produit en boutique.
- `draft` : visible uniquement comme livre « en préparation » (sans question, sans score) ; `review` : même restriction ; `published` : uniquement si toutes les conditions de validation sont remplies.
- Pour une session « quiz de 10 », **exactement 10 questions publiées** du même livre et de la même édition/attribution validée ; pas de complétion artificielle par questions V1.1, pas de doublons, pas de sélection aléatoire qui masque des erreurs.
- Si moins de 10 questions vérifiées, afficher « En préparation » ; une future option de mini-quiz doit faire l'objet d'une décision PO explicite.
- L'intitulé « source » dans l'interface doit afficher **titre de l'ouvrage en arabe, auteur, section, édition si identifiée, page uniquement si vérifiée, lien exact si disponible**, et une citation arabe courte vérifiée. Ne pas forger de numéros de pages ou de citations.
- Pour les comparaisons de madhahib (notamment Ibn Rushd), préciser si la question vise l'opinion malikite ou une divergence rapportée, avec référence au passage exact.
- Les ambiguïtés de titres, attributions et éditions (notamment Issal as-Salik et Maraqi as-Su'ud) doivent être résolues avant publication.

## Modèle de données et intégration

Créer une couche de contenu distincte sous `src/data/quiz-v1.2/` et un validateur Zod dédié, réutilisant au maximum `src/lib/quiz.ts` sans casser les consommateurs V1.1. Le contrat est décrit dans `SOURCES-ET-REVUE.md` et `question-exemple.draft.json`.

Schéma recommandé :

- `Book` : `id`, `level`, `titleAr`, `titleFr`, `authorAr` (vérifié), `edition` (optionnel), `status`, `questions`.
- `Question` : `id` globalement unique, `bookId`, `level`, `status`, `order`, `type`, `promptFr`, `options`, `correctOptionIds`, `requiredSelectionCount` si multiple, `explanationFr`, `topic`, `sources`.
- `Source` : `bookTitleAr`, `authorAr`, `edition` optionnelle, `volume` optionnel, `page` optionnelle, `chapterAr` ou `sectionAr`, `quoteAr` courte, `url` HTTPS si vérifiée, `verificationStatus`, `reviewedBy` et `reviewedAt` (pour l'historique éditorial).
- `status` dans les données ne vaut **pas** approbation doctrinale automatique : une publication exige preuve et revue.

Validation : IDs et ordres uniques, aucune bonne réponse absente des choix, exactitude du nombre de sélections, aucune question sans explication ni source primaire vérifiée, aucune URL `http:` ou schéma dangereux, aucun livre annoncé disponible avec moins de dix questions publiées. La CI doit vérifier le JSON et le compte par livre.

## Acceptation

- Le parcours historique `/quiz` fonctionne toujours avec ses dix questions, score et liens de source.
- Un ouvrage non sourcé ne propose **jamais** un QCM fictif ; le catalogue est néanmoins navigable.
- Trois quiz débutants de 10 sont publiés **uniquement après** preuve et revue ; sinon les éléments manquants restent `draft` et le rapport indique précisément pourquoi.
- Les pages de chaque niveau affichent une source consultable et un texte arabe correctement rendu sur chaque correction.
- Les tests et la CI existants passent, les nouveaux tests passent, aucune modification du commerce ou des données Production n'est requise.
