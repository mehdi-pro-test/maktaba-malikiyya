# Cahier des charges — Mode aléatoire global

## Intention

En complément des quiz individuels, rendre possible un entraînement transversal sur tout le patrimoine de QCM publiés de Maktaba Malikiyya. Il s'agit d'un **tirage aléatoire global uniforme au niveau des questions**, sans imposer de quota par livre ou par niveau.

### Parcours UX

1. L'utilisateur ouvre `/quiz/niveaux` via le menu « Quiz » existant.
2. Au-dessus de la liste des cinq parcours, une carte distincte et accessible **« Mode aléatoire — Tous les ouvrages »** avec un descriptif court et un lien **« Lancer le mode aléatoire »** ouvre `/quiz/aleatoire`.
3. Sur `/quiz/aleatoire`, une introduction « Quiz aléatoire », « 10 questions tirées de toute la bibliothèque » et « [N] questions actuellement dans la banque globale » précède le bouton « Commencer le quiz ». N est calculé dynamiquement à partir des questions autorisées, jamais fixé en dur.
4. Au clic, le serveur sélectionne 10 questions **différentes** au hasard parmi toutes les questions publiées des livres disponibles, quels que soient les niveaux. Leur ordre reste fixe durant la tentative.
5. Le joueur sélectionne sa réponse, la valide, voit le feedback et **la source arabe originale** de cette question et poursuit jusqu'au résultat sur 10. Les QCM à réponses multiples restent compatibles si le pool contient de tels objets.
6. Sur l'écran final, « Rejouer » déclenche **une nouvelle sélection** depuis la banque globale courante, sans imposer qu'elle soit entièrement différente de la précédente; chevauchement autorisé par la loi du hasard.
7. « Retour aux niveaux » renvoie vers `/quiz/niveaux`. La sortie ne modifie pas les autres parties ni le panier.

### Contraintes du tirage

- **Une question = une chance identique d'être tirée** : pas de pondération égale artificielle par ouvrage ou par niveau. Un livre riche en questions peut contribuer davantage.
- Tirage **sans remise** de 10 sur N, où N est le nombre de questions distinctes effectivement publiées et autorisées après projection serveur.
- Aucun doublon d'ID dans la banque ni dans les dix questions affichées. Si collisions de contenu significatives sont détectées, les signaler au lieu de détruire ou de fusionner les données existantes.
- Si le pool global contient moins de dix entrées éligibles : afficher proprement « Quiz en préparation » et ne pas inventer de questions. Pour N≥10, choisir exactement dix.
- À chaque nouvelle tentative, recalculer le pool serveur; les nouvelles questions futures dûment publiées deviennent automatiquement éligibles sans modification spécifique au mode global.
- Le tirage n'est pas fixé à la compilation/build; il survient **au démarrage ou au replay**, côté serveur.
- Aucune obligation de choisir au moins une question de chaque niveau ou de mélanger visuellement les livres : le hasard peut naturellement en sélectionner plusieurs du même ouvrage.

### Interface

- Réutiliser styles, cartes et `QuizGame` existants; ne pas construire un second moteur.
- Page autonome **`/quiz/aleatoire`** (pas `/quiz/niveaux/aleatoire`, qui entrerait en conflit conceptuel avec les routes dynamiques de niveaux).
- Ne pas afficher une fausse attribution d'un ouvrage unique pour le quiz global. L'introduction indique « Tous les niveaux et ouvrages », et les corrections montrent la vraie source par question. Une petite étiquette « Ouvrage : … » à l'écran de correction est facultative, uniquement si fondée sur le référentiel serveur.
- Accessibilité clavier, lecteurs d'écran, texte arabe avec `lang="ar"` et `dir="rtl"`; mobile et desktop.
- Afficher la banque totale N telle que calculée depuis les **sources autorisées**, pas le nombre d'enregistrements présents dans les brouillons ou archives du dépôt.

### Critères d'acceptation synthétiques

Un visiteur accède au mode depuis `/quiz/niveaux`, lance dix questions tirées parmi **tous** les ouvrages publiés, peut répondre et consulter les références, voit un score /10, puis peut rejouer avec un tirage fraîchement effectué. Les quinze quiz historiques et le commerce restent inchangés.
