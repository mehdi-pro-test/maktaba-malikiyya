# Recette V1.4

## Environnement et méthode

Exécution le 26 octobre 2026, Node 24, PostgreSQL 17 local. Aucun accès en écriture à Neon Production, aucun déploiement. Les intégrations utilisent `maktaba_test_v14`. Les parcours publics utilisent une autre base locale `maktaba_test_v14_public_e2e`. Les parcours admin créent puis détruisent automatiquement une base locale `maktaba_test_admin_e2e_*` ; mot de passe, clé MFA et secret sont aléatoires, conservés temporairement hors Git avec permissions privées.

Les navigateurs admin passent par le véritable mot de passe et le véritable TOTP Better Auth. Aucun bypass de connexion ni compte fictif dans l'application. Les commandes synthétiques des tests sont créées par les services commerciaux existants, avec événements de paiement de fixture, sans appel externe Stripe/Resend. Les tests d'intégration restent séquentiels pour ne pas partager des modifications concurrentes de fixtures.

## Résultats

| Contrôle                             | Résultat                                                              |
| ------------------------------------ | --------------------------------------------------------------------- |
| `npm ci`                             | Réussi                                                                |
| `npm run format:check`               | Réussi                                                                |
| `npm run lint`                       | Réussi, sans avertissement                                            |
| `npm run typecheck`                  | Réussi                                                                |
| `npm test`                           | **147 réussis**, 16 fichiers                                          |
| `npm run test:integration`           | **64 réussis**, 10 fichiers                                           |
| `npm run build`                      | Réussi                                                                |
| Playwright admin ordinateur + mobile | **4 réussis**, connexion et workflows complets                        |
| Playwright suite complète            | **132 réussis**, Chromium ordinateur/mobile, Firefox et WebKit mobile |

La suite complète est verte : **132 tests, aucun échec ni test ignoré**. Après finition des écrans commandes (filtre pays, colonnes et note lisible après clôture), lint, TypeScript et build ont été relancés ; les quatre parcours admin ont également réussi sur ce build final (filtre pays et note après livraison inclus).

## Couverture

- Sécurité : refus anonyme et mot de passe sans MFA, refus d'inscription, cookie HttpOnly/SameSite, origine étrangère, jetons absents des réponses JSON, limitation de tentatives, codes de secours à usage unique, expiration et révocation des sessions, changement de mot de passe. Les routes export et upload sont également privées.
- Stocks : réservations actives, refus sous le réservé, correction absolue périmée, clé idempotente réutilisée avec autre contenu, concurrence avec le paiement et invariant de quantité. Les journaux et audits sont atomiques et append-only.
- Commandes : paiement immuable depuis admin, transitions logistiques versionnées, refus sur paiement en attente, historique, prix/titre des anciennes lignes conservés après édition du catalogue.
- Catalogue : création brouillon, stock dans le module dédié, publication réellement visible sur le site, catégories autorisées, slug conservé. Les propositions anciennes sont préservées.
- Images : contrôle des fichiers, décodage/réencodage réel Sharp et contrat SDK Blob **simulé uniquement au niveau transport**. Versionnement et restauration contrôlés sur DB réelle. Sans stockage externe configuré, l'upload est explicitement refusé.
- Quiz : conservation des JSON et empreintes, brouillon non diffusé, ancienne publiée conservée pendant édition, publication/archives/restaurations atomiques, déclaration propriétaire distincte d'une vérification indépendante, rejet de contenu incomplet ou de choix dupliqués. Les exclusions globales restent actives. Banques DB de 201 questions et globales de 1 000 ; dix questions distinctes, score et parties stables.
- Navigateur : parcours complets sur mobile et ordinateur, captures examinées visuellement, contrôle axe sur le dashboard, publication sans redéploiement avec compteur par ouvrage et global, archive pendant une partie sans modification de cette partie, puis restauration. Les tests publics antérieurs restent dans la suite complète, y compris les quinze ouvrages et Rejouer.
- Migration : comparaison des colonnes historiques avant/après sur une fixture commandes/réservations/catalogue ; test commercial complet sur le schéma ancien sans les nouvelles tables. Aucun ancien SQL modifié.

## Limites et recette externe restante

Le stockage Blob réel n'est pas connecté dans cet environnement : la persistance après un redéploiement et le transport fournisseur ne sont **pas attestés**. Il faut configurer le jeton et le domaine puis faire cette recette sur une preview isolée. Aucun faux succès de téléversement n'est présenté.

Les tests de checkout, webhooks et e-mails exercent la validation, les signatures, l'idempotence et l'outbox en local, avec transport hors ligne. Aucun paiement Stripe externe ni e-mail Resend effectivement délivré n'est attesté dans cette livraison. Les protections et variables Stripe TEST existantes sont conservées.

L'adresse du propriétaire a été reçue et conservée hors Git. Son identifiant sera obtenu au bootstrap privé ; le secret d'authentification et le stockage doivent encore être configurés avant activation. Les migrations de Production, la fusion et le déploiement restent hors de cette livraison autorisée. L'import/export de questions, les graphiques avancés et la gestion de catégories ne sont pas implémentés.

Les premiers essais navigateur ont révélé des libellés ambigus et des sélecteurs visant du contenu masqué pendant la navigation : les noms accessibles des champs arabes ont été rendus explicites et les nouveaux tests ciblent le formulaire visible. Aucun ancien test n'a été supprimé ou désactivé pour obtenir le résultat.

La première exécution complète a aussi révélé une réponse HTTP 200 sur des slugs de quiz invalides après passage aux pages dynamiques (404 rendue après début du streaming Next.js). Un contrôle de routage limité au catalogue des quiz rejette ces chemins avant le streaming ; les quinze routes valides restent dynamiques. Les trois adresses invalides ont été revérifiées en HTTP 404, puis la suite complète relancée. Les assertions historiques 404 sont conservées.

Audit `npm audit --omit=dev` après correction ciblée de la dépendance transitive Zod : **0 vulnérabilité signalée**. Ce résultat concerne les dépendances de Production, pas une certification globale de sécurité. Le pack documentaire original est volontairement exclu du formatage automatique pour conserver ses empreintes, y compris ses espaces d’origine.
