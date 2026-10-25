# V1.1 — finalisation et état opérationnel

État du 25 octobre 2026. Ce document remplace les limites historiques des rapports initiaux. Les spécifications archivées décrivent la commande d’origine ; les décisions ultérieures ci-dessous prévalent.

## Décisions du propriétaire

- Akhdari : 15 €, stock initial 15, édition **Maktaba Malikiyya**. La migration `202610250003_akhdari_active` convertit uniquement cette fiche en produit actif, conserve son id/slug et ne réinitialise aucun produit existant. Le seed reste non destructif.
- Quiz : dix questions. Les huit ajouts sont des formulations originales de faits vérifiés sur Doctrine Malikite, avec lien de source dans la correction et le récapitulatif. Il ne s’agit pas d’une copie de quiz tiers ni d’une validation par les auteurs des sources.
- Conserver les visuels SVG actuels. Aucune photo tierce téléchargée ou publiée. Une illustration SVG originale de secours est utilisée en cas d’échec du visuel ; si elle échoue également, un texte reste disponible.

## Livraison et preuves

La PR #1 a été fusionnée : `0c6bef0adbcef26d170105112d0749f3ed77c601`. La boutique de démonstration est publiée sur https://maktaba-malikiyya.vercel.app ; le quiz sur `/quiz`. Les migrations initiale et catégories ont été appliquées explicitement, d’abord à la Preview isolée puis à Production après sauvegarde. Les six tables métier ont été comparées avant/après. La Preview utilise la base `maktaba_preview_pr1`, branche Neon `br-super-dawn-b84rmysj`.

La CI de main sur ce commit est réussie : https://github.com/mehdi-pro-test/maktaba-malikiyya/actions/runs/40228518176. La livraison précédente a passé 65 tests unitaires, 34 intégration PostgreSQL, 28 E2E locaux et 16 E2E hébergés desktop/mobile sur Preview puis Production. Les tests Stripe/Resend y étaient simulés.

Résultats locaux de finalisation : **65 unitaires, 35 intégration PostgreSQL et 56 E2E réussis** (Chromium desktop/mobile, Firefox et WebKit mobile), typage, lint, formatage et build de production réussis. Les anciens échecs du quiz tactile ont conduit à corriger le défilement/focus et à réserver la grille compacte aux choix numériques.

La finalisation ajoute les tests de migration/activation idempotente d’Akhdari et la couverture Firefox/WebKit dans Playwright et la CI. Les résultats effectifs sont reportés dans la PR de finalisation et ci-dessous, sans assimiler WebKit émulé à un appareil Safari réel.

## État des dix tâches

| ID                | Réalisation et limite vérifiable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R01 Stripe        | Garde-fou TEST conservé, vérification de configuration ajoutée. L’appel Stripe depuis l’environnement retourne 401 ; la valeur disponible n’a pas le préfixe sk_test_. Les variables Stripe sont absentes de Vercel. Impossible d’activer honnêtement le paiement ou de faire la recette externe sans accès valide.                                                                                                                                                                                                                                 |
| R02 Resend        | Outbox et reprise conservées ; contrôle de configuration ajouté. L’appel de lecture Resend retourne 403, la valeur disponible n’a pas le format re_ et l’expéditeur n’est pas une adresse e-mail. Aucun e-mail réel revendiqué.                                                                                                                                                                                                                                                                                                                     |
| R03 Maintenance   | Workflow sécurisé `maintenance.yml`, deux jobs indépendants toutes les 5 minutes, concurrence sérialisée et contrôle de configuration. Activation conditionnée à MAINTENANCE_ENABLED=true et aux secrets. L’intégration GitHub refuse l’accès aux secrets Actions (403), donc activation non attestée.                                                                                                                                                                                                                                              |
| R04 Main          | Configuration exacte livrée dans `.github/branch-protection.json`. L’appel PUT de protection est refusé par GitHub (403), malgré le rôle administrateur du compte. Les permissions de l’installation/API ne permettent pas de modifier cette règle. Protection non activée.                                                                                                                                                                                                                                                                         |
| R05 Documentation | Rapports initiaux marqués historiques ; présent état et runbook mis à jour, décisions, accès et limites explicites.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| R06 Recette       | Chromium desktop/mobile, Firefox et WebKit mobile configurés ; audit axe et clavier automatisés. 56 parcours E2E passent sur les quatre projets. Safari sur appareil réel, VoiceOver/NVDA et réception d’e-mails restent des vérifications manuelles non revendiquées.                                                                                                                                                                                                                                                                              |
| R07 Quiz          | Dix questions actives complètes et sourcées ; compteur d’accueil dynamique, parcours réussite/échec et Rejouer étendus aux dix questions.                                                                                                                                                                                                                                                                                                                                                                                                           |
| R08 Akhdari       | Prix 1500 centimes, stock initial 15, édition propriétaire affichée ; migration transactionnelle ciblée, stable lors d’un rejeu ; ancien brouillon retiré.                                                                                                                                                                                                                                                                                                                                                                                          |
| R09 Visuels       | Décision de conserver les illustrations actuelles appliquée. Repli SVG local puis texte et alt adaptés. Aucune promesse d’édition physique tirée d’une photo tierce.                                                                                                                                                                                                                                                                                                                                                                                |
| R10 Reprise       | Nouvelle sauvegarde avant activation vérifiée. Snapshot V1 restauré dans une branche distincte, empreintes des six tables identiques ; migrations rejouées dans cette restauration. Workflow quotidien et politique de rétention sept jours livrés, activation automatique bloquée par l’accès GitHub Secrets. Le script de sauvegarde et sa vérification de restauration ont également été exécutés manuellement avec succès ; la planification reste inactive. Aucune restauration sur Production ni promotion rétrograde de Production exécutée. |

