> Évolution suivante : voir [la correction pédagogique](../quiz-pedagogie/README.md). Les 610 questions publiées sont conservées par ouvrage ; le mode global propose désormais une sélection de 469 questions adaptées à une partie autonome. Les chiffres ci-dessous décrivent la livraison initiale du mode global.

# Mode aléatoire global — livraison technique

Base : `origin/main` au commit `5713c38f531354b2dc0dcf0decb091bf499ab6fc`.
Branche : `feat/quiz-mode-aleatoire-global`. PR à conserver non fusionnée ; aucune mise en Production effectuée.

## Fonctionnement

`/quiz/niveaux` présente une carte avant les cinq parcours. `/quiz/aleatoire` réutilise `QuizGame` avec un contexte global rétrocompatible. Seuls le compteur et l’action serveur sont transmis à cette page, jamais le corpus. Les corrections conservent la véritable source de chaque question et les mentions de vérification existantes.

`quiz-global-data.ts` est marqué `server-only`. Il agrège exclusivement `library` et `bookQuestions` de `quiz-v12-data.ts`. Le helper pur `assembleGlobalPool` ignore les livres indisponibles et les questions non publiées et rejette les collisions d’identifiants. Aucune archive, banque brute ou décision n’est réimportée par le mode global. Chaque appel serveur recalcule la projection des pools en mémoire ; les validations des banques restent réalisées par leurs modules existants.

`startGlobalQuizAttempt()` n’accepte aucun pool ou identifiant client. Il utilise `node:crypto` et `sampleTen`, Fisher–Yates sur une copie, sans plafond global. Chaque question a la même probabilité d’inclusion : 10/N. Il n’y a aucun quota par ouvrage. Le plafond de 200 est conservé dans le chemin des quiz individuels. Les tentatives ne sont jamais mises en cache : lancement et Rejouer font un nouvel appel ; les dix objets restent dans l’état du composant pendant la partie. Un chevauchement entre parties reste possible et normal. Moins de dix questions produit l’écran de préparation existant.

Les réponses des seules dix questions jouées sont transmises selon le contrat actuel du moteur. Ce n’est pas un dispositif d’examen anti-triche.

## Inventaire recalculé

Le test de projection réelle compare l’agrégat à l’aplatissement exact des quinze pools publics. Le tableau ci-dessous concorde avec ce contrôle et le référentiel approuvé utilisé en E2E.

| Niveau          | Ouvrage (identifiant)        | Questions autorisées |
| --------------- | ---------------------------- | -------------------: |
| Débutant        | `moukhtassar-al-akhdari`     |                   40 |
| Débutant        | `matn-ibn-ashir`             |                   40 |
| Débutant        | `al-achmawiyya`              |                   40 |
| Intermédiaire   | `al-mouqaddima-al-izziyya`   |                   40 |
| Intermédiaire   | `ashal-al-masalik`           |                   40 |
| Intermédiaire   | `ar-risala-ibn-abi-zayd`     |                   40 |
| Avancé          | `moukhtassar-khalil`         |                   40 |
| Avancé          | `sharh-al-dardir`            |                   40 |
| Avancé          | `hashiyat-al-dasuqi`         |                   40 |
| Ultime          | `bidayat-al-mujtahid`        |                  150 |
| Ultime          | `al-istidhkar`               |                   60 |
| Oussoul al-fiqh | `issal-as-salik`             |                   10 |
| Oussoul al-fiqh | `al-waraqat-sharh-al-hattab` |                   10 |
| Oussoul al-fiqh | `murtaqa-al-wusul`           |                   10 |
| Oussoul al-fiqh | `maraqi-as-suud`             |                   10 |
| **Total**       | **15 ouvrages, 5 niveaux**   |              **610** |

Sous-totaux : Débutant 120 ; Intermédiaire 120 ; Avancé 120 ; Ultime 210 ; Oussoul 40. Le nombre 610 figure dans l’inventaire et les assertions de non-régression, jamais dans le code applicatif du mode global.

## Non-régression

Aucun fichier de questions, sources, citations, validations ou empreintes éditoriales existantes modifié. Les tests d’intégrité historiques restent exécutés. Aucun changement aux quinze routes par ouvrage, à la navigation Quiz, ni à la redirection permanente de `/quiz` vers `/quiz/niveaux`.

Aucun changement aux produits, prix, stocks, panier, frais de livraison, checkout, webhooks, commandes, outbox, Resend, Prisma, migrations, sauvegardes, secrets ou workflows. Aucune migration ni écriture en Production. Les tests PostgreSQL sont exécutés exclusivement contre `maktaba_test_v13` sur `127.0.0.1` ; les tests de paiement/e-mail utilisent les scénarios simulés existants, sans attester de paiement Stripe ou de livraison Resend réels.

## Contrôles

Voir [TESTS.md](TESTS.md). Les captures desktop et mobile sont dans [captures/](captures/). Les huit documents originaux du ZIP sont conservés sans modification dans [source/](source/) ; les sept empreintes et tailles déclarées dans son manifeste ont été vérifiées à l’import.
