# Décisions produit déjà prises et hypothèses opérationnelles

## Choix du propriétaire confirmés

- **Un seul administrateur** : pas de rôles, pas d'invitation d'équipe, pas de login client.
- La boutique et les quiz actuels fonctionnent ; la V1.4 doit être **additive** et préserver les ventes et questions déjà validées.
- L'admin doit gérer commandes, dashboard, stocks, livres et couvertures, titres, quantités, descriptions, quiz (ajouter/modifier/retirer des questions).

## Choix recommandés et inclus comme spécifications

1. **MFA obligatoire** pour le propriétaire, via solution reconnue compatible avec Next 16 ; pas de cryptographie maison.
2. Paiement `Order.status` **lecture seule** en admin ; suivi logistique séparé.
3. Stock modifié via mouvements audités sous le verrou commerce existant ; réservations intactes.
4. Livres et questions « supprimés » = **archivés**, jamais hard-deleted avec historique.
5. Couvertures admin persistantes dans stockage objet, droits d'usage à confirmer par admin.
6. Quiz historiques JSON conservés et **overlay DB** de révisions, pour édition et publication sans déploiement ; le mode global continue d'exclure les questions non autonomes.
7. Descriptions en français, arabe facultatif ; montants en EUR centimes.
8. L'admin **auto-valide** ses questions lorsqu'il clique « Publier », en enregistrant que la revue vient du propriétaire. Ne pas falsifier de relecture doctrinale indépendante.
9. Fonctionnalités introduites par étapes dans **une V1.4** avec feature flag, tests et activation distincte.

## Décisions nécessitant configuration (pas de motif pour inventer un secret)

- Adresse/identifiant exact du propriétaire, secret MFA et procédure de bootstrap : définis **hors Git** lors de la configuration du déploiement. Codex doit lister les variables puis demander au propriétaire de les configurer, sans deviner son adresse.
- Solution de stockage objets : choisir l'option compatible Vercel, en expliquant prix/limites et migration possible ; ne pas exposer la clé.
- Un domaine de staging et une DB de test isolée : à configurer sans jamais réutiliser Neon Production pour tests destructifs.

## Arbitrages si le temps manque

Livrer d'abord **vraie sécurité + commandes en lecture et suivi logistique + stocks + catalogue**, puis **quiz CRUD** dans le même périmètre projet, sans sacrifier les tests. Codex doit signaler les fonctions P0 non terminées et laisser leurs actions désactivées ; une maquette non connectée n'est pas une fonctionnalité livrée. Aucun déploiement direct sans validation.
