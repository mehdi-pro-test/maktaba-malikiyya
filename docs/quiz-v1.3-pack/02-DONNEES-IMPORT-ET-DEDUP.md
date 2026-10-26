# Données : intégration de la banque éditoriale V1.3

> **Pack unique — état réel :** seuls les 150 items V1.2 (10/ouvrage) sont présents dans cette archive, dans `src/data/quiz-v1.2/research.json` et l'export CSV ci-joint. La banque éditoriale V1.3 de 300 items mentionnée ci-dessous constitue **un matériel d'entrée futur, absent de ce ZIP**. Toute procédure d'import correspondante est conditionnelle à la livraison réelle de ce JSON, sans rédaction ni fabrication par Codex.


## Matériel d'entrée obligatoire

Pack éditorial distinct `maktaba-malikiyya-v1.3-debutant-300q-codex.zip`, et plus précisément :

- `data/quiz-banks-beginner-v1.3.json` : 3 banques de 100, 300 questions entièrement écrites et référencées selon le rapport de recherche.
- `schema/quiz-bank.schema.ts` : schéma Zod livré par la recherche.
- `docs/RESEARCH-METHODOLOGY.md`, `docs/SOURCES.md`, `docs/QA-REPORT.md` : pièces justificatives et limites.
- `data/quiz-banks-beginner-v1.3.csv` : vue tabulaire, **non** source de vérité si JSON fourni.

**Ce pack documentaire ne contient pas ces fichiers** : ne pas coder contre des noms supposés sans inspecter le vrai ZIP.

## Invariants

- 3 banques : al-Akhdari, Ibn Ashir, al-Achmawiyya ; 100 IDs stables par banque ; 300 questions au total.
- Quatre propositions distinctes, un `correctOptionId` appartenant aux options, explication française et citation/source arabe.
- Aucune réécriture doctrinale automatique. Une divergence, question mal formée ou source introuvable déclenche un ticket éditorial et le blocage de **l'item concerné**.
- Une simple égalité de textes/IDs n'est pas une vérification de non-doublon doctrinal ; vérifier qu'un même fait reformulé n'occupe pas plusieurs slots. Comparer aussi contre les 10 Q V1.2 par livre.
- Conserver les 150 IDs/réponses/validations V1.2 **inchangés**. Construire un adaptateur éditorial V1.3 séparé, et détecter la correspondance sémantique pour éviter qu'un même item soit compté deux fois dans le pool.
- Les IDs V1.3 du rapport peuvent avoir un slug différent du V1.2 (`mukhtasar` / `moukhtassar`). Mapper via un registre d'alias validé, pas en devinant via une transformation aveugle de chaînes.
- Le compteur « 100 questions » doit mesurer 100 questions uniques **éligibles au tirage**, pas 100 lignes de JSON.

## Statuts, relectures et provenance

La banque V1.3 du rapport est `research_verified`. Elle **n'a pas encore le statut applicatif `published`**, et elle ne bénéficie pas automatiquement des relectures du fichier V1.2.

Implémenter une revue V1.3 propre, associée à une empreinte du contenu effectivement importé, sans modifier le fichier de relectures V1.2. En Production, ne sélectionner que les questions approuvées/publiées. Le propriétaire pourra valider le corpus V1.3 sur la base d'un rapport clair (exemples et références) ; ne pas préjuger de cette décision.

Pour des essais en Preview uniquement, un flag **serveur** explicite, activé seulement lorsque l'environnement est réellement une Preview, pourra permettre `research_verified`. Aucun flag ne doit contourner le contrôle en Production, même s'il y est malencontreusement défini.

## Migration éditoriale sans migration SQL

Adapter le schéma fourni par la recherche dans un nouveau module (`src/lib/quiz-v13-*`), et convertir vers le type actuel accepté par `QuizGame` au moment de créer la tentative. Si un stockage côté serveur est nécessaire, le justifier ; ne pas écrire un nouveau modèle Prisma d'emblée. La lecture des banques complètes doit rester serveur-only.

Si un ouvrage n'a pas au moins 10 questions autorisées, montrer « Quiz en préparation » pour la nouvelle banque, tout en maintenant son quiz V1.2 déjà disponible sur le parcours existant si pertinent. Pour un ouvrage dont les 100 questions ne sont pas encore créées, conserver le V1.2, annoncer honnêtement le compteur, ne pas annoncer « 10 au hasard sur 100 ».