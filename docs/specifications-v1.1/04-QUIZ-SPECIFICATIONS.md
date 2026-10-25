# 04 — Quiz éducatif V1.1 : spécification produit

## Intention

Une petite rubrique ludique liée aux sciences islamiques, interface française avec une énergie de jeu de connaissances : progression visible, larges boutons de choix, validation, score et explication. **Inspiration ergonomique**, pas reproduction visuelle ou usage de la marque GeoGuessr.

## Contenu approuvé par le PO — 2 questions

### Question 1

**Énoncé :** « Qui sont les imams des quatre écoles juridiques sunnites ? » (reformulation sans changement de sens de la question du PO « Qui sont les imams des 4 écoles ? »).

**Réponse exacte :**
- Abû Hanîfa (أبو حنيفة)
- Mâlik ibn Anas (مالك بن أنس)
- Ash-Shâfiʿî (الشافعي)
- Ahmad ibn Hanbal (أحمد بن حنبل)

**Interaction proposée :** 6 grands boutons multi-sélection avec 4 bonnes réponses ; deux distracteurs d'interface proposés *et à valider pédagogiquement* : al-Bukhârî et Muslim ibn al-Hajjâj. Instruction : « Choisis les quatre imams fondateurs. » Cliquer sur un bouton le sélectionne ; re-cliquer désélectionne ; valider seulement avec 4 sélectionnés ; exact-match (aucune erreur) pour +1 point.

**Feedback après validation :** « Les quatre écoles sont hanafite (Abû Hanîfa), malikite (Mâlik ibn Anas), shafi'ite (Ash-Shâfiʿî), et hanbalite (Ahmad ibn Hanbal). »

### Question 2

**Énoncé PO :** « La tahâra se divise en combien de catégories ? »

**Réponse exacte donnée par le PO :** **2** : `tahârat al-hadath` (طهارة الحدث) et `tahârat al-khabath` (طهارة الخبث).

**Interaction proposée :** boutons choix unique `1`, `2`, `3`, `4`. La réponse `2` vaut +1 point. La question teste le **nombre** de catégories et le feedback en précise les appellations.

**Feedback :** « Deux catégories : tahârat al-hadath (purification de l'état d'impureté rituelle) et tahârat al-khabath (élimination des impuretés matérielles). » La formulation pédagogique peut être relue avant publication si nécessaire.

### Questions 3 à 10

Huit emplacements réservés `status: "draft"`, `title: null`, aucune proposition de fausse question ou réponse. Ne pas les exposer dans le quiz utilisateur. Le code doit permettre de les activer **uniquement après ajout d'énoncé, choix, réponse correcte et feedback**, validés par le PO.

## Règles fonctionnelles

- 10 emplacements éditoriaux, mais **2 questions jouables maintenant**. UI : « 2 questions disponibles » ; pas « Quiz de 10 questions » tant que les 8 autres sont absentes.
- Questions disponibles présentées dans l'ordre, sans timer ni compte à rebours pour la V1.1.
- Score : 1 point par question entièrement correcte, soit `0/2`, `1/2` ou `2/2` en l'état.
- Clic « Valider » fige la réponse, révèle bonnes/mauvaises options et explication ; puis « Question suivante » ; à la fin bilan et « Rejouer ».
- Un clic sur réponse sans cliquer « Valider » ne doit pas compter.
- Pas de sauvegarde cloud, pas de profil, pas de statistiques personnelles ni publicité.
- Si 0 question active (mauvaise configuration), afficher un message clair plutôt qu'une erreur JS.

## Technique proposée

- Questions statiques typées dans `src/data/quiz.ts` (ou JSON validé par Zod), non modifiables depuis une API publique.
- Champs `id`, `status`, `type: 'single'|'multiple'`, `promptFr`, `options`, `correctOptionIds`, `requiredSelectionCount`, `explanationFr`, `categorySlug`, `order`.
- Adapter l'app pour charger uniquement les questions `published` valides. La correction côté navigateur est suffisante pour un jeu **sans classement ni récompense** ; cela n'est pas un outil d'examen sécurisé.
- Réduire les animations si `prefers-reduced-motion`; bonne navigation clavier/souris/tactile et messages `aria-live`.
- Le Quiz n'accède pas à la DB du commerce, n'effectue aucun checkout, ne manipule ni emails ni cookies nécessaires au paiement.

## Tests quiz obligatoires

1. Q1 exige exactement 4 sélections ; erreur si un nom manquant ou mauvais ; bonne réponse 1 point.
2. Q2 `2` est la seule réponse correcte ; texte de feedback montre les deux catégories.
3. Les huit brouillons ne sont ni rendus ni pris en compte dans le score.
4. Écrans d'entrée, progression, résultat, rejouer, quiz vide.
5. Parcours mobile 320px, clavier, lecteurs d'écran au minimum par audit automatique et revue manuelle.
