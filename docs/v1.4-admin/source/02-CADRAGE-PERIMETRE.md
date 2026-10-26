# Cahier des charges V1.4 — un propriétaire seul

## Fonctions obligatoires (P0)

| Module | Fonctions minimales réelles | Hors de portée / interdits |
|---|---|---|
| Connexion admin | Seul propriétaire, MFA, déconnexion, session sécurisée, anti-bruteforce, récupération sûre | Signup public, rôles multiples, mots de passe codés en dur |
| Dashboard | Commandes par statut, commandes à préparer, chiffre d'affaires **test**, alertes stock, dernière activité, accès rapide | Inventer des chiffres, présenter Stripe TEST comme vrais revenus |
| Commandes | Liste filtrable, recherche référence/e-mail, détail/produits/adresse, export CSV maîtrisé, préparation, expédition/suivi, commentaires internes | Changer `PAID` manuellement, falsifier Stripe, suppression des transactions |
| Stocks | Voir physique, réservé, disponible, seuil bas, entrées, inventaire, retours justifiés, journal des mouvements | Saisir arbitrairement un stock sous réservations actives |
| Catalogue | Liste, création d'un livre (brouillon), titre FR/AR, description, catégorie, prix, stock initial, publication/archivage, couverture upload et aperçu | Suppression physique d'un produit vendu, modification rétroactive des lignes de commande |
| Quiz | Catalogue questions par niveau/livre, recherche, ajout, édition, prévisualisation, publication propriétaire, désactivation/archivage, journal, import/export | Modifier les fichiers historiques comme « source de vérité » depuis le navigateur, injecter des questions non publiées dans le jeu |
| Audit | Qui/quand/quoi, ancienne et nouvelle valeur utile, motifs stock et décisions quiz, journal immuable | Suppression silencieuse des traces |

## Fonctions souhaitables (P1, uniquement si P0 solide)

- Filtres temporels du dashboard (7 jours, 30 jours, année) avec distinction état Stripe TEST.
- Actions groupées **non destructives** sur les questions (ex. archivage), avec aperçu et confirmation.
- Vue d'ensemble des questions « en attente », tri par chapitre, informations d'attribution et de source.
- Seuils de stock configurables par produit, et lien vers les produits en rupture.
- Export CSV des commandes (données personnelles : accès contrôlé, sélection des colonnes, aucun export public).
- Champ de note interne dans une commande, historique de préparation et suivi.

## Hors V1.4 explicite

Comptes clients, espace livreur, rôles collaborateurs, place de marché, facturation fiscale automatique, passage Stripe en live, création automatique de nouvelles questions par IA, refonte graphique de la boutique publique, analytique avancée de trafic, « module ERP » et promotions/coupons.

## Règles transversales

1. Les actions utilisent **la vraie BD**, pas un état local fictif.
2. Les compteurs se recalculent à partir des données autorisées et du bon statut ; le cache doit être cohérent après mutation.
3. Toute sauvegarde valide les champs en serveur via Zod et vérifie l'accès admin ; TypeScript côté client ne suffit pas.
4. Les mutations sont idempotentes lorsque nécessaire et gèrent la concurrence ; afficher des erreurs explicites, sans fuite de secret.
5. Les suppressions d'objets ayant de l'historique sont **logiques** (`archived`, `inactive`) et réversibles lorsqu'autorisé.
6. Aucune migration silencieuse ni secret dans Git.

## Définitions à afficher dans l'interface

- **Stock physique** : `stockOnHand` enregistré en BD, après paiements et mouvements.
- **Stock réservé** : somme des quantités sous réservations actives.
- **Stock disponible** : `max(0, physique - réservé)`.
- **Commande payée** : état de paiement provenant de Stripe (webhook ou réconciliation fiable), pas d'un clic administrateur.
- **Commande expédiée** : action logistique indépendante du paiement.
- **Question publiée** : éligible aux quiz concernés après validation et contrôles, pas simple brouillon enregistré.
