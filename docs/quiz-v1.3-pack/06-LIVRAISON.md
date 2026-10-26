# Livraison de la reprise éditoriale V1.3 — ZIP unique

## Inventaire exact

Le ZIP est **une copie intégrale de la branche de documentation GitHub** dérivée du site V1.2 courant, accompagnée de ces ajouts sous `docs/quiz-v1.3-pack/`. **Aucun code applicatif ni donnée de commande modifiés.**

- **150 QCM publiés** des quinze livres dans `src/data/quiz-v1.2/research.json` et leurs **150 validations enregistrées** dans `src/data/quiz-v1.2/reviews.json`.
- **90 nouveaux QCM rédigés**, 30 par matn débutant, dans `recherche-v1.3/*.json`. **Statut brouillon `research-draft`; non validés / non publiés.**
- **Exports CSV** des 150 anciens QCM et des 90 nouveaux pour lecture et contrôle des réponses, choix et citations.
- `MANIFEST-ET-ETAT-EDITORIAL.json` et `recherche-v1.3/MANIFEST-90-QUESTIONS.json` inventorient les données et contrôles, sans certifier la justesse doctrinale.
- Documentation complète et prompt `PROMPT-A-COLLER-DANS-CODEX.md`.

**Résultat : 240 questions rédigées dans l'archive, dont 150 déjà publiées et 90 nouvelles candidates.** Pour la cible prioritaire de 100 par matn débutant, il manque 60 questions par livre, soit 180. L'ancien ZIP de recherche contenant prétendument 300 questions n'a pas été retrouvé; il n'est pas présenté comme livré.

## Mission Codex

Seulement implémenter le tirage d'exactement 10 questions distinctes sans remplacement, réinitialisé à `Rejouer`, à partir des questions **publiées et autorisées**; si la banque comporte 10 items, elles restent jouables; si elle en comporte 100 à l'avenir, en sélectionner 10. Ne pas mettre en ligne les 90 brouillons, ne pas inventer des questions pour compléter les banques. Prévoir leur import après validation éditoriale dans une étape distincte.

## Protection et recette

Partir du dernier HEAD `main` réel, travailler en PR non fusionnée, préserver la décision du propriétaire de retirer le quiz classique (`/quiz` redirige vers `/quiz/niveaux`). Ne toucher ni aux prix/stocks, ni aux commandes, ni Stripe TEST, ni Resend, ni Prisma/Neon Production, ni sauvegardes. Exécuter format, lint, typecheck, unitaires, E2E desktop/mobile et tests PostgreSQL seulement sur une BD locale de test si besoin. Déclarer les échecs ou tests non exécutés. **Aucune fusion, migration Production ni mise en ligne sans accord.**
