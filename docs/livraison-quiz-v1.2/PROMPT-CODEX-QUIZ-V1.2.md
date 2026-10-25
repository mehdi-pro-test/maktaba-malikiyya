# Mission Codex — réaliser Quiz V1.2 à partir de la recherche fournie

Tu interviens sur le dépôt existant https://github.com/mehdi-pro-test/maktaba-malikiyya. Ton rôle est **l’implémentation**. Le ZIP de recherche contient désormais 150 questions/réponses complètes ; ne remplace pas ce contenu par des questions inventées ou des QCM copiés sur d’autres sites.

## 1. Lire et auditer avant modification

Lis `AGENTS.md`, `docs/v1.1/FINALISATION.md` et l’intégralité de `docs/quiz-v1.2/` dans le dépôt/ZIP documentaire initial. Lis aussi, dans ce ZIP de recherche, `README.md`, `RAPPORT-RECHERCHE.md`, `BIBLIOGRAPHIE.md`, `TABLEAU-VALIDATION.md`, `FORMAT-IMPORT.md` et `banque-150-questions.json`.

Le ZIP documentaire initial repose sur `main@cad05a9cf7200ce11f5f51dcbe0d3610ef87434a`. Ce HEAD distant a encore été constaté le 25/10/2026. Vérifie de nouveau `origin/main` : prends son HEAD actuel et conserve tout développement plus récent. Crée une branche `feat/quiz-v1.2-niveaux`, ou un suffixe distinct si elle existe et ne peut être réutilisée sans conflit. Ne travaille jamais directement sur main et ne force aucun historique partagé.

Présente un audit court du moteur, des données, des migrations et des tests. Lis les guides Next.js locaux imposés par AGENTS. Réutilise les composants et fonctions existants. Le dossier `documents-origine/` de la recherche conserve les anciens documents à titre historique : leur phrase disant que le rapport est absent est désormais obsolète. Les protections de la V1.1 et l’exigence de relecture restent applicables.

## 2. Ce qui est réellement fourni

- `banque-150-questions.json` : 15 ouvrages, 150 QCM à choix unique, quatre options, correction française, citation arabe, URL et statut du contrôle textuel.
- `questions/*.json` : un lot autonome de dix questions par ouvrage.
- `QUESTIONS-REPONSES-150.md` : lecture humaine des mêmes données.
- `preuves/registre-controle.json` : trace des contrôles textuels et des ressources consultées.
- `verifier.py` : validation documentaire sans dépendances.

Toutes les questions sont `review`, avec revue humaine `pending`. **Aucun lot n’a reçu de validation doctrinale humaine ; aucun n’est autorisé à la publication par ce fichier.** Il faut importer les vraies données dès maintenant et laisser les lots non validés « En préparation ». Ne les remplace pas par des emplacements vides. En développement/test, utiliser une fixture de publication clairement artificielle et confinée aux tests, jamais une fausse validation dans les données réelles.

Conserve intégralement le texte, les IDs, les réponses et les sources à l’import. Toute correction de fond doit être signalée dans un journal et reliée à une preuve. Les références PDF distinguent page imprimée vérifiée et position dans le PDF. Une pagination de portail ne devient pas une page imprimée. Aucun nom de relecteur ni date de validation ne peut être inventé. Une validation de schéma ou un rapprochement de texte n’est pas une revue doctrinale.

## 3. Fonctionnalité à réaliser

Conserve le quiz historique de dix questions, ses scores, sa correction, ses sources et sa possibilité de rejouer sur `/quiz`. Les dix questions V1.1 sont indépendantes des 150 nouvelles : ne les remplace pas et ne les écrase pas.

Ajoute `/quiz/niveaux` pour cinq parcours et `/quiz/niveaux/[niveau]/[ouvrage]` pour les quinze ouvrages du catalogue. Slugs invalides : 404. Ouvrage connu mais non validé : « En préparation », sans possibilité de jouer le lot ni d’exposer les bonnes réponses dans un payload public inutile. Affiche le nombre de quiz réellement disponibles ; ne présente pas les 150 questions `review` comme jouables.

Parcours et lots :

- Débutant : Akhḍarī, Ibn ʿĀshir, Achmawiyya — dix questions chacun, prioritaires.
- Intermédiaire : ʿIzziyya, Asḥal al-masālik, Risāla.
- Avancé : Khalīl, Dardīr, Dasūqī.
- Ultime : Bidāyat al-mujtahid, Istidhkār.
- Oussoul : Īṣāl al-sālik, Waraqāt avec al-Ḥaṭṭāb, Murtaqā al-wuṣūl, Marāqī al-suʿūd.

