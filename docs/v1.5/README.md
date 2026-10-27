# V1.5 — Connexion commune et distracteurs sérieux

Branche : `feat/v1.5-connexion-quiz-serieux`, issue de `main` au commit `addaf718b068f9c248542bf12186a09d45cf5024`.

## Révision éditoriale

Le propriétaire a explicitement délégué la validation éditoriale. Cette délégation ne constitue pas une nouvelle attestation de collation des citations ou d’attribution. Aucun indicateur de vérification des sources n’a été artificiellement activé.

610 questions relues, 476 questions révisées, 1 408 mauvaises propositions effectivement modifiées et 13 énoncés précisés. Les 134 autres questions restent inchangées. Les bonnes réponses, identifiants, citations et références sont conservés. Les quinze ouvrages et les 469 questions éligibles au mode global sont préservés ; les exclusions existantes restent applicables.

| Ouvrage (identifiant)      | Questions relues | Questions révisées |
| -------------------------- | ---------------: | -----------------: |
| al-achmawiyya              |               40 |                 34 |
| al-istidhkar               |               60 |                 47 |
| al-mouqaddima-al-izziyya   |               40 |                 31 |
| al-waraqat-sharh-al-hattab |               10 |                  4 |
| ar-risala-ibn-abi-zayd     |               40 |                 31 |
| ashal-al-masalik           |               40 |                 29 |
| bidayat-al-mujtahid        |              150 |                131 |
| hashiyat-al-dasuqi         |               40 |                 33 |
| issal-as-salik             |               10 |                  3 |
| maraqi-as-suud             |               10 |                  5 |
| matn-ibn-ashir             |               40 |                 28 |
| moukhtassar-al-akhdari     |               40 |                 30 |
| moukhtassar-khalil         |               40 |                 36 |
| murtaqa-al-wusul           |               10 |                  3 |
| sharh-al-dardir            |               40 |                 31 |

Les distracteurs utilisent désormais des confusions du même domaine : causes du ghusl et des ablutions, critères juridiques concurrents, auteurs malikites, conditions et modalités d’un même acte. Les énoncés ambigus sont précisés sans modifier leur bonne réponse. Les choix sont mélangés une seule fois côté serveur au lancement ; leur ordre reste stable pendant la partie et le score utilise les identifiants.

Les archives historiques restent intactes. `historical-input-sha256.json` permet de contrôler leurs empreintes ainsi que celles des migrations précédentes. `src/data/quiz-v1.5/editorial.json` applique un complément validé par Zod : empreinte de chaque question originale, trois identifiants de réponses fausses, interdiction de modifier la bonne réponse, refus des libellés en double. Une modification ultérieure de l’original oblige à réexaminer le complément. Les révisions publiées depuis l’administration restent prioritaires sur cette banque de référence. Le bouton de restauration de référence inclut donc les corrections V1.5 ; il ne réécrit pas les archives.

## Portail et sécurité

- `/connexion` : portail commun, pseudo pour un membre, adresse existante pour le propriétaire. Le propriétaire conserve sa double authentification et ses codes de secours.
- `/inscription` : pseudo de 3 à 30 caractères (lettres ASCII, chiffres, soulignement), mot de passe de 14 à 128 caractères et confirmation. Les pseudos réservés et les champs de rôle transmis par le navigateur sont refusés.
- `/compte` : compte classique, déconnexion et changement de mot de passe. Un changement invalide les sessions de ce membre seulement.
- Le serveur détermine la destination et les autorisations depuis la session et la base. Un membre ne peut ni obtenir le rôle propriétaire ni accéder aux API admin. Le badge admin apparaît après la vérification MFA.

Le fournisseur exige une adresse technique : les membres reçoivent un identifiant interne `u-<pseudo>@accounts.maktaba.invalid`, non distribuable et non vérifié. Aucune adresse réelle n’est demandée ; aucune récupération par e-mail n’est promise. Aucun rattachement automatique aux commandes n’est créé. Les achats invités restent opérationnels.

## Migration et activation

La migration additive `202610260002_member_accounts` ajoute les champs de pseudo et rend `User.ownerSlot` nullable. Les membres ont une valeur NULL ; la contrainte unique conserve au maximum un propriétaire de valeur 1. Le compte propriétaire, ses identifiants, mots de passe, sessions et MFA sont conservés. Aucune table commerciale n’est modifiée.

Avant tout déploiement activant ces fonctionnalités : sauvegarder, appliquer les cinq migrations sur une base isolée et vérifier, puis organiser séparément la migration additive et le déploiement de Production. Le nouveau schéma doit être présent avant utilisation du nouveau binaire d’authentification, même lorsque les inscriptions sont fermées. Ne pas lancer de seed en Production.

`MEMBER_ACCOUNTS_ENABLED=true` et `ADMIN_DATA_ENABLED=true` ouvrent les comptes classiques. `ADMIN_ENABLED` conserve son rôle distinct pour l’administration. Garder `MEMBER_ACCOUNTS_ENABLED=false` tant que la préparation n’est pas terminée. Configurer `APP_URL` et le secret Better Auth conformément à l’environnement ; ne jamais réutiliser les identifiants de tests en Production.

Cette livraison ne modifie aucune base de Production et ne déploie pas automatiquement. Les clés Stripe TEST, Resend, Neon, les prix et stocks ne sont pas modifiés. La disponibilité des services externes de paiement/e-mail n’est pas attestée par les tests locaux. Le téléversement Blob reste dépendant de la configuration et des permissions existantes.

## Vérifications

Les tests d’intégration utilisent exclusivement PostgreSQL local isolé. Le test de migration part de l’ancien schéma et vérifie la conservation du propriétaire, de ses sessions et de son compte MFA. Les tests de sécurité couvrent inscription, usurpation de rôle, origine étrangère, mot de passe, révocation et refus d’accès à l’administration.

Le bilan final des commandes exécutées se trouve dans `TESTS.md`. Les résultats ne constituent pas une nouvelle vérification religieuse des sources.
