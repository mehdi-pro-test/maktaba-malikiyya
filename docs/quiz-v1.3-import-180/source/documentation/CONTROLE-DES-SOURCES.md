# Contrôle des sources arabes avant toute publication

Les textes répertoriés sont des **sources de travail consultées pour rédiger les 180 candidats**. Les citations arabes présentes dans les JSON sont des extraits provisoires, pas des preuves de collation sur fac-similé ni des pages d’une édition critique.

| Ouvrage | Source consultable | Incertitude principale |
|---|---|---|
| المقدمة العزية للجماعة الأزهرية — المنوفي | https://www.scribd.com/document/1073307615/ ; fac-similé à confronter : https://mc.dlib.nyu.edu/files/books/aub_aco001345/aub_aco001345_lo.pdf | **OCR dégradé : chaque citation est à relire mot à mot; ne rien publier sans preuve d’édition.** |
| أسهل المسالك — البشار | https://ar.wikisource.org/wiki/أسهل_المسالك_في_مذهب_الإمام_مالك | Lire la page du **chapitre précis**, pas seulement l’index Wikisource. |
| الرسالة — ابن أبي زيد القيرواني | https://www.islamicbook.ws/asol/maliki/mtn-alrsalt.html | Comparer la transcription avec l’édition, vérifier portée des règles. |
| مختصر خليل — خليل بن إسحاق | https://www.islamicbook.ws/asol/maliki/mkhtsr-khlil-001.html | Préserver les nuances de formulation et les avis retenus par le matn. |
| الشرح الكبير — الدردير | https://www.islamarchive.cc/ketab_content/2699/p-153 et https://www.islamarchive.cc/ketab_content/2699/p-230 | Isoler strictement **le texte du Sharh al-Kabîr**, ne pas lui attribuer un commentaire de Dasûqî. |
| حاشية الدسوقي — الدسوقي | https://www.islamarchive.cc/ketab_content/2699/p-153 et https://www.islamarchive.cc/ketab_content/2699/p-95 | Isoler strictement **la Hâshiya**, distinguer la glose des paroles de Dardîr. |

## Relecture requise, question par question

1. Vérifier l’existence de la phrase arabe, **dans le bon chapitre et au bon niveau de citation** (matn / vers / commentaire / glose).
2. Vérifier que la réponse correcte découle bien de la source, notamment les exceptions, les comparaisons doctrinales et les divergences internes.
3. Examiner les trois distracteurs : ils doivent être tous faux **dans le contexte de la question**, mais plausibles; en remplacer un si un double sens apparaît.
4. Contrôler que la question n’est pas déjà présente, même sous une autre formulation, dans V1.2 ou dans d’autres lots V1.3.
5. Ajouter l’édition, le numéro de page et l’extrait exact **uniquement après consultation directe**. Les champs `edition` et `printedPage` restent `null` en attendant.
6. Faire enregistrer une décision de revue indépendante par question, liée au SHA du nouveau lot, avant toute publication. Ne réutiliser ni le rapport V1.2 ni les approbations des trois livres débutants.

La comparaison de textes normalisés dans le CSV détecte les doublons littéraux des **180 nouvelles questions entre elles**, mais ne permet ni de vérifier la doctrine ni d’écarter tous les doublons sémantiques. Codex ne doit pas décider seul qu’un QCM est fiable.
