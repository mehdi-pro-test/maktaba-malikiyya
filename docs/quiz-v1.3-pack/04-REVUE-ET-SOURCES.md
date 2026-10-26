# Qualité des questions, sources arabes et décision de publication

## Provenance réelle du lot débutant

Le rapport de recherche approfondie V1.3 indique la constitution de 300 questions (3 × 100) avec titre, auteur, chapitre, citation arabe, édition ou témoin, et lien de source. **Les contrôles structurels annoncés par la recherche ne valent pas relecture doctrinale indépendante.** Certaines pages d'Ibn Ashir restent `null` et `pageVerified: false`.

Ouvrages et sources de consultation principales identifiées dans le rapport :

- **مختصر الأخضري** : https://shamela.ws/book/9548 ; texte numérisé avec pagination annoncée conforme à l'imprimé.
- **المقدمة العشماوية** : https://shamela.ws/book/37326 ; en complément Wellcome MS Arabic 847 : https://wellcomecollection.org/works/s5uzycfn.
- **المرشد المعين / متن ابن عاشر** : scan Maktabat al-Qahira https://archive.org/download/Ibn_Achir/Ibn_Achir01.pdf ; pagination individuelle à consolider selon le rapport.

Ces liens sont des **références de corpus**, non une certification automatique de chacune des 300 questions. Consulter les URL détaillées contenues dans le JSON éditorial et les rapports. Ne pas inventer une page imprimée, ne pas substituer une page d'accueil à un passage précis et ne pas copier des scans/couvertures sans vérifier les droits.

## Contrôles éditoriaux demandés

Pour chaque item :
1. Enoncé français exact et non ambigu ; traduction arabe si elle figure dans le dataset.
2. Quatre choix plausibles, distincts, un et un seul correct.
3. Bonne réponse soutenue par le passage cité ; la courte citation n'est pas hors sujet.
4. Livre/auteur/chapitre/édition/layer matn-commentaire cohérents ; pas de mélange sharh/hashiya.
5. Lien HTTPS utilisable et provenance du scan vérifiable, page uniquement si réellement contrôlée.
6. Sans doublon sémantique dans l'ouvrage ou avec les dix questions déjà validées dans la V1.2.
7. Distinctions du droit malikite et éventuelles divergences explicitement formulées.
8. Relecture humaine qualifiée avant passage en Production si nécessaire.

Les données V1.3 `research_verified` doivent rester en revue; des questions structurellement valides peuvent malgré tout nécessiter une correction de doctrine, de formulation ou de référence. Codex doit **signaler** ces cas, pas prendre la place d'un relecteur ni d'un auteur de contenu.

## Registre d'approbation

Conserver par question : `questionId`, `bookId`, empreinte du corpus ou de l'item, statut, relecteur réel, date, décision, remarque. Ne **pas** renseigner automatiquement un nom de relecteur fictif. Une révision du libellé/source/bonne réponse invalide l'approbation concernée et nécessite une nouvelle décision.

## Les 12 autres banques

Intermédiaire : al-Izziyya, Ashal al-Masalik, Risala d'Ibn Abi Zayd.
Avancé : Mukhtasar Khalil, Sharh al-Dardir, Hashiya ad-Dasuqi.
Ultime : Bidayat al-Mujtahid, al-Istidhkar.
Oussoul : Issal as-Salik, al-Waraqat avec Sharh al-Hattab, Murtaqa al-Wusul, Maraqi as-Su'ud.

Ces douze banques **de 100** restent à produire sur le plan éditorial; les 10 questions V1.2 par ouvrage sont à conserver, sans promettre la disponibilité de 100 questions.