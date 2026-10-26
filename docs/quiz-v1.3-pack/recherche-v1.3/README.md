# Reprise éditoriale réelle — Questions V1.3

## Contenu de la recherche (26 octobre 2026)

**90 questions-réponses supplémentaires réellement rédigées** sur les trois *matn* débutants, avec quatre choix, une réponse correcte, une explication en français, une courte citation arabe, l'ouvrage, le chapitre et une URL source.

- `01-akhdari-30-candidats.json` : 30 nouveaux QCM de **مختصر الأخضري**, source [transcription intégrale](https://arabic-keyboard.info/books/ar/read-book/متن-الأخضري-في-العبادات-على-مذهب-الإمام-مالك).
- `02-ibn-ashir-30-candidats.json` : 30 nouveaux QCM de **المرشد المعين**, source [matn intégral en vers](https://chariaa.weebly.com/160515781606-157515761606-1593157515881585.html), avec orthographe/diacritiques de la transcription à collationner.
- `03-achmawiyya-30-candidats.json` : 30 nouveaux QCM de **متن العشماوية**, source [texte arabe Usul](https://usul.ai/ar/t/matn-cashmawiyya) et [Shamela, 19 pages](https://shamela.ws/book/37326).
- `QUESTIONS-REPONSES-NOUVELLES-90.csv` : export de toutes les questions, réponses et références pour relecture humaine.
- `MANIFEST-90-QUESTIONS.json` : inventaire et résultats des contrôles automatiques.

**La V1.2 sur main compte déjà 10 questions par ouvrage.** En ajoutant ces 30 nouveaux candidats par ouvrage (mais **sans les publier**), cela donne **40 questions rédigées par livre débutant**, soit **120 questions** pour trois livres, et **240 questions** pour l'ensemble des quinze livres. Il manque **60 nouvelles questions par matn débutant**, soit **180 questions** pour atteindre 100 par ouvrage. Les douze autres livres conservent 10 chacun (120), en attendant d'autres lots.

## Contrôles effectués

- 90 IDs distincts, 90 énoncés distincts après normalisation ;
- aucun doublon textuel exact avec les 150 énoncés V1.2 ;
- quatre choix distincts et une réponse effectivement présente pour chaque QCM ;
- référence arabe non vide et URL HTTPS pour chaque QCM ;
- la position de la bonne réponse a été distribuée parmi a, b, c et d.

Le contrôle automatisé ne peut pas démontrer l'absence de **doublons sémantiques** ni l'exactitude d'une **leçon imprimée**. Une relecture des questions, des distracteurs, de l'interprétation fiqh et des variantes orthographiques reste nécessaire. Toutes les questions nouvelles sont donc marquées `research-draft`, pas `published`. Le fait d'avoir consulté des **transcriptions en ligne** ne vaut pas vérification d'un fac-similé ni attestation d'expertise religieuse.

## Règle pour Codex

**Codex ne rédige aucun contenu religieux.** Ces fichiers restent en `docs/` comme banque éditoriale à relire. Pour la V1.3, Codex peut préparer le moteur du tirage de 10 questions sans remplacement, avec les 150 questions déjà publiées comme base réelle. Il ne doit ni importer ces 90 brouillons comme publiés, ni prétendre atteindre 100 questions par ouvrage. Les futurs fichiers éditoriaux de l'assistant seront ajoutés par lots et validés.

La décision antérieure du propriétaire sur la navigation prévaut : l'ancien quiz classique a été supprimé, `/quiz` redirige vers `/quiz/niveaux`.
