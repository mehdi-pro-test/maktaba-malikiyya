# Maktaba Malikiyya — V1.4, administration privée (UN SEUL ADMIN)

## Objectif et livraison

Construire un **espace privé `/admin`**, moderne sur ordinateur et mobile, permettant au propriétaire seul de piloter la boutique et les quiz existants : **tableau de bord, commandes, préparation/expédition, livres et couvertures, prix et stocks, questions-réponses et sources**.

**Une seule identité administrateur**, initialement. Aucune création de compte client, aucun inscription publique, aucun rôle collaborateur ni console multi-utilisateur dans cette V1.4.

**Le ZIP comprend exclusivement la documentation et le prompt Codex ; aucun code applicatif ni question religieuse nouvelle.** Codex récupère le code source sur GitHub, vérifie les changements depuis l'instantané observé, et propose une PR. Il ne fusionne ni ne déploie de lui-même.

- Dépôt : https://github.com/mehdi-pro-test/maktaba-malikiyya
- Site : https://maktaba-malikiyya.vercel.app
- Révision `main` observée le **26/10/2026** : `d29c6dfe7862fcd8b34ef00b7543512914bc4d7d` ; **ne jamais supposer que c'est encore le HEAD**.
- Stack observée : Next.js 16.4.3, React 19.2, Prisma 7.10.1/PostgreSQL (Neon), Stripe **TEST uniquement**, Resend, Tailwind 4, Vitest, Playwright, Node 24, Vercel.

## Lire dans cet ordre

1. `00-COMMENCER-ICI.md` — périmètre, règles impératives et commandes.
2. `01-AUDIT-EXISTANT.md` — fichiers réels du dépôt, enjeux et non-régression.
3. `02-CADRAGE-PERIMETRE.md` — fonctionnalités obligatoires et hors-périmètre.
4. `03-UX-UI.md` — structure moderne et parcours administrateur.
5. `04-SECURITE-ADMIN.md` — compte unique et sécurité de chaque action.
6. `05-COMMANDES.md` — paiement vs exécution logistique.
7. `06-STOCKS.md` — disponibilité, réservations et journal d'inventaire.
8. `07-CATALOGUE-IMAGES.md` — fiches livres, descriptions et médias persistants.
9. `08-QUIZ-EDITORIAL.md` — gestion sans casser les banques JSON et le quiz global.
10. `09-ARCHITECTURE-MIGRATIONS.md` — plan de données, compatibilité, déploiement.
11. `10-TESTS-RECETTE.md` — scénarios de recette et critères d'acceptation.
12. `11-DEPLOIEMENT-ET-EXPLOITATION.md` — sécurité de livraison et rollback.
13. `12-DECISIONS-HYPOTHESES.md` — arbitrages choisis, questions bloquantes pour Codex.
14. `PROMPT-CODEX-V1.4.md` — prompt autonome à coller dans Codex.

## Règles impératives

- Ne pas toucher à `main`, ni au site de Production ou à la base Neon Production avant validation explicite du propriétaire ; créer une PR non fusionnée.
- Aucune migration destructive, aucune réinitialisation, aucun remplacement des commandes, stocks, anciens IDs/slugs ou questions existantes.
- Ne jamais confondre `PAID` (fait Stripe) avec `SHIPPED` / `DELIVERED` (étapes logistiques admin).
- La disponibilité vendable est **stock physique – réservations actives**, pas le stock brut.
- Les questions JSON déjà publiées constituent un socle historique immuable ; la V1.4 ajoute une couche DB de gestion, de versions et d'archivage.
- Tout accès en lecture **et en écriture** sous `/admin` exige une session propriétaire vérifiée côté serveur. MFA obligatoire ; pas de mot de passe en dur, pas de connexion fictive.
- Le projet demeure **Stripe TEST** ; jamais passer automatiquement en live.
- Aucune écriture sur disque éphémère Vercel pour les images persistantes ; utiliser un objet storage privé/contrôlé et une URL autorisée.
- Les champs de prix sont en **centimes entiers EUR**, sans float.
- N'ajouter aucune question doctrinale inventée : l'admin permet au propriétaire de rédiger, corriger et publier ses propres contenus sourcés.

## Acceptation attendue

Application fonctionnelle, vrais CRUD sécurisés, migrations additives validées localement, tests verts, UI accessible, audit des actions sensibles, et PR détaillant tests, migrations, risques, mise en service et rollback. Pas de maquettes statiques, mocks de commande ni formulaires qui ne sauvegardent rien.
