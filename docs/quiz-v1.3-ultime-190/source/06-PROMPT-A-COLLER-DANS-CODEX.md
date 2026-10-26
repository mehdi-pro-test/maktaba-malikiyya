# PROMPT CODEX — Maktaba Malikiyya V1.3 — 190 QCM PROPRIÉTAIRE-APPROUVÉS

Dépôt GitHub : `mehdi-pro-test/maktaba-malikiyya`. Tu reçois **un seul ZIP** qui contient 190 QCM nouveaux, leurs 4 choix, réponses, explications et références arabes, ainsi que ma **validation éditoriale explicite datée du 26/10/2026**.

## 1. Ma décision de propriétaire

**J’APPROUVE LES 190 QUESTIONS-RÉPONSES : 140 pour Bidāyat al-Mujtahid et 50 pour al-Istidhkār. CE NE SONT PLUS DES BROUILLONS.**

Cette décision est enregistrée dans `08-VALIDATION-PROPRIETAIRE-190.json` avec l’empreinte SHA-256 de la banque approuvée. Les JSON primaires ont `status: owner-approved`, `publicationAllowed: true` et une approbation individuelle pour chacune des 190 questions. **Tu n’as pas à inventer, rédiger ni chercher d’autres questions pour ce lot, ni demander une seconde validation éditoriale de ma part.**

Ne transforme pas cette décision en prétendue certification de savant indépendant, de citation contrôlée sur fac-similé ou d’avis doctrinal comparé vérifié. Les champs de provenance restent sincères. Si la sécurité éditoriale technique requiert une preuve supplémentaire de vérification des citations/attributions, signale précisément ce point et conserve deux pistes séparées : « approbation du propriétaire » et « vérification des sources ». Ne contourne pas les validateurs en mettant `citationVerified: true` ou `attributionVerified: true` sans preuve.

## 2. Auditorat du code, sans régression

1. Lis `AGENTS.md`, ce ZIP entier et les règles Next.js du dépôt. Récupère le **dernier** `origin/main`; le commit repéré lors de la création du pack est `0633b61cf14dfaac1bf40b5f540ee9abbcca9a52`, mais il peut avoir changé.
2. Crée une branche `feat/quiz-v1.3-ultime-190-approuvees`; aucune modification directe de main.
3. La V1.2 contient au moins 10 QCM historiques par chacun des deux ouvrages. Les 190 nouveaux QCM ont des IDs propres, et leurs textes/options/réponses/sources doivent être importés **sans perte et sans modification sémantique**.
4. Effectue les contrôles des collisions avec **les données du dernier main**. Si un doublon ou une attribution litigieuse apparaît, produis un rapport et demande une décision précise ; ne supprime pas silencieusement d’items. Les 190 approbations sont rattachées au contenu exact : toute modification de fond nécessite une nouvelle approbation.

## 3. Importer et rendre activables les 190 QCM

- Utilise `01-BANQUE-190-QUESTIONS-ULTIME.json` comme source canonique et `08-VALIDATION-PROPRIETAIRE-190.json` comme décision du propriétaire. Les sous-banques et le CSV sont des exports ; ne compte pas leurs entrées plusieurs fois.
- Adapte **additivement** le modèle éditorial existant. Les lots V1.3 antérieurs suivent `src/lib/quiz-v13-editorial.ts`, des rapports liés à un hash et des statuts spécifiques : adapte le schéma pour accepter `owner-approved` **sans rendre automatiquement vraies les cases de collation des sources**. Conserve les protections de questions jamais approuvées. Ne réutilise pas les signatures SHA des 150 QCM V1.2 pour les nouveaux QCM.
- Une fois les vérifications bloquantes résolues, rends ces 190 QCM disponibles dans les deux quiz du niveau Ultime. Les totaux attendus **si aucun doublon avec le dernier main** : **150 pour Bidāyat al-Mujtahid**, **60 pour al-Istidhkār**.
- **ATTENTION au plafond technique actuel** : `src/lib/quiz-draw.ts` expose `MAX_APPROVED_POOL = 100` et rejette toute banque au-dessus de 100. La *Bidāya* aura **150** questions. Adapte ce plafond de façon sûre (par exemple une limite paramétrée ou >= 150), ajuste les contraintes éventuelles dans le moteur, l’UX et les tests, et assure un tirage uniforme **sans remplacement de 10 parmi 150**. Ne tronque pas à 100 et ne supprime pas les dix historiques.
- Pour *Al-Istidhkār*, tirer **10 parmi 60**. Le tirage est stable pendant une tentative et renouvelé à « Rejouer », avec score /10 et corrections sourcées affichées après réponse.

## 4. Non-régression

Préserve le menu Quiz → `/quiz/niveaux`, la suppression de l'ancien quiz classique, les quinze livres, les parcours et le moteur de quiz. Préserve toute la boutique : produits, prix et stocks en cours, panier, commandes, livraison, Stripe TEST, Resend, Prisma/Neon, sauvegardes, sécurité, CI et Vercel. Aucune écriture ni migration sur Neon Production.

## 5. Tests et livraison

- Vérifie JSON, 190 IDs distincts, quatre choix distincts, réponse juste et source pour chaque QCM ; cohérence du rapport d’approbation et des deux SHA-256.
- Tests de sélection 10/150 et 10/60 ; non-répétition au sein d’une partie ; stabilité/replay ; score /10 ; citations RTL ; absence de divulgation d’éléments non approuvés ; protection des quinze parcours.
- Exécute les tests unitaires, lint, TypeScript, build et Playwright. Toute base de test PostgreSQL doit être jetable et **distincte de Production**.
- Ouvre une **Pull Request non fusionnée**, indique les nombres effectivement importés, les tests exécutés, les éventuelles collisions et les vérifications de sources encore non attestées.
- **Aucune fusion ou mise en Production sans mon accord distinct.**

Commence par lire `00-LIRE-EN-PREMIER.md` et `08-VALIDATION-PROPRIETAIRE-190.json` du ZIP.
