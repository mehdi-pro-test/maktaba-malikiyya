# Recherche en arabe, bibliographie et contrôle éditorial

**Statut du pack :** protocole de recherche et catalogue initial uniquement. Aucun passage d'ouvrage, URL de chapitre, numéro de page ou édition critique n'a été vérifié pour les 150 questions dans ce pack. La recherche approfondie lancée séparément doit fournir les références exactes avant publication.

## Ordre de recherche

1. Rechercher **en arabe** le texte primaire de l'ouvrage, son auteur et son titre exact ; identifier les variantes de titre et la relation matn/sharh/hashiya.
2. Consulter une édition numérique vérifiable : page éditeur/éditeur critique, bibliothèque reconnue, scan paginé ou texte numérique avec chapitre et passage consultables. Exemples de points de départ à **vérifier** : المكتبة الشاملة (shamela.ws), المكتبة الوقفية (waqfeya.net), catalogues bibliographiques arabes. Ces domaines sont des pistes, **pas des citations de passages**.
3. Recouper les points doctrinaux ambigus avec le commentaire approprié, en distinguant ce que dit le matn, ce que précise le sharh et ce qui est propre au madhhab.
4. Rédiger en français une question originale sans recopier des QCM tiers ; quatre réponses plausibles et une explication exacte. En cas de divergence, indiquer la formulation retenue et le point de vue.
5. Pour chaque question, consigner une **citation arabe courte** (pas de long extrait sous droit), titre et auteur exacts, chapitre, volume/page seulement si vérifiables, édition, URL de passage si possible, date de consultation et nom du relecteur.
6. Double contrôle : conformité au passage et absence d'ambiguïté de QCM. Une simple URL vers une page d'accueil n'est pas une référence suffisante.

## Liste de travail

| Parcours | Ouvrages à vérifier |
| --- | --- |
| Débutant | مختصر الأخضري ; المرشد المعين / متن ابن عاشر ; المقدمة العشماوية |
| Intermédiaire | المقدمة العزية ; أسهل المسالك ; الرسالة لابن أبي زيد القيرواني |
| Avancé | مختصر خليل ; الشرح الكبير للدردير ; حاشية الدسوقي |
| Ultime | بداية المجتهد ونهاية المقتصد ; الاستذكار لابن عبد البر |
| Oussoul | إيصال السالك ; الورقات مع شرح الحطاب ; مرتقى الوصول ; مراقي السعود |

Points de vigilance :
- `الورقات` est un matn de **l'imam al-Juwayni** ; son origine n'est pas un ouvrage de fiqh exclusivement malikite. Le commentaire attribué à al-Hattab et ses références doivent être vérifiés.
- `بداية المجتهد` est **comparatif** ; ne pas présenter toutes ses opinions comme un avis unique de l'école malikite. Pour l'édition/charh, comparer lisibilité des manuscrits, apparat critique, index, corrections et accessibilité. Ne pas décréter un « meilleur » sans preuves.
- `حاشية الدسوقي` commente le Sharh al-Kabir : ne pas confondre une formulation du matn avec un développement de la hashia.
- `إيصال السالك`, `مراقي السعود` et l'attribution précise de certains titres ont besoin d'une vérification bibliographique ; ne pas recopier une attribution incertaine du prompt initial comme une certitude.

## Registre de traçabilité obligatoire par question

```text
questionId:
niveau / bookId:
titre arabe et auteur confirmés:
ouvrage / matn / commentaire / hashia:
édition, éditeur scientifique, année (si vérifiés):
chapitre / section:
volume / page (si vérifiés):
URL directe du texte ou du scan (si disponible):
citation arabe courte vérifiée:
énoncé FR / choix / bonne réponse:
explication FR:
divergence et qualification malikite:
date de consultation:
statut draft | review | published:
relecteur et date de revue:
```

## Barrière de publication

- Aucun champ `url`, `quoteAr`, `page`, `edition` ne doit être fabriqué.
- Pas de `published` si source primaire absente ou attribution incertaine. Une source secondaire peut **appuyer** mais pas remplacer le passage primaire lorsque le quiz se dit « tiré de l'ouvrage ».
- Les dix questions du quiz V1.1 comportent déjà des liens secondaires (Doctrine Malikite) pour Q3–Q10 ; elles restent historiques et **ne prouvent pas** le sourcing primaire de cette V1.2.
- Si le texte n'est pas accessible : noter « source primaire non consultable », garder le quiz en préparation et remonter la demande au propriétaire.
- Ne pas présenter des avis religieux divergents comme des règles universelles. Un relecteur compétent en fiqh malikite doit valider le lot avant sa mise en ligne.