Pour chaque lot réellement publié après revue : dix questions, gros boutons tactiles, navigation clavier, progression, validation explicite d’une réponse, correction et références arabes en RTL, score final sur dix, récapitulatif et rejouer. Score : un point par réponse correcte, sans double attribution lors d’un double clic. Les explications apparaissent après validation. Design responsive cohérent avec le site, focus visible, annonces accessibles du résultat. Aucun compte, paiement, chrono ou suivi externe pour jouer.

## 4. Architecture et publication

Sépare les données quiz et boutique. Réutilise `src/lib/quiz.ts` et `src/components/quiz-game.tsx` selon leur contrat réellement présent au HEAD. Préserve `src/data/quiz-v1.1.json`. Introduis une couche JSON/TypeScript dédiée validée avec Zod ; suis la correspondance de `FORMAT-IMPORT.md`. Les imports ne dépendent d’aucune base et le jeu ne dépend d’aucun appel aux sites sources.

Validation stricte : IDs uniques, niveau/ouvrage connus, quatre options distinctes, réponse existante, citations et URLs HTTPS requises, références connues, dix questions par lot publié, absence de question non publiée dans un lot jouable. La barrière d’activation exige dix questions avec sources suffisantes et **revue humaine effective** (identité et date réelles). Tant que ce dernier élément manque, garder le lot entier en préparation. Ne transforme pas `matched-transcription` ou `read-facsimile` en `approved`.

Lorsqu’un vrai rapport de relecture arrive, prévoir son import par `questionId`, empreinte de la banque revue, décision, identité réelle du relecteur, date et éventuelles corrections. Rejeter une validation qui vise une version ancienne d’une question modifiée. Ne pas inventer une validation pour satisfaire un test.

Affiche les divergences telles que formulées : toutes les positions de Bidāya ou d’Istidhkār ne sont pas malikites ; les décomptes des sunnas diffèrent selon les matns. Respecte `quoteLayer` pour distinguer matn/commentaire/glose/poème. N’attribue pas Marāqī à Muḥammad al-Amīn al-Shinqīṭī ni ʿIzziyya au fondateur de la Shādhiliyya. Le matn Waraqāt est d’al-Juwaynī, le commentaire d’al-Ḥaṭṭāb.

## 5. Protection impérative de la V1.1

Ne modifie pas les produits, prix, stocks actuels, photos, slugs, panier `maktaba-cart`, frais de livraison, checkout, Stripe TEST, signatures des webhooks, réservations, idempotence, commandes, e-mails Resend/outbox, sauvegardes, workflows et migrations existantes. Akhdari a été configuré à 15 € avec un stock initial de 15 ; **ne réinitialise pas ce stock** à 15, car des mouvements ont pu intervenir.

Aucune migration sur Neon Production. Aucune remise à zéro de base, aucun seed de production, aucun secret inclus dans le code ou les rapports. Les anciens blocages Stripe/Resend restent des blocages tant qu’un contrôle réel ne les a pas levés. Ne prétends pas qu’un parcours de paiement a été vérifié par un simple test de page ou par des mocks. Cette fonctionnalité documentaire n’appelle pas de migration Prisma.

## 6. Contrôles et livraison

Exécute les scripts réellement présents : installation, génération Prisma si nécessaire, formatage, lint, TypeScript, unitaires, build, Playwright. Le protocole initial prévoit `npm ci`, `npm run db:generate`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. Adapte uniquement si les scripts ont changé au HEAD, en documentant ce changement.

Pour les tests PostgreSQL, utilise exclusivement une base jetable dont le nom contient `maktaba_test` ; aucun test d’intégration sur Neon Production. Ajoute des tests utiles pour validation des données, niveaux et slugs, scoring, références, brouillons inaccessibles au jeu, filtrage public, revue d’une ancienne version, clavier et mobile. Vérifie également les dix questions historiques, les pages livres et le panier. Ne supprime et n’affaiblis aucun test existant.

Livre le code et les documents sur la branche dédiée, une PR **non fusionnée**, les commandes réellement exécutées et leurs résultats, les blocages, le tableau de publication par ouvrage, les preuves responsive et un rapport de non-régression de la boutique. Le fait que tous les nouveaux lots soient encore en préparation doit être explicitement indiqué si aucune relecture n’a eu lieu.

**Ne déploie pas en Production et ne fusionne pas sans accord ultérieur explicite.** L’ancien accord de production V1.1 ne vaut pas autorisation pour cette V1.2.

Commence par l’audit, puis réalise progressivement le moteur, l’import des 150 questions, les routes, l’interface et les tests. Les questions/réponses sont déjà fournies : ton travail principal est maintenant de les intégrer fidèlement.
