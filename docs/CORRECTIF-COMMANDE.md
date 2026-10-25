# Correctif du parcours de commande — 25 octobre 2026

Le propriétaire a signalé une impossibilité de commander sur `https://maktaba-malikiyya.vercel.app/panier` et a précisé que Coran/Hadith sont des catégories.

## Changements

- Les pages et badges des livres indiquent explicitement « Catégorie Coran » / « Catégorie Hadith ». Les produits restent Coran (Moshaf) et Sahih al-Bukhari ; les catégories filtrent le catalogue, sans ajout de faux produits.
- L’origine du checkout et les URL de retour reconnaissent les domaines de déploiement fournis par Vercel. Auparavant, sans `APP_URL`, le serveur utilisait localhost et pouvait refuser un checkout sur un site hébergé. Les origines arbitraires et les en-têtes Host du navigateur ne sont pas autorisés.
- Si la clé Stripe de test ou le secret webhook manque, le formulaire l’annonce immédiatement et désactive le paiement. Le serveur refuse aussi toute réservation sans secret webhook, pour éviter un paiement qui ne pourrait pas être confirmé automatiquement.

## Vérifications

Lint, typage, build de production, 36 tests unitaires, 21 tests d’intégration PostgreSQL et 12 tests navigateur réussis. Ces derniers vérifient l’ajout au panier, les quantités, le formulaire, l’indisponibilité de paiement annoncée, le filtrage par catégorie et la confirmation simulée. Les appels aux prestataires sont simulés dans les tests ; aucun paiement Stripe hébergé n’est attesté.

## Ce qui reste à diagnostiquer sur Vercel

L’API GitHub indique un déploiement Vercel réussi pour la version initiale. L’accès HTTP direct au site depuis cet environnement est refusé par son proxy réseau (403 CONNECT), y compris avec l’exécution hors sandbox. Le domaine a été ajouté au brouillon d’autorisation réseau ; cette sauvegarde ne signifie pas qu’il est déjà accessible.

La cause exacte du signalement utilisateur ne peut donc pas être attribuée avec certitude à ce défaut d’origine ou à une configuration de service. Le message affiché dans le panier reste nécessaire pour distinguer panier vide, base indisponible et paiement indisponible.

Pour activer les commandes Stripe test sur Vercel, il faut une base PostgreSQL distante `DATABASE_URL` avec migration/seed appliqués, une clé `STRIPE_SECRET_KEY` commençant par `sk_test_`, un endpoint Stripe test `/api/webhooks/stripe` et son `STRIPE_WEBHOOK_SECRET`. Saisir les valeurs dans la configuration sécurisée du service, jamais dans Git ou le chat. Après modification des variables Vercel, redéployer. Les variables du poste local ne configurent pas Vercel.

Les nouveaux tests locaux et un build hébergé réussi ne doivent pas être présentés comme la preuve que la commande fonctionne sur le déploiement public.
