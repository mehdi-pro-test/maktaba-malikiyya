# Administration propriétaire V1.4

Cette livraison ajoute un back-office privé. Elle ne l'active pas sur le site en Production. La branche part du `main` `d29c6dfe7862fcd8b34ef00b7543512914bc4d7d`. Le cahier des charges original est conservé, sans modification, dans [source/](source/00-COMMENCER-ICI.md). Les empreintes du manifeste et des trois migrations historiques sont testées.

## Choix techniques et audit

Le site existant utilise Next.js 16, Prisma/PostgreSQL, des réservations de stock sous verrou transactionnel, Stripe TEST, une outbox Resend, et des banques de quiz JSON. Ces éléments restent les sources de référence. Aucune nouvelle question religieuse n'est fournie par cette livraison.

- Better Auth gère mots de passe, TOTP, codes de secours, cookies et limitations persistées en DB. Il n'existe ni inscription publique, ni rôle supplémentaire. Le propriétaire est créé par CLI privée, avec adresse autorisée et contrainte DB d'unicité. Une session avec mot de passe seul n'accède jamais aux données métier.
- Les pages et chaque API de lecture/écriture vérifient le propriétaire. La preuve MFA est liée à la session : maximum 8 heures, inactivité 30 minutes. Les pages privées sont dynamiques, sans cache public et non indexables. Les écritures contrôlent l'origine, la taille et le schéma de la requête.
- Les commandes conservent leur statut de paiement. Seule la logistique est modifiable après paiement ; historique et idempotence sont enregistrés. Aucun remboursement automatique ni bouton pour déclarer un paiement réussi.
- Le stock utilise `commerceTransaction` et le verrou existant `741825`. Quantité physique, réservations et disponibilité restent distinctes. Une correction justifiée ne peut pas passer sous les réservations ; les nouvelles écritures possèdent une clé d'idempotence et un journal atomique.
- Les livres gardent leurs IDs et slugs. Créer un livre produit un brouillon sans stock. L'adoption d'une proposition conserve la proposition et ne transforme pas sa quantité proposée en inventaire. Les prix et titres déjà enregistrés dans les lignes de commande sont immuables.
- Les quiz utilisent les JSON historiques puis une couche DB de révisions. Un brouillon n'écrase pas la révision publiée. Publication, archivage, restauration d'une révision et retour au contenu historique sont explicites et journalisés. Les tirages prennent les nouvelles publications sans redéploiement. Les questions d'une partie déjà commencée restent fixes.
- Les 141 exclusions pédagogiques du tirage global restent appliquées. À couche DB vide : 610 questions historiques, 469 admissibles au global, quinze ouvrages. Le tirage DB/global n'est pas plafonné à 200 questions.
- Les preuves de vérification ne sont jamais inventées. « Collation déclarée par le propriétaire » reste une déclaration du propriétaire ; les nouvelles révisions n'acquièrent pas artificiellement les attestations des JSON d'origine.

Les anciennes migrations, les JSON religieux, leurs validations, les workflows de sauvegarde, les tarifs de livraison et la configuration de déploiement sont conservés. Pour permettre un retrait du code avant activation du nouveau schéma, les accès commerciaux utilisent explicitement les colonnes historiques lorsque `ADMIN_DATA_ENABLED` est désactivé. Une intégration crée une DB contenant uniquement les trois migrations anciennes et y exécute catalogue, réservation et paiement.

Le SDK Blob amenait indirectement Zod 4.1.11 via `@vercel/cli-config`, concerné par GHSA-mrhx-c7xc-m3w5. Un override ciblé impose Zod 4.6.7 ; la dépendance directe utilisait déjà cette version corrigée. Le verrou npm est régénéré et la recette est exécutée après une nouvelle installation propre.

## Parcours

`/admin/connexion` → activation TOTP obligatoire → tableau de bord. Navigation privée : commandes et détail, catalogue et livres, stocks et mouvements, questions et révisions, activité, sécurité du compte. Les formulaires sauvegardent réellement en DB ; aucun compte de démonstration n'est disponible dans l'application.

Les commandes sont paginées par 25 avec recherche et filtres ; l'export CSV privé est limité à 1 000 lignes, neutralise les formules et exclut les adresses. L'e-mail est absent par défaut, inclus uniquement avec `email=oui` explicitement demandé. Le journal général évite adresses, cookies, jetons et secrets. Le détail logistique privé conserve les informations de suivi nécessaires.

## Configuration et exploitation

Voir [CONFIGURATION.md](CONFIGURATION.md) et [RETOUR-ARRIERE.md](RETOUR-ARRIERE.md). La migration `202610260001_admin_unique` est additive et n'a été exécutée que sur des bases locales isolées. Les flags sont fermés par défaut. L'authentification du propriétaire, le stockage Blob et l'activation Production restent à configurer et à autoriser séparément.

La recette et ses limites sont consignées dans [RECETTE.md](RECETTE.md). Les filtres de période avancés du dashboard, l'import/export des questions et le CRUD de catégories ne sont pas inclus ; les catégories existantes sont sélectionnables. Le paiement et l'envoi d'e-mail externes ne sont pas certifiés par des fixtures hors ligne.
