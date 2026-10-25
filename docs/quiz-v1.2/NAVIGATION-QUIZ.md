# Navigation des quiz — 26 octobre 2026

À la demande du propriétaire, le quiz classique initial est retiré de l’application. Cette décision remplace l’exigence antérieure de le maintenir jouable.

- Le lien « Quiz » du header ouvre directement `/quiz/niveaux` et reste marqué actif dans les pages de parcours et d’ouvrage.
- Les liens de l’accueil et du pied de page ouvrent également les niveaux. L’accueil calcule les quiz réellement disponibles : actuellement 15 quiz et 150 questions.
- Les liens « quiz classique » ont été retirés du catalogue et de l’écran de préparation.
- La page et le chargeur du quiz classique sont supprimés. `/quiz` redirige en HTTP 308 vers `/quiz/niveaux` pour conserver les anciens liens.
- Les anciennes données sont conservées uniquement comme archive documentaire sous `docs/v1.1/archive/quiz-v1.1.json`, sans import applicatif. Elles servent encore aux tests de compatibilité du moteur de sélection multiple, distincts des parcours visibles.
- Les tests navigateur de score/correction/Rejouer portent désormais sur le quiz réel d’Akhdari. Les assertions de navigation, d’accessibilité, de redirection, d’absence de lien vers le classique et du compteur d’accueil sont maintenues ou ajoutées.

Aucune question des quinze ouvrages, validation humaine, règle de score, donnée commerciale, migration ou configuration de paiement n’est modifiée. Les rapports précédents de livraison et de protection V1.1 décrivent leur état historique, avant cette nouvelle décision de navigation.
