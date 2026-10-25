# 07 — DevOps / déploiement sans rupture

## Principes

- Utiliser **le dépôt existant** `mehdi-pro-test/maktaba-malikiyya`; ne pas créer un nouveau dépôt.
- Créer `feat/v1.1-livres-quiz` depuis `main` à jour et développer avec commits conventionnels.
- Vérifier `AGENTS.md` avant modification ; pas de force push ni suppression de données.
- CI GitHub Actions : lint, typecheck, unit, integration PostgreSQL test, e2e Playwright, build. Aucune clé live dans la CI.
- PR vers main ; corriger avant fusion. La branche main observée auparavant était non protégée : proposer protection et checks exigés via configuration GitHub (action propriétaire requise si droits indisponibles).
- Vercel preview pour la PR, **base distincte** de la production ; contrôle manuel avant bascule.

## Base et migration

- Sauvegarde/validation avant une migration sur la base distante.
- Le runner SQL versionné existant utilise `_MaktabaMigration` ; **ne pas** mêler avec `prisma migrate deploy` sans analyse.
- Ne pas dépendre d'un build Next pour appliquer des migrations futures : commandes explicites dans un environnement de confiance selon README existant.
- Ne pas re-seeder les prix ou stocks de Coran et Bukhari ; Akhdari en brouillon.

## Configuration

- Garder Stripe en `sk_test_` exclusivement. Les secrets dans Vercel, jamais `.env` commité, GitHub issue, screenshot ou logs.
- Respecter les origin checks et signatures webhook ; ne pas simuler une transaction réussie côté client.
- Maintenir `SHIPPING_ALLOWED_COUNTRIES` et règles FR/Europe inchangées.
- Activer et vérifier l'ordonnanceur fiable de rapprochement Stripe et de retry Resend avant un test prolongé (scripts existants).
- Sur Vercel, vérifier URL, contenu des pages, accès DB réel et erreurs serveur ; un badge deployment succeeded n'atteste pas la commande.

## Privacy / conformité

- Quiz sans analytics nominatives ; cookies éventuels limités à la nécessité technique.
- Environnement V1.1 **démo**, pas de paiement réel, signalement test visible aussi sur mobile.
- Images de tiers : respecter copyright/licences et vérifier édition avant tout usage commercial ; privilégier prises de vue du stock personnel.
- Mentions légales/CGV/RGPD/TVA/retours doivent être prêts avant ouverture commerciale (hors V1.1).

## Livraison attendue de Codex

- URL de PR et liste commits, fichiers modifiés, migrations, scripts et détails pour appliquer sans effacer DB.
- Captures mobile/desktop, logs des tests (sans secrets), preuve des checks GitHub.
- URL preview Vercel **si déployée** et points non configurés.
- Liste courte des décisions ouvertes : prix/stock édition Akhdari, droits images, questions Q3-Q10.
