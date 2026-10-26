# Spécifications techniques — intégration minimale et sûre

## Stack et source d'autorité

Au `main` observé, l'application est Next.js **16.4.3**, React 19.2, TypeScript, Node 24, Prisma 7 (pour la boutique). **Les banques du quiz ne sont pas actuellement chargées depuis une table SQL de questions** : le dépôt utilise des JSON versionnés et des validateurs côté serveur. « Toutes les questions de la base » signifie donc **toutes les questions réellement approuvées exposées par les pools serveur actuellement utilisés par les quiz**. Ne pas dupliquer les 150 historiques, les 270 V1.3 et les 190 Ultime depuis les archives/export CSV.

Réutiliser **`src/lib/quiz-v12-data.ts`** comme autorité d'exposition : il assemble les quinze pools via la banque V1.2, `editorialLots` et `ultimeAdditions`, puis exporte `library`, `findQuizBook`, `bookQuestions`. Il importe `server-only`. Son export `bookQuestions(level, id)` retourne des questions normalisées du moteur, uniquement quand l'ouvrage est disponible. Il contrôle déjà un maximum **de 200 par ouvrage** dans l'état consulté. Ne pas exposer les banques brutes ni les décisions de relecture aux composants clients.

Les fichiers importants :

- `src/app/quiz/actions.ts` : `startQuizAttempt(level, bookId)` est une server action utilisant `randomInt` de `node:crypto` et `drawPublishedQuestions(...)`.
- `src/lib/quiz-draw.ts` : `drawQuestions` implémente Fisher–Yates et échantillonne 10 sans remise, mais la limite `MAX_APPROVED_POOL=200` s'applique actuellement à **un livre**; elle ne doit pas bloquer la banque globale de plusieurs centaines de questions.
- `src/components/quiz-game.tsx` : `QuizGame({ availableCount, loadAttempt, context })` gère introduction, chargement, corrections, progression, score et Rejouer. `loadAttempt` est rappelé au replay.
- `src/app/quiz/niveaux/page.tsx` : ajouter la carte qui pointe vers `/quiz/aleatoire` **avant** `<QuizLibrary books={library} />`.
- `src/app/quiz/niveaux/[niveau]/[ouvrage]/page.tsx` : garder ce chemin et son code actuel.
- `src/components/navigation.tsx` : garder le lien « Quiz » vers `/quiz/niveaux` et les marqueurs actifs; ne pas recréer de classique.

## Proposition d'architecture (à ajuster au dernier main)

### 1. Agrégateur serveur

Créer une fonction dans un module **`server-only`** (p. ex. `src/lib/quiz-global-data.ts`) qui :

1. Part de la projection autorisée `library.filter(book => book.available)`.
2. Pour chaque ouvrage `b`, récupère `bookQuestions(b.level, b.id)`.
3. Vérifie que chaque question est `published`, que son ID est globalement unique et que ses options, réponses et sources proviennent du chemin validé existant.
4. Aplatit **une seule fois** les questions; ne pas lire en parallèle les exports V1.2/lot V1.3/Ultime en plus des pools, sinon doublons et fuites éditoriales.
5. Expose **un compteur d'éligibilité** et une API server-only donnant la liste d'objets normalisés. Ne pas passer ce tableau complet à la page React ni à un composant client. Le contenu de brouillons, lots non publiés et fichiers docs est exclu.

**Résultat attendu selon le test source `tests/quiz-ultime.unit.test.ts` au HEAD consulté : 610 questions approuvées au total** (15 livres : 9 × 40 + 2 ultimes totalisant 210 + 4 × 10 = 610). Ce **nombre indicatif n'est PAS un contrat**, Codex doit recalculer l'état réel du dernier `main`, signaler tout écart et ne jamais coder `610` en dur.

### 2. Tirage global

Ajouter une action serveur sans arguments client dangereux, par exemple `startGlobalQuizAttempt()` dans `src/app/quiz/actions.ts`, qui reçoit le pool global depuis le module server-only, filtre/contrôle `published`, puis tire exactement dix questions avec un RNG côté serveur (reprise du `randomInt(2**32) / 2**32` actuel ou équivalent sécurisé).

