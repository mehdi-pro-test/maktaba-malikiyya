# V1.3 — tests et non-régression

Recette du 26 octobre 2026. Branche technique non fusionnée, aucun déploiement. Environnement Node 24, Next.js 16.4.3, PostgreSQL 17 local.

## Contrôles effectivement exécutés

- Avant modification : 85 tests unitaires et build réussis sur `main@c25a206`.
- Génération Prisma, migrations existantes et seed : exécutés exclusivement contre la nouvelle base locale `maktaba_test_v13` sur `127.0.0.1:5432`. Aucun accès Neon Production requis.
- Unitaires : **103 tests réussis**, dont les tests existants conservés, deux séries de 1 000 tirages (pools de 10 et 100), RNG reproductible, copie non mutée, IDs uniques, limites de taille, score exact-match, parsing des 90 candidats, empreintes V1.2/pack, rapports indépendants et import futur synthétique de 90 questions additionnelles.
- Intégration PostgreSQL : **35 tests réussis** sur cette base isolée. Signatures/idempotence Stripe, stocks/réservations/expiration/concurrence, commandes/outbox, migrations et catalogue couverts par la suite existante.
- Lint, TypeScript, formatage et build : réussis. La CI effectue aussi `npm ci` depuis le lockfile inchangé.
- **Playwright : 108/108 tests réussis en un passage complet final (5,4 min)**, Chromium desktop/mobile, Firefox desktop et WebKit mobile émulé. Cela ne remplace pas un essai sur un iPhone physique. Les nouveaux cas vérifient les quinze ouvrages, l’introduction sans banque/brouillons, les tentatives serveur, la stabilité au rerender, les scores 0/5/10, les dix IDs uniques sur une banque synthétique de 100, Rejouer, les citations RTL et le réessai réseau.

Pendant la mise au point, un premier passage ciblé a échoué sur la lecture tardive d’un corps réseau de test (15/16 réussis). La collecte se fait désormais avant de remettre la réponse au navigateur. Le premier passage complet a relevé quatre sélecteurs de test ambigus entre le message d’erreur et l’annonceur Next.js, corrigés en ciblant le contenu principal, et une mesure tactile WebKit pendant un build lancé en parallèle. La recette finale est relancée après la fin du build, sans en lancer un autre pendant Playwright. Ces passages intermédiaires ne sont pas présentés comme des réussites.

Les tests synthétiques emploient exclusivement des questions fictives, des liens `example.test` et des approbations explicitement fictives ; ils n’activent aucun candidat réel.

## Boutique protégée

Aucun diff dans les données V1.2, le moteur de score, le catalogue, les fiches produits, les slugs, les règles de prix/stock/livraison, le panier/mini-panier, checkout, routes de commandes, Stripe, Resend/outbox, Prisma/migrations/seed, sauvegardes ou workflows CI. Le seul changement Vercel interdit l’auto-déploiement de la branche technique ; main conserve son comportement.

Les tests E2E existants couvrent découverte/catégories/produits, prix d’Akhdari à 15 €, panier et mini-panier au clavier, frais France/Europe, seuil de gratuité, formulaire invité, indisponibilité honnête du paiement, confidentialité de confirmation, e-mail échoué, accessibilité et 320 px. Leurs assertions commerciales sont conservées.

Les tests quiz qui supposaient l’ordre fixe du JSON identifient désormais la question effectivement affichée avant d’en vérifier les options, score et citation ; aucun test supprimé ni ignoré. `/quiz` reste une redirection 308 vers les niveaux, les quinze ouvrages et leurs URL sont conservés, le classique reste retiré.

Stripe et Resend sont simulés dans les tests métier ; les navigateurs emploient des clés vides pour vérifier l’état indisponible. **Aucun paiement Stripe hébergé ni envoi e-mail réel n’a été effectué.** Aucun test navigateur hébergé, aucune migration Production, aucun déploiement ni fusion.
