# Recette du mode global

Recette locale du 26 octobre 2026, sur la branche dédiée issue du commit main `5713c38f531354b2dc0dcf0decb091bf499ab6fc`.

| Contrôle réellement exécuté       | Résultat                                                  |
| --------------------------------- | --------------------------------------------------------- |
| `npm run format:check`            | Réussi                                                    |
| `npm run lint`                    | Réussi                                                    |
| `npm run typecheck`               | Réussi                                                    |
| `npm test`                        | 131 tests réussis, 10 fichiers                            |
| `npm run test:integration`        | 35 tests réussis, PostgreSQL local isolé                  |
| `npm run build`                   | Réussi ; nouvelle page et quinze routes ouvrages générées |
| `npm run test:e2e -- --workers=2` | 128 tests réussis sur les quatre profils (6,9 minutes)    |

Dépendances déjà installées dans l’environnement de travail ; pas de modification des dépendances ou du lockfile. La CI existante conserve son installation `npm ci`.

## Nouveaux contrôles

- Tirage pour N=9, 10, 200, 201, 610, 1 000 ; dix IDs distincts pour N≥10, absence de mutation, doublons refusés, RNG aux bornes et invalides contrôlé.
- Plafond individuel de 200 conservé ; aucune limite de 200 sur le global.
- 10 000 simulations avec graine fixe sur des groupes synthétiques de tailles différentes : inclusion et première position sans pondération par ouvrage.
- Agrégateur : ouvrages indisponibles non chargés, seules questions publiées retenues, doublons globaux refusés, nouvelles entrées sources automatiquement incluses.
- Projection réelle identique aux quinze pools autorisés, 610 IDs uniques et cinq niveaux ; compteur issu de cette projection.
- Action globale : dix objets seulement, lecture renouvelée du pool à chaque appel, pool insuffisant proprement refusé.
- E2E ajouté sur les quatre profils : carte, accès à la route, aucun corpus dans HTML ou scripts initiaux, dix questions stables, score 5/10, récapitulatif, citations arabes RTL, sources réelles, Rejouer avec un deuxième POST, score/sélection remis à zéro, échec réseau récupérable, chargement et double-clic protégés.
- Axe WCAG AA sur introduction et correction ; absence de débordement horizontal ; focus au début de partie. Le contraste de la mention éditoriale sur correction verte est renforcé uniquement dans la page globale.

## Non-régression exécutée

Les suites existantes couvrent l’ouverture et la correction d’une question dans chacun des quinze ouvrages, les scores 0/5/10, le replay, les QCM multiples, les brouillons, les mauvais slugs, la redirection 308 de `/quiz`, les cinq parcours, le catalogue à 320 px et la navigation clavier.

Les parcours boutique existants couvrent catégories, fiches, Akhdari à 15 €, panier, suppression, mini-panier et focus, livraison France/Europe, checkout invité, confirmation simulée, stock épuisé et images indisponibles. Les tests PostgreSQL contrôlent les scénarios de commandes, réservations, webhooks et e-mails selon les fixtures existantes. Ils ne prouvent pas un paiement Stripe externe ni un e-mail Resend réellement livré.

## Environnement et reprises

Base exclusivement locale : `postgresql://maktaba@127.0.0.1:5432/maktaba_test_v13`. Aucune commande sur Neon Production. Après les tests d’intégration, `npm run db:seed` a rétabli les données locales de recette avant Playwright.

Un premier passage incomplet a signalé un catalogue local vide après les tests d’intégration ; un second passage incomplet a identifié le contraste insuffisant d’une mention éditoriale dans une correction. Le catalogue local a été préparé et le contraste corrigé avant la nouvelle exécution complète. Ces passages interrompus ne sont pas comptés comme des succès.

Playwright utilise Chromium système, Firefox et WebKit locaux : profils `desktop`, `mobile` (Chromium iPhone 13), `firefox`, `webkit-mobile`. Clés Stripe/Resend neutralisées pour la recette UI. Captures desktop/mobile : carte, introduction, correction et résultat dans `captures/`.

Aucune fusion ni mise en Production effectuée. Le compteur applicatif est dynamique ; les valeurs 610 dans la recette décrivent ce corpus au moment du contrôle.
