# 09 — Guide pour lancer le projet avec Codex

## Dans quel ordre ?

1. Télécharger/décompresser le ZIP. Le dossier contient le périmètre produit, l'architecture, la QA, DevOps et `PROMPT-CODEX.md`.
2. Ouvrir Codex dans le dossier local **où vous voulez créer le projet**. Si un dépôt différent est ouvert, demander à Codex de ne pas l'altérer et de créer `maktaba-malikiya` dans un autre dossier.
3. Mettre la documentation de ce ZIP à la portée de Codex : copier le dossier décompressé vers son espace de travail ou lui communiquer son chemin local exact.
4. Copier le texte de `PROMPT-CODEX.md` dans Codex.
5. Laisser Codex initialiser le projet, tester, créer le dépôt privé GitHub si autorisé, préparer Vercel et rédiger son rapport.
6. S'il demande des clés Stripe test, Resend, DB ou un accès Vercel, les fournir **uniquement via la configuration sécurisée de l'outil/environnement**. Ne jamais coller les secrets dans les fichiers suivis par Git ou dans un échange public.
7. À la fin, vérifier le compte rendu réel : lien du dépôt, chemin local, commandes testées, URL Vercel si déployée, manques à configurer.

## Commandes utiles de contrôle (après installation)

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Ces scripts doivent être effectivement créés par Codex. Si PostgreSQL ou Stripe ne sont pas configurés, Codex doit rendre disponibles les parties testables localement et déclarer honnêtement les validations non réalisées.

## Pour éviter les mauvaises surprises

- Ne jamais modifier les autres projets du compte `mehdi-pro-test`.
- Nouveau dépôt **privé** recommandé. Si impossible, demander l'autorisation avant de choisir un dépôt public.
- Pas de Stripe Live, pas de vrais paiements, pas de publication juridique trompeuse.
- Photos des livres : images réutilisables autorisées ou visuels neutres provisoires.
- Confirmer la liste des pays d'expédition et un email d'envoi vérifié avant les essais commerciaux à l'échelle de l'Europe.
- À défaut d'accès API nécessaire, Codex peut produire un prototype partiellement fonctionnel et une checklist des étapes restant à faire ; ne pas marquer la tâche « complètement déployée » dans ce cas.
