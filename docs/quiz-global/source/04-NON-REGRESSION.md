# Périmètre strict et non-régression

## Ce qui est autorisé

- Ajouter une carte/lien vers le mode global sur `/quiz/niveaux`.
- Ajouter une nouvelle route `/quiz/aleatoire`.
- Ajouter une projection **server-only** du pool global à partir des quinze quiz déjà publics.
- Adapter/tester l'échantillonnage pour un pool global supérieur à 200 questions en préservant le tirage des quiz par ouvrage.
- Réutiliser le composant `QuizGame`, les styles, le scoring, l'accessibilité et les citations existantes.

## Ce qui est interdit sans nouvel accord

- Remettre l'ancien quiz classique : le propriétaire l'a retiré; `/quiz` doit continuer sa redirection 308 vers `/quiz/niveaux`.
- Changer une question, une option, une bonne réponse, une citation, une référence, une attribution, une approbation ou un SHA de banque.
- Inclure les brouillons et archives non validées pour « augmenter » artificiellement le nombre global.
- Modifier les quiz d'un ouvrage : pas de suppression, pas de variation de leur règle de score ni de leur route.
- Imposer un quota par niveau ou ouvrage : le tirage est **global au niveau des questions**.
- Modifier le catalogue, les produits, les prix, le stock (notamment l'Akhdari), le panier et sa persistance, la livraison FR/Europe, le checkout invité, Stripe TEST/webhooks, les commandes et les e-mails Resend/outbox.
- Modifier le schéma Prisma, les migrations Neon, les tâches de sauvegarde et restauration, les secrets, les workflows ou la configuration Vercel sans justification et accord spécifique.
- Déployer, fusionner la PR ou basculer un paiement en mode LIVE.

## Cas à surveiller

- Ne pas appeler une fonction `drawQuestions` avec un pool global >200 avant d'en avoir extrait/levé la limite héritée (sans affaiblir les contraintes des livres).
- Ne pas transmettre les bonnes réponses de tout le corpus au navigateur; seulement les dix tirées et jouées.
- Ne pas faire un tirage au moment du `next build`, SSR initial ou `generateStaticParams` : chaque nouvelle tentative doit être indépendante.
- Ne pas créer une deuxième copie des QCM depuis les fichiers de documentation ZIP et les dossiers `src/data` : choisir une seule projection publique comme autorité.
- Ne pas réinitialiser la banque globale à chaque rendu React ou changement d'étape.
- Ne pas oublier le vrai ouvrage d'origine dans le panneau de source après correction.
- S'assurer que `QuizGame` affiche une introduction générique dans le mode transversal; il possède un contexte pensé pour un livre, qui ne doit pas induire « le même ouvrage pour les 10 questions ».

## Règle de livraison

**Toutes les vérifications et développements restent sur une branche et une PR non fusionnée.** Le propriétaire décidera ensuite de la fusion et du déploiement.
