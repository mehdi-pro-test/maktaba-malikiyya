# Retrait et restauration sans perte de commandes

Pour fermer immédiatement l'administration, passer **`ADMIN_ENABLED=false`**. Cela coupe les pages métier et les API privées. Au besoin révoquer les sessions avec la CLI privée documentée.

**Après utilisation des publications DB, conserver `ADMIN_DATA_ENABLED=true` et `QUIZ_DB_ENABLED=true`.** Désactiver ces deux flags ferait réapparaître les contenus canoniques archivés et retirerait les nouvelles publications. Retirer l'accès admin et retirer la couche de données sont deux opérations distinctes.

Ne pas supprimer les tables et ne pas revenir à une sauvegarde ancienne par-dessus des commandes récentes. La migration est additive ; son retrait n'exige aucun SQL destructif. Un ancien binaire ne connaît pas les overrides de quiz ni les couvertures et descriptions admin : un rollback applicatif intégral après mise en service nécessite une analyse explicite des données publiées, pas un simple changement de flags.

- Quiz : republier une ancienne révision, restaurer une archive ou utiliser « contenu historique » pour revenir exactement au JSON d'origine. L'action est confirmée et journalisée ; les révisions ne sont pas effacées.
- Couverture : sélectionner un ancien fichier autorisé ; ne pas supprimer les fichiers utilisés.
- Stock : effectuer une correction compensatrice justifiée en tenant compte des réservations du moment ; ne pas réinjecter un inventaire périmé.
- Commandes : aucun effacement, aucune modification des lignes historiques ni paiement forcé. Un incident de paiement reste traité par les procédures Stripe TEST et de réconciliation existantes.
- DB : restaurer d'abord sur une base séparée et comparer ; toute intervention Production nécessite une autorisation explicite.

Les migrations historiques et les workflows de sauvegarde restent inchangés. Les journaux de stock, logistique et audit sont append-only par déclencheurs PostgreSQL.
