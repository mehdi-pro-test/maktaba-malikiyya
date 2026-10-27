# Recette V1.5

Contrôles locaux exécutés le 27 octobre 2026 :

- Formatage Prettier : réussi.
- ESLint : réussi.
- TypeScript : réussi.
- Tests unitaires : 153 réussis, 17 fichiers.
- Intégration PostgreSQL isolée : 72 réussis, 12 fichiers.
- Build Next.js de production : réussi.
- Playwright ciblé connexion/admin, ordinateur et mobile : 8 réussis.
- Suite complète Playwright : 136 tests réussis (ordinateur, mobiles, WebKit et parcours admin/membre).

Au redémarrage de l’environnement, une tentative d’intégration a échoué parce que le conteneur PostgreSQL local était arrêté. Après son redémarrage, les 72 tests ont été exécutés et réussis. Aucune base distante de Production n’a servi aux tests.

Une branche Neon preview séparée a reçu la cinquième migration. Les empreintes des huit tables commerciales ainsi que de User (colonnes historiques), Account, Session et TwoFactor sont identiques avant et après. Aucune migration de Production n’a été exécutée.

Les tests commerciaux couvrent notamment réservation de stock, concurrence, idempotence des paiements simulés, signature de webhook, montant serveur, frais de livraison, refus du mode live et réessai des e-mails simulés. Ils ne prouvent pas l’envoi effectif d’un e-mail ni un paiement réseau. Les bonnes réponses et sources des 610 questions sont comparées aux archives ; le score et la stabilité du tirage sont contrôlés.

## Preview

Branche Neon isolée : `br-lively-mouse-b8jfki7v`. Administration fermée sur la preview, inscriptions classiques ouvertes.

Adresse canonique : https://maktaba-malikiyya-git-feat-v15-connexion-quiz-6796e7-squad-team.vercel.app

Vercel indique le déploiement prêt. La protection Vercel redirige toutefois les visiteurs non autorisés vers « Login – Vercel » : la réponse HTTP 200 ne valide donc pas le fonctionnement de l’application hébergée. La recette fonctionnelle décrite ci-dessus est locale. Le déploiement final reprend l’origine canonique de la preview pour les contrôles d’origine du portail.

Les captures du compte classique, sur ordinateur et à 320 px, sont conservées dans `captures/`. Des exemples avant/après figurent dans `EXEMPLES-EDITORIAUX.md`. Aucun stock, compte, mot de passe ou facteur MFA de Production n’a été modifié.
