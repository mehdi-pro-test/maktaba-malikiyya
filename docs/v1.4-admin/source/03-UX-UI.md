# UX / UI admin — professionnel, moderne, sobre

## Principes de design

Conserver l'identité graphique de Maktaba Malikiyya sans confondre admin et boutique. Interface sobre, lisible, rapide, adaptée aux textes FR/AR et au mobile : fond clair ou neutre, hiérarchie forte, typographie lisible, cartes simples, tableaux filtrables, accent visuel maîtrisé, états de chargement/erreur/succès. Pas d'animations coûteuses ni de dashboard purement décoratif.

## Navigation recommandée

```text
/admin/connexion     → accès privé
/admin               → tableau de bord
/admin/commandes     → toutes les commandes
/admin/commandes/:id → détail, préparation, expédition, suivi
/admin/catalogue     → produits actifs / brouillons / archivés
/admin/catalogue/nouveau
/admin/catalogue/:id → fiche, visuels, prix et visibilité
/admin/stocks        → inventaire, réservations, mouvements
/admin/quiz          → niveau → ouvrage → questions
/admin/quiz/nouvelle
/admin/quiz/:id      → éditer, prévisualiser, versionner, publier, archiver
/admin/activite      → journal d'audit
/admin/compte        → sécurité, MFA, sessions, déconnexion
```

Ces chemins sont un contrat UX proposé ; Codex peut utiliser des segments techniques adaptés à Next 16 mais doit conserver des URL stables et documenter tout écart.

## Wireframe desktop : dashboard

```text
┌───────────────────┬─────────────────────────────────────────────────────────────────┐
│  M. MALIKIYYA     │ Tableau de bord                             Admin  Se déconnecter│
│  Administration   ├─────────────┬─────────────┬──────────────┬──────────────────────┤
│  Tableau de bord  │ Commandes   │ À préparer  │ Produits     │ Questions publiées   │
│  Commandes        │ payées TEST │             │ sous seuil   │                      │
│  Catalogue        ├─────────────┴─────────────┴──────────────┴──────────────────────┤
│  Stocks           │ Commandes récentes [recherche] [filtre]   │ Alertes de stock   │
│  Quiz             │ Référence  Date  Paiement  Expédition     │ Produits à réassort│
│  Activité         ├───────────────────────────────────────────┴──────────────────────┤
│  Mon compte       │ Dernières actions administrateur (date, cible, action)          │
└───────────────────┴─────────────────────────────────────────────────────────────────┘
```

## Responsive mobile

Menu repliable accessible ; cartes KPIs empilées 1 colonne ; commandes en cartes lisibles plutôt que tableau horizontal imposé ; gros champs tactiles ; formulaires par sections ; boutons Sauvegarder / Prévisualiser / Publier distincts ; contrôle du focus et validation explicite.

## Parcours-clés

**Commande** : liste → commande payée → voir détails → « En préparation » → « Marquer expédiée » (transporteur + référence éventuels) → log horodaté. Pas de statut de paiement réécrit.

**Stock** : liste → livre → `physique / réservé / disponible` → « Entrée » ou « Correction » → quantité + motif obligatoire → aperçus avant/après → confirmation → mouvement audité.

**Livre** : liste → créer/éditer → titre FR + titre AR, description, prix, catégorie, photo → prévisualiser → sauvegarder en brouillon / publier ; signaler les changements visibles par le client.

**Quiz** : niveau → ouvrage → recherche question → ajouter / éditer → quatre réponses, bonne réponse, explication et source arabe → aperçu learner → publier explicitement sous identité propriétaire → éligibilité recalculée, y compris mode aléatoire global.

## Accessibilité & états

Labels et erreurs liés aux champs, clavier complet, annonces ARIA, focus visible, RTL correct sur arabe, confirmation seulement pour mutations sensibles, erreurs sans réinitialiser le formulaire, skeletons utiles, accessibilité WCAG 2.2 AA visée. En cas d'échec réseau, aucune action ne doit paraître réussie tant que le serveur n'a pas confirmé l'écriture.

## Protection anti-erreurs

- Dates Europe/Paris ; montants en EUR avec formatage fr-FR.
- Badge visible « Paiement Stripe TEST » sur les KPIs et commandes ; ne pas simuler de production payante réelle.
- Prévisualiser la nouvelle couverture avant upload/publish ; tailles et types explicités.
- « Archiver » au lieu de « Supprimer définitivement » pour produits et questions.
- Si conflit d'édition détecté (version différente), afficher « modifié depuis votre ouverture, actualiser » et ne pas écraser.
