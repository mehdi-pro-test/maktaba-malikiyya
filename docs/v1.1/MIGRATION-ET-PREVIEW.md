> **Rapport historique de la première livraison.** Pour l’état actuel (PR fusionnée, déploiement, sauvegardes et finalisation), voir [FINALISATION.md](FINALISATION.md). Les mentions de limites d’accès et de preview ci-dessous décrivent l’état initial.

# V1.1 — Migration, preview et retour arrière

## Branches et sécurité

Développement sur `feat/v1.1-livres-quiz`, PR vers `main`. Aucun push V1.1 direct sur main. La base distante de Production n’est pas accessible depuis cet environnement ; elle n’a pas été migrée. Les commandes et stocks de la boutique en ligne restent sous la V1 tant que la PR n’est pas fusionnée après validation.

## Base de preview obligatoire

Créer une branche/base PostgreSQL **distincte de Production**, avec les droits nécessaires. Renseigner sa `DATABASE_URL` dans le périmètre Preview et, de préférence, pour cette branche Vercel uniquement. Vérifier la distinction chez le fournisseur : le simple fait de cocher « Preview » et « Production » sur une intégration ne prouve pas l’isolation des données.

Avant migration de toute base partagée : obtenir une sauvegarde restaurable chez le fournisseur ou un dump conservé dans un emplacement privé. Ni dump ni secret dans Git/PR/logs. Pour une nouvelle base Preview jetable vide, le seed crée les deux produits de démonstration uniquement si absents ; pour une copie de données existantes, il ne réinitialise jamais les stocks/prix.

Après avoir configuré la connexion de la **base isolée** dans un terminal de confiance :

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run vercel:build
```

Les migrations ne s’exécutent pas automatiquement dans un build Preview. Le contrôle de readiness exige les nouvelles tables et `Product.categoryId`. Une preview non préparée doit échouer plutôt que manipuler silencieusement la base de Production ou afficher un catalogue cassé. Ne pas contourner ce contrôle en remplaçant la commande de build par `npm run build` pour masquer un problème de base.

Les futures bases Production complètement vides bénéficient du bootstrap initial existant, qui applique les deux migrations ; une base Production V1 **existante** demande une migration explicite, après sauvegarde et validation de la PR.

## Vérifications avant et après

Conserver un relevé des IDs, prix et stocks des produits V1, du nombre et des états des commandes/réservations. Le seul changement attendu sur les produits existants est le nouveau rattachement `categoryId`. Vérifier Coran 10 € et Bukhari 100 €, stocks identiques à ceux relevés avant l’opération. Vérifier la fiche Akhdari sans prix et l’absence d’achat par API. Tester les webhooks Stripe test et e-mails uniquement avec les clés propres à cet environnement, jamais live.

Pour une recette prolongée, utiliser l’ordonnanceur de confiance existant pour `reconcile` et `email:retry` ; aucune nouvelle route d’administration publique n’est créée. L’accès fournisseur nécessaire à sa configuration n’est pas disponible ici.

## Retour arrière

Conserver le déploiement Vercel V1 qui fonctionnait avant la migration. La migration additive laisse les requêtes, prix et modèles V1 utilisables ; un client Prisma généré à partir du schéma V1 a été testé en lecture et transaction de réservation sur la base locale migrée. Les tests vérifient aussi la conservation intégrale d’une commande V1 et de ses lignes/réservations.

En cas de rollback applicatif, **promouvoir l’artefact Vercel V1 déjà construit**, sans supprimer les nouvelles tables ni inverser la migration. Le garde-fou de build V1 considère les tables inconnues comme étrangères : reconstruire cette ancienne révision contre une base V1.1 peut donc être refusé. Cette limite ne concerne pas l’artefact déjà construit, ni l’exécution des anciennes requêtes ; elle doit être prise en compte avant fusion. Ne pas effectuer de rollback destructif de base pour contourner ce garde-fou.

La restauration d’une sauvegarde de Production ou un rollback hébergé effectif n’a pas été testé : pas d’accès à la base ni à l’administration Vercel. La PR reste à relire et la preview complète à valider avant bascule.