**Adapter l'algorithme de tirage** : l'actuel `drawPublishedQuestions` refuse tout pool >200. Le global nécessite >200. Extraire une fonction pure commune tirant 10 sans remise pour tout N>=10 (Fisher–Yates sur copie, ou échantillonnage partiel uniforme). Conserver si besoin une validation de **capacité par livre** pour les quiz individuels, mais **ne pas appliquer ce plafond au pool global**; ne pas modifier le comportement existant de la route par ouvrage. Tester N=201, 610 et ≥1000.

Algorithme conceptuel pur :

```ts
function pickTen<T extends { id: string }>(pool: readonly T[], random: () => number): T[] {
  if (new Set(pool.map(x => x.id)).size !== pool.length) throw new Error('ID dupliqué');
  if (pool.length < 10) return [];
  const a = [...pool];
  for (let i = 0; i < 10; i++) {
    const j = i + Math.floor(random() * (a.length - i));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, 10);
}
```

Cette variante partial Fisher–Yates a une sélection uniforme des séquences ordonnées et évite les échanges inutiles. Le RNG injecté doit produire une valeur dans `[0,1)` (contrôler les valeurs invalides). Le code ci-dessus est **indicatif**, vérifier l'algorithme dans les tests avant réutilisation.

### 3. Route et interface

Créer `src/app/quiz/aleatoire/page.tsx` comme **page serveur** : 

- Titre `Quiz aléatoire — Tous les ouvrages` ; description SEO concise.
- Nombre N via fonction compteur **seule**, sans expédier la banque complète dans HTML/RSC.
- Bouton de lancement via le composant existant : `<QuizGame availableCount={N} loadAttempt={startGlobalQuizAttempt} context={{ titleFr:'Mode aléatoire', titleAr:'اختبار عشوائي', levelLabel:'Tous les niveaux', returnHref:'/quiz/niveaux', returnLabel:'Retour aux niveaux' }} />`.
- Si besoin, traiter le chargement SSR/prérendu conformément à la documentation Next 16 du repo, sans générer un tirage par `generateStaticParams` ou au build. Ce sont les **tentatives** qui doivent être dynamiques, pas nécessairement le titre de la page.
- Ajouter une carte « Mode aléatoire » accessible en tête de `src/app/quiz/niveaux/page.tsx`.

### 4. Publication et sécurité

- La validation éditoriale du propriétaire et les contrôles source existants **restent ceux de l'application**; ne pas créer de nouvelle revue automatique ni modifier leurs JSON, empreintes ou dates.
- L'action ne fait confiance à aucun pool/ID de question transmis par le client. Ne pas injecter des objets depuis URL/POST.
- Ne pas afficher les questions refusées, brouillons ou issus de livres fermés dans HTML/RSC, dans les logs ou le JSON initial; la server action ne retourne **que les dix choisies**. Pour ne pas refondre le moteur existant, les bonnes réponses des dix questions jouées peuvent suivre le contrat actuel de `QuizGame`; ne pas prétendre que ce système est un examen anti-triche côté serveur.
- Ne pas faire de requête SQL, de migration Prisma, de remise à zéro, ni ajouter des secrets; toutes les données sont déjà approuvées et présentes dans les pools de l'application.
- Les liens arabes doivent garder leur comportement existant avec URL HTTPS et rendu texte React, sans injection HTML.

### 5. Performances et évolution

- Réutiliser la banque issue des imports statiques côté serveur; la sélection tient en mémoire avec quelques centaines d'items, inutile de faire un `ORDER BY random()` SQL.
- Éviter de recalculer la validation cryptographique lourde inutilement à chaque question; calculer le pool à l'initialisation du module ou avec une mémoïsation serveur sûre si pertinent, puis effectuer le tirage à chaque action.
- Tout nouveau livre ou nouveau lot validé ajouté aux pools doit devenir éligible automatiquement au prochain déploiement de cette banque.
- Ne pas mettre en cache les **dix questions tirées** entre tentatives/utilisateurs.
