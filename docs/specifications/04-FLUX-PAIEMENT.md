# 04 — Parcours de paiement, stock et courriels

## Hypothèse de lancement

**Paiement exclusivement Stripe TEST** ; achat fictif, aucun prélèvement bancaire réel. Boutons et messages indiquent clairement la simulation. La configuration de production/Live est intentionnellement bloquée.

## Flux nominal

1. Client remplit panier et formulaire de livraison invité.
2. `POST /api/checkout` valide email, lignes, quantités, pays, et recalcule les montants selon les règles métier.
3. Transaction base de données : créer la commande `PENDING_PAYMENT`, ses lignes figées et réserver les quantités sous contrôle de concurrence.
4. Créer une Stripe Checkout Session avec moyens `card`, devise EUR, produit + livraison côté serveur, metadata contenant uniquement l'identifiant de commande (pas l'adresse complète). Lier l'ID session à la commande. Session courte configurée selon minimum pris en charge par Stripe ; réserver jusqu'à certitude d'expiration ou de paiement.
5. Rediriger le client vers Stripe Checkout TEST.
6. Le webhook signé `checkout.session.completed` avec statut payé (ou événement Stripe de paiement approprié confirmé selon le mode choisi) valide l'état ; la transaction serveur passe commande à `PAID`, soustrait `stockOnHand` une fois, marque les réservations `CONSUMED` et enregistre un envoi email à effectuer.
7. Envoyer email de confirmation via Resend avec idempotence et réessai prudent. La page retour interroge l'état serveur et montre **« en attente de confirmation »** tant que le webhook n'est pas traité.
8. Réconcilier les sessions expirées et les événements webhook non livrés. Ne pas décrémenter définitivement le stock pour un abandon.

## Stock, concurrence et retards

La réservation est nécessaire pour éviter que 10 exemplaires soient vendus à 15 visiteurs simultanés. Les opérations de réservation se font dans une transaction atomique qui empêche `reservations actives > stockOnHand`. À la confirmation, l'unité passe de réservée à vendue. Lors d'une expiration vérifiée, libérer la réservation. Ne pas libérer uniquement parce que `expiresAt < now` sans vérifier la situation chez Stripe : un webhook peut être retardé. En cas d'événement inattendu (paiement validé mais réservation déjà libérée), marquer `REQUIRES_REVIEW` avec action de compensation documentée ; **ne pas expédier automatiquement** ni décrémenter en négatif. Tester cette course.

## Doublons et panne

- `stripeEventId` unique et transitions conditionnelles atomiques.
- Le traitement du webhook doit être rejouable. N'accuser réception qu'après persistance durable du résultat à reprendre ; si échec temporaire, retourner l'erreur adaptée pour permettre le retry Stripe.
- Envoi mail après commit, idéalement via table outbox `EmailDelivery`/job de réessai. Un échec d'e-mail ne doit ni annuler une commande payée ni mener à un deuxième débit/retrait de stock.
- Journaux techniques sans carte, clé secrète, adresse complète ou autres données inutilement sensibles.

## Tarification livraison

- France **métropolitaine** (valider code pays + politique pour territoires ultramarins) : sous-total produits 0..4999 centimes → 400 centimes ; >=5000 → 0.
- Pays européens *explicitement activés* hors France métropolitaine : 2000 centimes, quel que soit le panier.
- Tout autre pays : checkout refusé avec message intelligible.
- `Colissimo à domicile` est une **intention commerciale**. V1 ne crée pas automatiquement d'étiquette de transport ni de devis Colissimo ; ne pas afficher des délais garantis non vérifiés.

## Emails et expéditeur provisoire

- Contenu : numéro de commande, liste quantités/prix, sous-total, livraison, total, adresse de destination selon nécessité, mention « Paiement de test — aucune somme débitée ».
- `RESEND_FROM_EMAIL` configurable ; **ne pas inventer** une adresse d'envoi en production ni promettre des emails à tout client avant vérification d'un domaine et des règles de compte Resend.
- En environnement local sans Resend configuré : adapter de développement (journal de message sans donnée sensible ou boîte de test) clairement identifié. S'assurer que le mail réel part seulement si le fournisseur et l'expéditeur sont utilisables ; sinon état « non envoyé » et rapport de configuration.

## Tests manuels Stripe

1. Démarrer DB et serveur ; seed 10 exemplaires chacun.
2. Configurer Stripe test et l'outil de transfert webhook local si disponible.
3. Commander 1 Coran en France : 14 € ; utiliser la carte test fournie officiellement par Stripe (ne pas saisir de vraies coordonnées bancaires).
4. Vérifier webhook signé, `PAID`, stock passe à 9, confirmation email si environnement email vérifié ; rejouer le webhook, stock reste à 9 et aucun second email.
5. Tester annulation, expiration, panier 5 Corans (50 € livré en France), livre Bukhari (100 € livré), commande UE (20 € supplémentaires).
6. Tester stock épuisé, checkout simultanés et session abandonnée.

**Ne jamais activer les paiements réels sans validation expresse du propriétaire du projet.**
