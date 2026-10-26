# Recette et critères d'acceptation V1.4 — pas de faux vert

## 1. Sécurité de l'admin

- [ ] Compte inexistant : `/admin/*` redirige vers login ou retourne 401/403, **sans contenu** privé HTML/RSC/JSON.
- [ ] Seul compte propriétaire unique peut se connecter ; aucun signup ni email non autorisé.
- [ ] MFA obligatoire ; session sans second facteur refusée ; perte de session et logout révoquent l'accès.
- [ ] Appel direct à une Server Action ou API d'édition sans session retourne 401/403 et n'écrit rien.
- [ ] Tentatives répétées de login limitées ; pas de log de secrets/tokens ; pas de cache public d'admin.
- [ ] Pas de CSRF, injection SQL, XSS à l'enregistrement d'une description ou citation, upload dangereux, traversal ou URL distante arbitraire.
- [ ] Journal de toutes les mutations, aucun secret ni donnée de carte.

## 2. Tableau de bord

- [ ] Compteurs dérivés des **données réelles** d'une DB isolée ; zéro ne devient pas un exemple fictif.
- [ ] Commandes payées TEST distinctes de pending/expired/review ; délai et fus. `Europe/Paris` contrôlés.
- [ ] Alertes de stock : disponibilité = physique – réservations actives.
- [ ] Mobile, clavier, contrastes, libellés, chargement, erreur réseau.

## 3. Commandes

- [ ] Recherche, filtre, pagination, lecture détail commandes, suivi et export admin accessibles uniquement au propriétaire.
- [ ] Livraison/expédition autorisée uniquement si paiement `PAID`; `REQUIRES_REVIEW` jamais marqué livré artificiellement.
- [ ] « Marquer payée » n'existe pas ; aucune édition directe de `Order.status` depuis admin.
- [ ] Double clic sur expédier/actualiser ne crée pas deux événements ; traces d'audit cohérentes.
- [ ] Une modification du titre/du prix d'un livre ne modifie aucune ligne `OrderItem` historique.
- [ ] Le suivi client par token continue à fonctionner, réponse publique limitée.

## 4. Inventaire

- [ ] `onHand=15`, `reserved=4` ⇒ `available=11`, pas `15`.
- [ ] Vente payée du bon montant décrémente physique **une fois** et consomme réservation.
- [ ] `onHand=5`, `reserved=4`, admin demande `onHand=3` ⇒ opération refusée.
- [ ] Vente en parallèle d'un ajustement admin ⇒ pas de stock négatif/survente/perte de mise à jour.
- [ ] Ajustement `+3` envoyé 2 fois avec même clé ⇒ un mouvement et +3, pas +6.
- [ ] Chaque correction produit journal, motif, valeurs avant/après et acteur.

## 5. Catalogue / médias

- [ ] Modifier titre FR/AR, description et prix ; page publique synchronisée sans casse de route.
- [ ] Créer brouillon et publier, archiver livre lié à commande sans effacer son historique.
- [ ] Couverture PNG/JPEG/WebP validée, stockée sur stockage persistant et visible sur la boutique après publication ; reste après redéploiement.
- [ ] SVG, fichier trompeur/énorme, chemin traversal et upload non admin refusés.
- [ ] Modifier la couverture admin n'est pas contrecarré par `cover-references.json`.
- [ ] Impossible de mettre à jour le stock via l'édition livre hors journal transactionnel.

## 6. Quiz / non-régression pédagogique

- [ ] À overlay DB vide : **exactement le même inventaire publié qu'avant V1.4** (ID et contenu), même affichage des quinze ouvrages.
- [ ] Nouvelle question en brouillon n'apparaît ni au tirage par livre ni en global ni dans HTML/RSC public.
- [ ] Publication par admin unique : question valide et sourcée, traçabilité de validation propriétaire, aucune fausse certification du texte arabe.
- [ ] Éditer une publiée : ancienne reste jouable jusqu'à publication de nouvelle révision ; aucune mutation silencieuse des JSON / SHA d'origine.
- [ ] Archiver une question (nouvelle ou historique) : invisible des **nouvelles** tentatives ; restauration maîtrisée.
- [ ] Le global respecte `quiz-global-quality.json` + statut publié + nouveaux filtres ; n'expose pas d'item exclu.
- [ ] Tirage 10 parmi N, sans doublon, rejouer ⇒ nouveau tirage, score /10, correction et citation arabe inchangés.
- [ ] Admin archive une question pendant une tentative ⇒ tentative courante stable ; tentative suivante ne la prend plus.
- [ ] Ouvrage avec moins de 10 publiées ⇒ état indisponible honnête ; no data leaks.

## 7. Non-régression commerciale et plateforme

- [ ] Tests V1.1, V1.2, V1.3 antérieurs toujours exécutés et non affaiblis.
- [ ] Checkout invité, panier, livraison FR/Europe, `Stripe TEST`, signatures des webhooks, idempotence, réconciliation, Resend/outbox, stocks et commandes fonctionnent.
- [ ] Pas de migration destructive ni de reset ni accès écriture à Production pendant la recette.
- [ ] TypeScript, ESLint, Prettier, Vitest, build Next 16 et E2E Playwright desktop/mobile verts ; DB de tests isolée et jetable.

## Commandes de vérification indicatives

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
# tests d'intégration uniquement après configuration d'une DB LOCALE dédiée
npm run test:integration
```

Ne pas modifier/supprimer les tests existants pour obtenir un résultat vert. Déclarer honnêtement ceux non exécutés, l'environnement, les fixtures et les données non accessibles.
