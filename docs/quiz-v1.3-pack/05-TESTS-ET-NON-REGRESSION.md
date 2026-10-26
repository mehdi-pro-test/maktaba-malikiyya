# Plan de validation et matrice de non-régression

## Avant développement

Capturer la liste de toutes les routes et fichiers existants, l'état Git, les tests et le build de base. Lire `AGENTS.md` et les instructions Next.js 16 locales. Vérifier le diff depuis le dernier `main`.

## Tests nouveaux

- Intégrité de la livraison éditoriale : 3 banques × 100, IDs globaux uniques, 4 options distinctes, bonne réponse présente, source et citation non vides, URL HTTPS, statut vérifiable, aucune anomalie bloquante.
- Comparaison contre V1.2 : ses 150 questions, 150 décisions de revue et SHA canonique sont inchangés. Test de non-duplication sémantique guidé par le registre d'alias; documenter les cas difficiles à trancher automatiquement.
- Tirage uniforme sans remise sur un tableau copié; 10 IDs uniques; reproductibilité avec RNG injecté.
- Stable pendant une partie; rendu/hydratation/retour arrière n'effectuent pas de nouveau tirage; Rejouer efface score et réponses et tire à nouveau.
- Score 0/10, 5/10, 10/10 ; mauvaise réponse, feedback, sources après validation et récapitulatif.
- Contournement de statut interdit : Production n'affiche que des questions approuvées; recherche en attente accessible seulement via Preview expressément autorisée, **jamais en production**.
- Quand moins de 10 éligibles : message honnête, pas de QCM inventé.
- 12 ouvrages hors débutant restent accessibles, avec leur V1.2 de dix questions inchangée et leurs URLs inchangées.
- `/quiz` redirige toujours vers `/quiz/niveaux`, nav header et accueil restent cohérents.
- Responsive, clavier, focus, RTL arabe, liens `rel=noopener noreferrer`, aria-live, pas de solution visible avant validation.

## Régression commerciale

Vérifier Accueil, Livres/Coran/Hadith/Fiqh, pages produits, panier, mini-panier, frais FR/UE, seuil France gratuité, commande invitée et état de confirmation, Stripe TEST, signatures et idempotence (tests hors réseau), réservations et stocks; workflow sauvegarde, seed/migrations inchangés. Aucun test supprimé, `skip`, ni assertion affaiblie.

## Commandes

À exécuter selon les dépendances du dépôt réel :

```bash
npm ci
npm run db:generate
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

**Intégration PostgreSQL destructrice : exclusivement base éphémère dont le nom contient `maktaba_test`.** Exemple :

```bash
DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test_v13 npm run db:migrate
DATABASE_URL=postgresql://maktaba@127.0.0.1:5432/maktaba_test_v13 npm run test:integration
```

Les commandes ne constituent pas une attestation de réussite : Codex doit donner les sorties réelles, erreurs et tests non exécutés. CI GitHub : ne pas modifier ses permissions sans raison; Preview Vercel avant Production; aucune migration Neon Production pour le quiz.