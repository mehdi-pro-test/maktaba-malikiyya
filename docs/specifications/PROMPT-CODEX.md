# PROMPT À COPIER-COLLER DANS CODEX

Tu agis comme une équipe senior : Product Owner, UX designer, tech lead Full Stack, ingénieur QA et DevOps. **Réalise maintenant l'application Maktaba Malikiya** en prenant comme spécifications contractuelles le dossier documentaire qui accompagne ce prompt (`README.md`, `01-CAHIER-DES-CHARGES.md`, `02-UX-DESIGN.md`, `03-ARCHITECTURE.md`, `04-FLUX-PAIEMENT.md`, `05-DEVOPS.md`, `06-PLAN-DE-TESTS.md`, `07-BACKLOG-ET-ROADMAP.md`, `08-CHECKLIST-AVANT-PRODUCTION.md` et `09-GUIDE-CODEX.md`). Lis d'abord tous les fichiers.

**But** : véritable boutique e-commerce française spécialisée dans les livres de sciences islamiques en arabe pour étudiants francophones, avec un MVP de **paiement simulé** et une qualité de code suffisante pour évoluer vers une activité réelle.

**Décisions déjà validées (ne les redemande pas)** : nom Maktaba Malikiya ; interface 100 % FR, titres FR/AR ; deux produits fictifs : Coran (Moshaf) 10 € et Sahih al-Bukhari 100 €, stock 10 chacun ; catégories Coran et Hadith ; fiches avec photo/prix/bouton ; plusieurs exemplaires par commande ; achat invité par email + adresse ; France métropolitaine livraison 4 € et gratuite dès 50 € de sous-total produits ; autres pays européens **autorisés** livraison 20 € fixe ; Colissimo domicile envisagé sans intégration transporteur V1 ; carte bancaire via **Stripe test exclusivement**, sans PayPal ni prélèvement réel ; page de confirmation et email automatique si prestataire configuré ; **pas d'interface admin V1** ; mobile first ; grande bannière de bibliothèque et bouton « Découvrir nos livres » ; identité vert profond/crème/doré, atmosphère traditionnelle chaleureuse/matcha, logo typographique calligraphique « Maktaba Malikiya » ; photos provisoires autorisées uniquement avec droits clairs ou couvertures neutres.

**Dépôt et environnement** : mon profil est `https://github.com/mehdi-pro-test`. Ne touche à AUCUN de mes autres dépôts. Travaille dans un nouveau dossier local `maktaba-malikiya` et, si les autorisations GitHub le permettent, crée le nouveau dépôt privé `mehdi-pro-test/maktaba-malikiya` et synchronise. Si le nom est occupé ou la création impossible, demande validation au lieu de supprimer/modifier l'existant. Prépare GitHub Actions et Vercel (URL provisoire), sans inventer de déploiement réussi.

**Stack par défaut** : Next.js App Router, React, TypeScript, Tailwind/shadcn-ui, Prisma/PostgreSQL, Stripe Checkout test, Resend si vérifié, GitHub Actions, Vercel. Tu peux adapter les versions aux versions stables compatibles, en documentant tes décisions ; pas de microservices.

**Sécurité non négociable** : vérifier tout prix/stock/frais pays côté serveur ; stockage en centimes EUR ; commandes durables ; réservations de stock atomiques sans survente ; paiement confirmé uniquement par webhook Stripe signé ; idempotence d'événements et emails ; gestion des sessions expirées/retardées ; aucune clé ni donnée privée commitée ; pas de Stripe Live (refuser les clés live en V1), pas d'email fictivement déclaré envoyé ; page confirmation sans fuite PII.

**Conduite de mission** :
1. Examine le dossier courant et les documentations, fais une liste de tâches courte, puis implémente sans me solliciter pour de simples décisions techniques.
2. Initialise projet, schéma et seed ; réalise design, pages, catalogue, panier, checkout invité, livraison, Stripe test, confirmation, emailing, CI, tests et documentation.
3. Crée un `.env.example` propre ; pour tout service non configurable sans intervention de ma part, fournis un adaptateur de développement explicite et la procédure d'activation ultérieure. N'inscris jamais de fausses clés.
4. Exécute lint, typecheck, tests, build et les validations d'intégration que l'environnement permet ; corrige les erreurs. Ne prétends pas avoir validé un paiement/test d'email ou un déploiement si tu ne l'as pas fait.
5. Crée des commits propres, publie dans un **nouveau dépôt privé** seulement si autorisé et prépare un déploiement Vercel après CI vérifiée. Ne pousse jamais avec `--force` sur `main`.
6. Conclus avec : ce qui est livré, ce qui est testé (résultats des commandes), ce qui dépend de secrets/accès, le chemin local, URL réelle GitHub et Vercel s'ils existent, une courte checklist d'actions manuelles avant démonstration.

**IMPORTANT** : travaille jusqu'à une V1 utilisable localement. Tant qu'un vrai fournisseur n'est pas connecté, les fonctions dépendantes restent clairement en mode développement. Ne bascule jamais en vente réelle et n'invente aucune édition ou donnée juridique.
