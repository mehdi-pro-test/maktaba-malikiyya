# Quiz V1.2 — livraison applicative

La banque de recherche est désormais importée : **15 ouvrages, 150 questions complètes, cinq parcours**. Les trente questions débutantes sont présentes. Tous les lots restent en préparation : aucune relecture doctrinale humaine approuvée n’a été fournie.

- [Architecture, import et activation](IMPLEMENTATION.md)
- [Audit, recette et non-régression](LIVRAISON.md)
- [Tableau par ouvrage](recherche/TABLEAU-VALIDATION.md)
- [Rapport de recherche](recherche/RAPPORT-RECHERCHE.md)
- [Questions et corrections](recherche/QUESTIONS-REPONSES-150.md)
- [Bibliographie et références](recherche/BIBLIOGRAPHIE.md)

Le quiz classique `/quiz` conserve ses dix questions. Les nouveaux parcours sont accessibles sur `/quiz/niveaux` et les pages d’ouvrage sont prérendues. La relecture est une condition de publication, distincte de la validation technique des données et des tests.

Le cahier des charges initial est conservé dans `BASELINE-ET-ANTI-REGRESSION.md`, `SPECIFICATIONS.md`, `SOURCES-ET-REVUE.md` et `RECETTE.md`. Ses mentions de recherche attendue décrivent l’état antérieur à cet import ; les résultats effectifs figurent dans `LIVRAISON.md`. Les protections de la V1.1 restent applicables.

Aucune migration V1.2, aucun changement du commerce et aucun déploiement Production.
