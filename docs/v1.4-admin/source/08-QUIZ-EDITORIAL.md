# Module Quiz — éditer les questions sans détruire les banques validées

## Situation de départ

Les questions historiques sont stockées dans plusieurs JSON versionnés, validées par schémas/empreintes et adaptées par le serveur. Le moteur des quiz individuels et du **mode global** prend des pools de questions déjà publiées ; le mode global a également une **liste d'exclusions qualité** dans `src/data/quiz-global-quality.json` (questions pas assez autonomes pour un tirage global).

**Ne pas faire de CRUD direct sur les fichiers JSON depuis le navigateur**, ni modifier `src/data/quiz-v1.2/research.json` (rupture d'empreinte/reviews).

## Architecture recommandée : base historique + overlay DB

1. **Conserver** les JSON et leurs validations comme instantané canonique en lecture seule (baseline, historique, reprise après incident).
2. Introduire une couche DB Prisma `QuizQuestionRecord`/`QuizQuestionRevision` ou équivalente pour :
   - nouvelles questions créées par admin ;
   - modifications de questions anciennes sous forme d'**override versionné par ID d'origine**, jamais patch du JSON ;
   - archivage/désactivation réversible par ID ;
   - provenance (`sourceKind`, URL, titre/arabe, auteur, chapitre, citation, attribution, vérification déclarée ou non) ;
   - statut (`DRAFT`, `PUBLISHED`, `ARCHIVED`) et date/identité de publication.
3. À l'exécution : **fusionner** les questions historiques approuvées + overrides DB publiés + créations DB publiées ; si override existe pour l'ID historique, une seule version gagne ; si archived, question exclue. IDs globaux uniques et aucune duplication.
4. Les changements admin sont visibles dans `/quiz/niveaux/...` et `/quiz/aleatoire` **sans redéploiement** ; éviter cache et `generateStaticParams` qui fige les pools (les pages peuvent rester static si l'action serveur construit le pool dynamique et l'intro affiche un compte à jour).
5. **Ne pas briser le moteur du tirage** : 10 questions distinctes, score /10, feedback, source arabe, rejouer, provenance livre/niveau, exclusion qualité du mode global, pas de brouillons.

## Champs d'une question

- ID stable (généré pour création ; conservé pour override), `bookId` parmi ouvrages autorisés, niveau dérivé du livre (non libre).
- Énoncé français obligatoire ; type **single** quatre options a/b/c/d pour cette V1.4 (compatibilité actuelle des quiz par ouvrage). Choix et texte obligatoires, option correcte unique.
- Explication française obligatoire ; titre de l'ouvrage arabe, auteur, chapitre arabe, citation arabe, URL de source HTTPS obligatoires **pour publication** ; pages/édition facultatives seulement si vérifiées. Qualificatif `sourceVerification` explicite.
- Statut, version, créateur/publicateur propriétaire, dates, motif de mise à jour facultatif.
- Éligibilité **mode global** : défaut autorisé uniquement si question autonome ; les exclusions historiques doivent rester actives sur les IDs correspondants. Pour les nouvelles questions, champ `globalEligible` éditable et contrôlable ; ne pas contourner les exclusions existantes par la fusion.

## Parcours admin

- Filtrer `niveau → ouvrage → statut`, recherche textuelle, compteur de QCM réellement **publiés** vs brouillons vs archivés, champ `sourceVerification` visible.
- Ajouter : brouillon → aperçu « côté joueur » → contrôles validation → action volontaire « Publier ». Pour un **admin unique**, la publication exprime une **validation du propriétaire**, pas l'avis d'un savant indépendant.
- Éditer une publiée : **créer une nouvelle révision en brouillon** ; garder l'ancienne version publique tant que l'admin n'a pas publié la nouvelle (sauf retrait urgent). Toute modification de réponse/source nécessite validation explicite de la nouvelle version ; journal avant/après.
- Archiver : confirmation, motif et effet sur les comptes ; la question cesse d'être tirée à la prochaine **nouvelle tentative**, mais une tentative déjà lancée garde ses 10 questions et leurs corrections jusqu'au résultat.
- Import/export de JSON/CSV : P1 optionnel ; détecter doublons d'ID et énoncés normalisés, valider source/4 choix/URL, prévisualiser diff, import uniquement en `DRAFT` puis publication explicite.

## Règles de qualité et contraintes métier

- Aucun champ citation/pagination faussement « vérifié » ; les citations héritées de l'approbation du propriétaire qui n'étaient pas attestées comme collationnées **restent signalées**.
- Interdire de publier une question sans bonne réponse, quatre choix distincts, explication et source valide.
- Si un livre descend sous 10 questions publiées, marquer quiz indisponible avec message honnête, sans casser la navigation ni répandre les réponses de brouillon.
- Si le mode global passe sous 10 questions admissibles, montrer son indisponibilité. Les compteurs sont dérivés **du même pool serveur** que le tirage.
- Pour publication/archivage simultanés, garantir l'unicité de la version active en transaction. Tester collisions/sur-écriture concurrente et rollback.
- La bibliothèque admin n'a pas à changer arbitrairement les doctrines : seul le propriétaire crée ou corrige le contenu.

## Stratégie de migration des JSON

Ne pas faire une copie de tous les JSON puis les supprimer. Introduire l'overlay d'abord, valider le **même total et les mêmes IDs publiés** à vide, puis tester un nouvel item et un override. Prévoir un script réversible d'inventaire et de contrôle sans modifications en Production. Une migration plus complète en base pourra être proposée ultérieurement, hors V1.4, une fois le système éprouvé.
