# Recette V1.5

Contrôles locaux exécutés le 27 octobre 2026 :

- Formatage Prettier : réussi.
- ESLint : réussi.
- TypeScript : réussi.
- Tests unitaires : 153 réussis, 17 fichiers.
- Intégration PostgreSQL isolée : 72 réussis, 12 fichiers.
- Build Next.js de production : réussi.
- Playwright ciblé connexion/admin, ordinateur et mobile : 8 réussis.
- Suite complète Playwright : en cours ; bilan à compléter avant livraison.

Au redémarrage de l’environnement, une tentative d’intégration a échoué parce que le conteneur PostgreSQL local était arrêté. Après son redémarrage, les 72 tests ont été exécutés et réussis. Aucune base distante de Production n’a servi aux tests.

Une branche Neon preview séparée a reçu la cinquième migration. Les empreintes des huit tables commerciales ainsi que de User (colonnes historiques), Account, Session et TwoFactor sont identiques avant et après. Aucune migration de Production n’a été exécutée.

Les tests commerciaux couvrent notamment réservation de stock, concurrence, idempotence des paiements simulés, signature de webhook, montant serveur, frais de livraison, refus du mode live et réessai des e-mails simulés. Ils ne prouvent pas l’envoi effectif d’un e-mail ni un paiement réseau. Les bonnes réponses et sources des 610 questions sont comparées aux archives ; le score et la stabilité du tirage sont contrôlés.
