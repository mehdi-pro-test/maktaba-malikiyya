# V1.3 — inventaire éditorial exact

Contrôle technique du 26 octobre 2026. Aucune relecture religieuse effectuée par l’intégrateur. Les 150 décisions V1.2 existantes sont conservées, sans nouvelle attestation.

| Ouvrage                                      | Publiées / approuvées | Nouveaux brouillons | Total rédigé | Questions par partie |
| -------------------------------------------- | --------------------: | ------------------: | -----------: | -------------------: |
| مختصر الأخضري                                |                    10 |                  30 |           40 |                   10 |
| المرشد المعين على الضروري من علوم الدين      |                    10 |                  30 |           40 |                   10 |
| المقدمة العشماوية                            |                    10 |                  30 |           40 |                   10 |
| المقدمة العزية للجماعة الأزهرية              |                    10 |                   0 |           10 |                   10 |
| أسهل المسالك في مذهب الإمام مالك             |                    10 |                   0 |           10 |                   10 |
| الرسالة                                      |                    10 |                   0 |           10 |                   10 |
| مختصر خليل                                   |                    10 |                   0 |           10 |                   10 |
| الشرح الكبير على مختصر خليل                  |                    10 |                   0 |           10 |                   10 |
| حاشية الدسوقي على الشرح الكبير               |                    10 |                   0 |           10 |                   10 |
| بداية المجتهد ونهاية المقتصد                 |                    10 |                   0 |           10 |                   10 |
| الاستذكار                                    |                    10 |                   0 |           10 |                   10 |
| إيصال السالك إلى أصول مذهب الإمام مالك       |                    10 |                   0 |           10 |                   10 |
| الورقات مع قرة العين بشرح ورقات إمام الحرمين |                    10 |                   0 |           10 |                   10 |
| مرتقى الوصول إلى علم الأصول                  |                    10 |                   0 |           10 |                   10 |
| مراقي السعود لمبتغي الرقي والصعود            |                    10 |                   0 |           10 |                   10 |
| **Total**                                    |               **150** |              **90** |      **240** |   **10 par ouvrage** |

Les trois ouvrages débutants ont chacun 10 questions publiées + 30 brouillons = 40 rédigées. Il reste **60 nouvelles questions à rédiger par ouvrage débutant, soit 180** pour atteindre 100 rédigées par matn ; les 90 candidates devront également être validées avant publication. Les douze autres ouvrages restent à 10 questions publiées chacun. Aucun ouvrage ne dispose aujourd’hui de 100 questions approuvées.

Les 90 candidats restent exclusivement dans `docs/quiz-v1.3-pack/recherche-v1.3/`. Le registre `src/lib/quiz-v13-lots.ts` est vide. Le parseur vérifie les IDs, doublons textuels normalisés par ouvrage, choix, réponses, champs arabes et liens HTTPS. Il ne certifie ni l’exactitude doctrinale ni l’absence de doublons sémantiques.

Les 30 candidats Achmawiyya utilisent le titre alternatif `متن العشماوية في مذهب الإمام مالك`, alors que la V1.2 emploie `المقدمة العشماوية`. Cet écart est signalé dans `INVENTAIRE.json`, sans réécriture des données ni décision bibliographique automatique. La revue future exige un contrôle explicite de la citation et de l’attribution.

Les fichiers originaux du pack sont copiés sans changement ; leurs empreintes figurent dans `IMPORT-SHA256.json`. Les éditions et pages inconnues restent nulles.
