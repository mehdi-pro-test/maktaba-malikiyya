# Catalogue indisponible sur Vercel — 25 octobre 2026

La capture de `/coran` montre l’erreur de chargement du catalogue. Le propriétaire a confirmé qu’aucune base de données n’était connectée à Vercel. La base locale de développement n’est pas une base distante accessible depuis l’hébergement. Le correctif d’origine du checkout ne résolvait pas cette panne antérieure au panier.

## Préparation livrée

Le build Vercel utilise désormais `vercel:build` : il vérifie la connexion PostgreSQL, toutes les tables de la boutique et la présence d’un catalogue actif. Un déploiement sans base ne peut plus être annoncé réussi par ce build. Les diagnostics n’affichent ni URL de connexion ni identifiants.

Pour simplifier la première installation, un déploiement **Production** sur une nouvelle base complètement vide peut la préparer : génération Prisma, migrations transactionnelles versionnées et seed idempotent des deux produits. Une base avec des tables étrangères est refusée ; les previews n’exécutent jamais cette initialisation automatique. Les prochaines migrations restent une opération explicite. Les prix/stocks/commandes existants ne sont pas réinitialisés à chaque build.

La commande `vercel:setup` est également disponible pour une initialisation explicite sur une base dédiée, hors preview. Le README détaille la procédure. Aucune nouvelle base hébergée n’a été créée par l’agent : l’accès Vercel nécessaire n’est pas disponible ici.

## Validation locale

- Cinq tests PostgreSQL supplémentaires : base absente, tables manquantes, base vide autorisée pour initialisation, tables étrangères refusées, connexion impossible avec diagnostic sans identifiants.
- Tests unitaires, intégration, lint et typage exécutés.
- Initialisation explicite vérifiée sur la base locale existante sans reset des produits.
- Sur une nouvelle base PostgreSQL de test, un build en mode Preview refuse le schéma vide ; un build sous les variables Vercel/Production exécute l’installation initiale et le build Next.js.
- Ces tests locaux ne prouvent pas le fonctionnement de l’hébergement Vercel, auquel aucune base n’est encore connectée au moment de ce correctif.

## Action du propriétaire

Dans Vercel : créer une nouvelle base Neon/PostgreSQL depuis Storage, la connecter au projet et à Production, vérifier la présence de `DATABASE_URL`, puis redéployer `main` avec `npm run vercel:build`. Aucune valeur secrète ne doit être envoyée dans le chat. Stripe test et Resend demandent leur configuration séparée après cette remise en service du catalogue.
