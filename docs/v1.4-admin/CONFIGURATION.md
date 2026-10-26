# Mise en service après autorisation distincte

## Variables

Ne jamais commiter leurs valeurs ou les transmettre dans un ticket.

| Variable                   | Utilisation                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | DB du déploiement ; base isolée pour preview/recette                                            |
| `ADMIN_DATA_ENABLED`       | `true` seulement après migration V1.4 sur cette DB ; active les champs commerciaux additionnels |
| `ADMIN_ENABLED`            | `true` ouvre l'accès privé, nécessite aussi le flag de données                                  |
| `QUIZ_DB_ENABLED`          | `true` applique les révisions DB aux quiz publics, nécessite aussi le flag de données           |
| `ADMIN_EMAIL`              | Adresse exacte autorisée du propriétaire                                                        |
| `ADMIN_USER_ID`            | ID retourné au bootstrap ; recommandé pour fixer l'identité en plus de l'adresse                |
| `BETTER_AUTH_SECRET`       | Secret durable aléatoire, au moins 32 caractères ; protège également les données MFA chiffrées  |
| `APP_URL`                  | Origine HTTPS exacte du déploiement, sans chemin ; HTTP seulement sur localhost en recette      |
| `ADMIN_BOOTSTRAP_PASSWORD` | Mot de passe initial privé, 14–128 caractères ; retirer après bootstrap                         |
| `ADMIN_RECOVERY_PASSWORD`  | Mot de passe de remplacement privé, uniquement pendant une récupération CLI                     |
| `BLOB_READ_WRITE_TOKEN`    | Jeton serveur du stockage Vercel Blob prévu pour ce déploiement                                 |
| `ADMIN_BLOB_HOST`          | Nom d'hôte exact du stockage public autorisé, suffixe `.public.blob.vercel-storage.com`         |

Les variables Stripe TEST, Resend et sauvegardes existantes restent inchangées. Aucun basculement Stripe LIVE. Un secret Better Auth perdu ou changé sans procédure invalide le déchiffrement MFA ; utiliser la récupération privée plutôt qu'une rotation improvisée.

## Ordre d'activation

1. Obtenir l'autorisation distincte pour le déploiement et toute migration sur la DB cible. Sauvegarder avec le workflow existant ; vérifier la possibilité de restauration sur une DB séparée. Ne jamais lancer de reset.
2. Répéter la recette sur une base preview isolée. Exécuter `npm ci`, `npm run db:generate`, puis `npm run db:migrate` avec **la DB explicitement choisie**. Le runner vérifie les empreintes existantes. Ne pas relancer `db:seed` sur Production pour configurer l'admin.
3. Configurer l'origine, l'adresse et le secret, puis `ADMIN_DATA_ENABLED=true`. Garder l'accès fermé pendant la préparation. Aucun compte n'est créé par la migration.
4. Depuis un environnement serveur privé relié à cette DB, configurer temporairement `ADMIN_BOOTSTRAP_PASSWORD`, puis exécuter :

   ```bash
   npm run admin:bootstrap -- --confirm-bootstrap
   ```

   Reporter l'ID retourné dans `ADMIN_USER_ID` et retirer le mot de passe temporaire de l'environnement. Le script refuse un second propriétaire. Le mot de passe, les cookies et les secrets MFA ne sont jamais imprimés.

5. Activer `ADMIN_ENABLED=true`, puis se connecter sur `/admin/connexion`. Enrôler l'application TOTP via l'URI privée, conserver les codes de secours hors ligne, valider un code. Aucune lecture métier avant cette validation. Pas de lien de récupération public ni d'inscription.
6. Activer `QUIZ_DB_ENABLED=true` avant toute publication de question et le conserver ensuite. Vérifier un brouillon, une publication, une archive et une restauration en preview, ainsi que les tirages et les compteurs publics.
7. Configurer Blob et réaliser un véritable upload, vérifier l'image publique après redéploiement. Sans le jeton et le nom d'hôte autorisé, l'upload reste bloqué ; il n'y a pas de stockage de remplacement sur le disque Vercel.

## Couvertures

Vercel Blob a été choisi pour sa compatibilité avec l’hébergement existant. Stockage, opérations et trafic peuvent être facturés selon le plan du compte ; contrôler les tarifs et plafonds dans le tableau de bord fournisseur avant activation. Le quota applicatif ci-dessous ne remplace pas ces limites. Les références de fichiers sont isolées en DB pour permettre un changement ultérieur de fournisseur après migration explicite des objets.

Limite fichier **3 Mio**, corps multipart limité à 4 Mio, compatible avec la limite de requête Vercel. PNG, JPEG, WebP seulement : signature, terminaison, décodage et taille sont contrôlés. Refus SVG, animation, fichier trompeur et image démesurée. Sharp applique l'orientation puis réencode en WebP sans métadonnées, au maximum 1 600 × 2 000 pixels. L'utilisateur doit attester ses droits et fournir un texte alternatif.

Le serveur choisit un chemin UUID ; aucune URL de téléchargement arbitraire n'est acceptée. La couverture admin autorisée est prioritaire sur les références historiques. Les versions précédentes sont conservées et restaurables. Contrôles de capacité avant upload : 250 Mio de fichiers référencés en DB et 50 fichiers par livre ; ce n'est pas une garantie de quota transactionnel du fournisseur. Si l'upload réussit puis que la transaction DB échoue, un objet orphelin peut rester : examiner le stockage et les références avant toute suppression manuelle. Ne jamais supprimer un objet référencé par un livre ou une version conservée.

## Récupération privée

Accès serveur et configuration du propriétaire requis. Les commandes révoquent les sessions et produisent une trace sans secret :

```bash
npm run admin:recovery -- --revoke-sessions --confirm-owner-recovery
npm run admin:recovery -- --reset-mfa --confirm-owner-recovery
# Configurer ADMIN_RECOVERY_PASSWORD hors Git avant cette commande, le retirer ensuite :
npm run admin:recovery -- --reset-password --confirm-owner-recovery
```

Les options de réinitialisation peuvent être combinées. Réinitialiser le MFA oblige à un nouvel enrôlement avant tout accès privé. Changer le mot de passe depuis le compte révoque également les sessions. Les codes de secours sont à usage unique ; les régénérer invalide l'ancien jeu.
