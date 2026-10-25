# 08 — Check-list obligatoire avant passage en vente réelle

**V1 = simulation de commandes payées en Stripe TEST ; aucun argent réel.** Cette liste distingue une démonstration technique d'une vraie mise en vente accessible aux clients.

## Identité et obligation d'information

- [ ] Informations légales de l'éditeur, du vendeur, hébergeur, adresse/contact professionnel, identifiants d'entreprise applicables.
- [ ] Conditions générales de vente adaptées, parcours d'achat et mentions obligatoires précontractuelles.
- [ ] Politique de confidentialité, information RGPD, base légale des traitements, destinataires (Stripe, Resend, hébergeur), durées de conservation et exercice des droits.
- [ ] Politique de cookies/tracking adaptée aux scripts utilisés et consentement si nécessaire.
- [ ] Politique de retour, droit de rétractation et exceptions applicables, modalités de remboursement.

## Commerce / facturation / fiscalité

- [ ] Statut juridique et fiscal confirmé, prix final affiché selon régime de TVA pertinent et obligations de facturation.
- [ ] Vérification du régime TVA applicable aux ouvrages vendus et aux livraisons selon pays ; pas de présomption automatique.
- [ ] Liste précise des pays livrés ; éventuelles obligations transfrontalières, contraintes douanières/hors UE.
- [ ] Coûts et faisabilité réelle d'une expédition Colissimo à 4 € France / 20 € Europe, poids/dimensions et risque de frais supplémentaires.
- [ ] Engagement réaliste sur préparation, délais, traitement des retours, suivi colis.

## Sécurité / opérations / paiements

- [ ] Revue du système de réservation de stock, webhooks retardés, remboursements et rapprochement commandes/Stripe.
- [ ] Base chiffrée et sauvegardée, secrets gérés et rotation possible ; configuration emails de domaine vérifié.
- [ ] Hébergement et disponibilité, politique de logs, erreurs et supervision.
- [ ] Tests réels sur préproduction avec cartes **test** ; validation explicite du propriétaire avant toute bascule live.
- [ ] Photos et descriptions officielles confirmées, provenance des livres et droits de reproduction des visuels vérifiés.

**Important :** ces sujets nécessitent vérification à jour auprès de sources officielles et, si besoin, d'un professionnel qualifié. Codex doit laisser en place des placeholders explicites et éviter de publier de fausses mentions légales comme si elles étaient finalisées.
