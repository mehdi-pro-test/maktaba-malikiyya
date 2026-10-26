# Contrat de tirage — 10 questions parmi 100

## Fonctionnalité

- Quand le joueur ouvre un ouvrage, il voit l'écran d'introduction et un compteur honnête (par ex. « 100 questions dans la banque » si les 100 sont **autorisées**).
- Au clic sur « Commencer », créer une **nouvelle tentative**, sélectionner **10 IDs distincts** parmi les questions éligibles de cet ouvrage, puis fixer leur ordre.
- Les questions et leur ordre restent **stables** pendant toute la tentative : pas de nouveau tirage à chaque re-render React, navigation, hydration, validation de réponse ou retour au résultat.
- Un nouveau clic sur « Rejouer » réinitialise score/réponses et effectue un **nouveau tirage**. Deux tentatives peuvent avoir des questions communes et, exceptionnellement, le même groupe de 10.
- Score : 1 point par question correctement répondue, maximum 10. QCM à réponse unique dans le corpus débutant ; si multi-sélection future, conserver l'exact-match actuel.
- Afficher correction, courte référence arabe et lien sortant **après validation de la réponse**, puis dans le récapitulatif.

## Uniformité et sécurité

Utiliser Fisher–Yates sur **copie** du tableau des questions éligibles puis en prendre dix, ou méthode équivalente uniforme sans remise. Encapsuler la source d'aléa pour injection d'un RNG déterministe en tests. Aucune mutation d'un tableau partagé entre sessions.

Ne pas envoyer les 100 questions/réponses dans les props de la page si seules dix servent à la session. Privilégier sélection côté serveur au démarrage de la tentative avec rendu compatible App Router Next.js 16 et sans cache accidentel. L'application actuelle utilise `generateStaticParams()` ; ce n'est pas incompatible avec des paramètres de routes prédéfinis, mais **la sélection aléatoire elle-même ne doit pas être figée au build**. Maîtriser hydration et SSR/CSR ; une route statiquement prérendue ne doit pas imposer le même tirage à tous les visiteurs.

Si un endpoint ou une Server Action est ajouté, limiter l'entrée à `bookId`/niveau, vérifier côté serveur les statuts, éviter toute exposition des banques non autorisées et appliquer les protections HTTP habituelles. Pas de compte/analytics/cookie obligatoire ; une tentative côté navigateur suffit si l'architecture actuelle est adaptée.

## Cas limites

- Pool autorisé < 10 : ne pas inventer de questions, afficher le fallback ou laisser la V1.2 disponible sans mentir sur sa taille.
- Pool = 10 (ouvrages V1.2) : jouer les dix existantes, sans dire « 10 parmi 100 ».
- Pool = 100 : 10 distinctes, avec ordre aléatoire.
- Pool > 100 : ne pas changer silencieusement la sélection ; demander une règle PO de traitement.
- Erreur de validation d'un item : l'exclure du tirage / bloquer le lot selon le modèle de revue, enregistrer l'anomalie; ne pas compléter avec de fausses questions.

## Acceptation

Sur 1 000 tirages de test : 10 IDs distincts à chaque essai et aucune mutation de l'entrée. Des tests statistiques raisonnables peuvent surveiller la distribution, sans imposer des seuils flous qui rendent la CI instable. Les tests déterministes prouvent l'équivalence du jeu à RNG fixé et la non-modification de tentative lors d'un re-render.