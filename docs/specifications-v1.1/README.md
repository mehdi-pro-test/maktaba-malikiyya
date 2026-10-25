# Maktaba Malikiyya — Package Product & Tech V1.1

**Destinataire : Codex / équipe technique**
**Version :** 1.1 — 25/10/2026
**Projet existant :** https://github.com/mehdi-pro-test/maktaba-malikiyya
**Environnement :** https://maktaba-malikiyya.vercel.app

## Objet

Faire évoluer le dépôt **existant**, sans réécrire la boutique V1. La V1.1 introduit :
1. Nouvelle entrée principale **Livres** avec **Coran, Hadith et Fiqh comme sous-catégories** ; futur catalogue extensible.
2. Ajout de **Mukhtasar al-Akhdari** (مختصر الأخضري) dans Fiqh, **brouillon non achetable** tant que prix, stock et édition ne sont pas confirmés.
3. **Vraies photographies de couverture en référence** pour les trois ouvrages, issues de pages sources (URLs documentées, et droits/édition à valider avant publication). Les illustrations SVG de V1 restent en repli.
4. Rubrique **Quiz** à l'interface originale inspirée de l'ergonomie d'un jeu de type GeoGuessr (gros choix cliquables, progression, couleurs, score), sans copie d'identité visuelle.
5. Quiz *prévu pour 10 questions*, dont **2 données par le Product Owner** et **8 emplacements brouillon**. Seules les 2 vraies questions sont jouables tant que les 8 autres ne sont pas transmises.
6. Améliorations V1.1 : mini-panier, message de progression vers livraison offerte (FR), meilleure confirmation de commande, responsive et accessibilité.

## Documents

- `01-CAHIER-DES-CHARGES-V1.1.md` : objectifs, périmètre, règles de gestion, critères d'acceptation.
- `02-UX-UI-PARCOURS.md` : structure de navigation, écrans et interactions.
- `03-CATALOGUE-ET-COUVERTURES.md` : données livres et **liens exacts vers couvertures réelles**.
- `04-QUIZ-SPECIFICATIONS.md` : comportement, questions, scoring, accessibilité et anti-copie.
- `05-ARCHITECTURE-MIGRATION.md` : intégration dans le code existant, contraintes DB et routes.
- `06-RECETTE-TESTS.md` : tests essentiels et matrice de conformité.
- `07-DEVOPS-DEPLOIEMENT.md` : CI, contrôle des environnements, sécurité et déploiement.
- `08-BACKLOG-ROADMAP.md` : lots prioritaires et hors périmètre.
- `data/quiz-v1.1.json` : 2 questions actives, 8 brouillons non exposables.
- `data/cover-references.json` : pages source + URLs de photos de couverture à vérifier.
- `PROMPT-CODEX.md` : prompt prêt à copier-coller.

## Décisions PO verrouillées

- Site français pour étudiants en sciences islamiques ; ouvrages en langue arabe ; marque Maktaba Malikiyya/Malikiya, conserver orthographe actuelle du site à moins de décision ultérieure.
- Produits V1 préservés : **Coran (Moshaf) 10 € ; Sahih al-Bukhari 100 €** ; stock V1 initial 10 de chaque, sans réinitialisation des valeurs actuellement stockées.
- Livraison : **France métropolitaine 4 €, offerte à partir de 50 € de sous-total ; Europe autorisée 20 €**.
- Invité sans compte ; Stripe **TEST UNIQUEMENT** ; emails de confirmation via Resend si configuré ; Vercel et PostgreSQL/Prisma existants.
- Aucune page admin en V1.1 ; ne pas passer au paiement réel.

## Non résolu — bloquant seulement pour ces fonctionnalités

- **Prix, stock et édition de l'Akhdari non fournis** : le créer comme produit Fiqh **brouillon / prochainement**, jamais avec un tarif ou une quantité inventée ; ne pas permettre de l'acheter.
- **8 questions du Quiz manquantes** : créer 8 slots `draft`, ne pas afficher de faux QCM au public et ne pas dire « 10 questions jouables ».
- **Droits des visuels tiers et correspondance des éditions** : voir guide couvertures. Une URL publique d'image n'accorde pas automatiquement le droit de la republier. Prévoir remplaçabilité et repli SVG ; pour une mise en vente réelle photographier le stock effectivement détenu ou obtenir l'autorisation du titulaire.
- Les tests Stripe et emails externes doivent encore être validés sur le déploiement : la V1.1 n'est pas un feu vert pour production.

## Utilisation

1. Dézipper le dossier, le fournir à Codex dans le contexte du dépôt existant.
2. Lui communiquer `PROMPT-CODEX.md`.
3. Vérifier qu'il ouvre une branche `feat/v1.1-livres-quiz` et ne modifie pas les secrets ou les données de commande.
4. Valider les captures responsive, les tests automatisés, puis relire la PR avant fusion.