## Activation par un accès administrateur disposant des permissions nécessaires

Cette étape est un blocage de droits/configuration, pas une nouvelle demande d’autorisation utilisateur.

1. Configurer dans Vercel Production les clés Stripe TEST et le secret du webhook `/api/webhooks/stripe`, la clé Resend et l’expéditeur vérifié. Garder APP_URL cohérent avec le domaine public. Ne jamais utiliser de clé Stripe live.
2. Exécuter la recette Stripe hébergée : paiement de test, signature, doublon, session expirée, stock et confirmation. Utiliser une base de recette isolée, un destinataire autorisé et des coordonnées fictives. Vérifier réception et reprise Resend. Une réponse simulée ne remplace pas ces essais.
3. Avec un compte/token autorisé à gérer les secrets Actions, fournir `PRODUCTION_DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` et `NEON_API_KEY`. Ne pas les placer dans Git. L’environnement Codex ne les transmet pas automatiquement à GitHub/Vercel.
4. Définir `MAINTENANCE_ENABLED=true` et `BACKUPS_ENABLED=true` dans les variables du dépôt, lancer manuellement chaque workflow, vérifier leurs journaux. GitHub peut retarder un cron : ce n’est pas une garantie de délai de cinq minutes. Les échecs doivent rester visibles dans Actions et les notifications du propriétaire.
5. Appliquer la protection avec un accès GitHub approprié :

```sh
gh api --method PUT repos/mehdi-pro-test/maktaba-malikiyya/branches/main/protection --input .github/branch-protection.json
```

PR obligatoire, check `boutique` à jour, résolution des discussions, force-push/suppression interdits, règles appliquées aux administrateurs. Aucun contournement ou force-push prévu.

## Sauvegardes et exercice de reprise

- Snapshot initial pré-V1.1 : `backup-before-v1-1-20261025-195733`, branche `br-fancy-bonus-b8mvd0k1`.
- Snapshot avant activation Akhdari : branche `br-wild-boat-b8797owf`, vérifiée par empreintes des six tables métier.
- Restauration d’exercice : branche Neon `restore-check-finalisation`, distincte de Production. Les migrations V1.1 et activation y ont été rejouées après comparaison du snapshot restauré.
- Sauvegardes automatiques prévues à 02:23 UTC chaque jour, sept jours de rétention. Le script ne supprime que ses propres branches `backup-auto-*`, enfants directs de la branche Production, et jamais un snapshot manuel ou parent d’une autre branche. Une nouvelle sauvegarde doit exister avant toute rétention.
- L’activation du workflow quotidien attend la permission GitHub Secrets. Aucun rythme de sauvegarde automatique n’est revendiqué tant qu’un premier run n’a pas passé.
- Les snapshots restent dans le même projet Neon : une copie hors fournisseur n’est pas mise en place. Un snapshot ponctuel ne garantit pas un RPO commercial.

Retour arrière applicatif : conserver les artefacts prêts avant chaque publication, puis promouvoir l’artefact retenu depuis Vercel. L’artefact V1 d’origine est `dpl_4bahxjrYfpAk3aedFjQH2HkmZ5WG`; celui de la première V1.1 est `dpl_DVz7cwd1tovNprwebzHi14qJWDxt`. Ne pas inverser les migrations ni reconstruire V1 contre le schéma étendu : son ancien garde-fou peut refuser les nouvelles tables. Ne jamais écraser Production avec un snapshot sans analyser les commandes survenues depuis sa prise.

## Mesures de performance

Mesure locale du build de production, Chromium mobile émulé, trois contextes neufs par route, sans bridage CPU/réseau. Médianes LCP : accueil 908 ms, catalogue 504 ms, quiz 436 ms ; CLS maximal 0 sur les trois routes. Ce ne sont ni des mesures terrain ni un score Lighthouse. Rapport reproductible : `performance-local.json`, script `node scripts/measure-performance.mjs URL`. Ne pas extrapoler ces chiffres à une connexion mobile réelle.

## Sources éditoriales

Les explications nouvelles sont courtes et rédigées pour la boutique. Les liens sont affichés après validation et dans le récapitulatif ; aucun chargement tiers n’est nécessaire pour jouer.

- Q3–Q5 : https://www.doctrine-malikite.fr/Les-ablutions-humides_r57.html
- Q6–Q7 : https://www.doctrine-malikite.fr/Les-temps-des-prieres_r84.html
- Q8 : https://www.doctrine-malikite.fr/Facon-de-faire-la-priere_r47.html
- Q9–Q10 : https://www.doctrine-malikite.fr/Introduction_r63.html

## Avant ouverture commerciale

La boutique reste une démonstration et bloque les clés live. Mentions légales/CGV, identité vendeur, retours, fiscalité, rétention des données et supervision restent des chantiers séparés. Les clés communiquées dans le chat doivent être renouvelées par leur propriétaire ; leur rotation n’est pas attestée.
