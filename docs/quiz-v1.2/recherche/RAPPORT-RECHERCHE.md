# Rapport de recherche — questions/réponses V1.2

Date de consultation : 25/10/2026. Langue de recherche et des textes justificatifs : arabe. Explications et QCM : rédaction française originale.

## Résultat et portée

La banque livre **150 QCM complets**, dix pour chacun des quinze ouvrages demandés. Elle comprend les trente questions débutantes prioritaires. Le détail intégral, les choix et la correction sont dans `QUESTIONS-REPONSES-150.md`, et les données importables dans les JSON. Aucun QCM tiers n’a été recopié.

Ce travail porte sur des **passages sélectionnés**, pas sur un dépouillement intégral des quinze livres ni sur une édition critique de leurs textes. Le corpus de fiqh est volontairement concentré sur la purification : il permet de comparer l’enseignement des matns, leur commentaire et les divergences. La classification débutant/intermédiaire/avancé/ultime suit les ouvrages demandés. Elle n’est pas une évaluation psychométrique de chaque question : certaines questions d’un ouvrage avancé sont des vérifications de lecture relativement simples. Les usul couvrent définitions, qualification des actes, preuves et règles de lecture.

## Méthode de sélection

1. Identifier le texte arabe et son auteur, en distinguant matn, commentaire, glose et simple notice bibliographique.
2. Consulter les passages eux-mêmes. Pour les textes HTML, conserver le texte récupéré et son empreinte. Pour al-ʿIzziyya, Asḥal al-masālik et le commentaire d’al-Ḥaṭṭāb, lire les pages PDF rendues en images lorsque l’extraction est vide ou défectueuse.
3. Construire une question originale portant sur une proposition effectivement présente, puis une correction qui en conserve les conditions. Éviter les questions médicales, les applications personnelles ou les divergences impossibles à condenser proprement en réponse unique.
4. Rédiger quatre choix, une seule bonne réponse et une explication en français. Les distracteurs sont des confusions entre concepts voisins ; ils n’expriment pas des avis attribués sans source.
5. Relier chaque question à une courte citation et à son emplacement. Un champ inconnu reste vide plutôt que rempli par une référence plausible mais non contrôlée.
6. Vérifier automatiquement la présence du libellé des citations dans les transcriptions, en normalisant les espaces, la ponctuation, les ligatures et les signes diacritiques pour la recherche. La citation conservée reprend ensuite le segment du texte récupéré. Ce rapprochement garantit la correspondance à la transcription consultée, **pas** l’authenticité d’une édition ni l’absence de faute de transcription.
7. Pour les PDF, effectuer le contrôle visuel et indiquer `read-facsimile`. Il ne s’agit pas d’un contrôle automatique. Les citations sont transcrites sans vocalisation systématique ; les mots et le sens ne sont pas modernisés.

Le registre distingue donc `matched-transcription` et `read-facsimile`. Il ne contient aucune signature inventée. Les empreintes documentent les ressources consultées ; les PDF complets et les traductions modernes ne sont pas redistribués dans ce dossier.

## Constats bibliographiques et doctrinaux

### 1. Al-Akhḍarī

Le passage consulté énumère sept obligations du wuḍūʾ, puis sunnas et actes méritoires. Le lot porte sur ces catégories, avec distinction entre lavage et essuyage, ainsi que l’économie d’eau. Une leçon numérique sur le passage entre les orteils est susceptible de confusion : elle n’a pas été utilisée pour attribuer une obligation générale. Il faut la collationner avant tout ajout sur ce point. Aucune pagination imprimée ni édition n’est prétendue vérifiée.

### 2. Ibn ʿĀshir

Le titre développé est *al-Murshid al-muʿīn ʿalā al-ḍarūrī min ʿulūm al-dīn*. Les vers consultés différencient obligations, sept sunnas et onze actes méritoires, puis annulatifs et ghusl. La règle des poils clairsemés ne doit pas être transposée indistinctement à la barbe dense. Les numéros de vers sont ceux de la transcription consultée. Cette transcription indique elle-même une relecture en cours : elle ne tient pas lieu d’édition critique contrôlée. Les mentions de pages de Mayyāra visibles sur le site ne sont pas reprises comme références vérifiées.

### 3. Al-Achmawiyya

Le matn est attribué à ʿAbd al-Bārī al-ʿAshmāwī. Il faut distinguer ses propres listes des commentaires qui les expliquent. Le lot utilise notamment les cinq obligations et quatre sunnas du ghusl. Une autre reproduction en ligne omet un élément d’une liste pourtant annoncée comme sept : cette reproduction n’a pas servi de référence au lot. La traduction française du site consulté n’a pas été recopiée.

### 4. Al-ʿIzziyya : attribution à corriger

Il s’agit de la *Muqaddima al-ʿIzziyya li-l-jamāʿa al-Azhariyya* d’ʿAlī al-Manūfī al-Shādhilī, mort en 939 H, et non du fondateur de la Shādhiliyya mort en 656 H. Le catalogue NYU est source d’une confusion ; la couverture du volume consulté indique 857–939 H, et des notices bibliographiques permettent le recoupement.

Le PDF NYU contient le **matn dans un cadre**, avec *al-Jawāhir al-muḍiyya* de Ṣāliḥ ʿAbd al-Samīʿ al-Ābī autour. Les dix citations utilisées proviennent du cadre, pages imprimées 5–6, PDF 9–10. La couverture identifie Dār Iḥyāʾ al-kutub al-ʿarabiyya / ʿĪsā al-Bābī al-Ḥalabī wa-shurakāh ; la date proposée par le catalogue n’est pas retenue comme contrôlée dans l’exemplaire.

Le lot distingue eau pure et purifiante, eau modifiée par une matière pure, eau modifiée par une impureté, modifications naturelles, et faible impureté sans modification. Les conditions de ce dernier cas sont indispensables.

### 5. Asḥal al-masālik

Le poème est de Muḥammad al-Bashshār. Son OCR est trop défectueux pour être cité sans fac-similé : le contrôle a été fait sur l’image de la page PDF 6, qui rassemble les pages imprimées 9–10. Le poème y compte **huit sunnas et dix faḍāʾil du wuḍūʾ**. Remplacer ces nombres par ceux d’un autre matn détruirait la fidélité au texte. Le sommeil lourd est distingué du léger, indépendamment de la seule durée. L’édition et la date de cet exemplaire ne sont pas identifiées avec assez de certitude ; elles restent nulles.

### 6. La Risāla

La *Risāla* est d’Ibn Abī Zayd al-Qayrawānī. Le lot porte sur la description du wuḍūʾ et distingue l’istinjāʾ de la levée du ḥadath, la suppression de souillure sans intention et l’intention propre aux ablutions. Il conserve la nuance entre description préférable et minimum valide. Le matn rapporte lui-même une autre opinion sur les coudes : la question précise qu’elle vise sa description principale.

### 7. Khalīl, al-Dardīr et al-Dasūqī : trois couches

La banque sépare les trois auteurs. Pour Khalīl, les passages proviennent des séquences `ص` du matn dans *Mawāhib al-jalīl* d’al-Ḥaṭṭāb ; les séquences `ش` sont le commentaire. Les questions signalent dans l’explication les précisions du commentaire sans les transformer en citation du matn.

Dans le volume de la *Ḥāshiyat al-Dasūqī* proposé par Islamweb, le *Sharḥ al-kabīr* apparaît avant `عرض الحاشية`, puis vient la glose. Les vérifications du lot Dardīr ont été limitées à la première zone, celles du lot Dasūqī à la seconde. Une définition ou un avis de la glose n’est pas attribué au matn.

Les applications anatomiques conservent les distinctions : implantation habituelle des cheveux, peau sous les poils clairsemés, extérieur des lèvres, cavité cicatrisée impossible à frotter et possibilité indépendante d’y faire parvenir l’eau. Ce sont des questions d’étude du texte, pas des instructions de manipuler une plaie.

La glose sur l’eau relève des divergences internes à l’école et l’importance d’un qualificatif inséparable dans la désignation « eau de rose ». L’eau pure mais non purifiante n’est pas automatiquement impure. Une hésitation lexicale indiquée comme trois possibilités ne doit pas devenir trois avis doctrinaux.

### 8. Ibn Rushd : droit comparé

*Bidāyat al-mujtahid* est d’Ibn Rushd le Petit/al-Ḥafīd. Les questions nomment l’avis étudié : Dāwūd, Aḥmad, Mālik, ou l’accord rapporté sur le lavage unique complet. Les causes du désaccord sont explicitées : portée de l’ordre, sens de *bāta*, de *ilā* et du *bāʾ*. Un avis rapporté d’une autre école n’est jamais présenté comme le choix malikite obligatoire.

Aucune affirmation de « meilleure édition » n’est faite. Comparer sérieusement les éditions exigerait de consulter leurs apparats, variantes, index et méthodes, ce qui dépasse les exemplaires effectivement utilisés ici. Le lien primaire consulté permet de lire le passage ; il ne justifie pas d’y joindre la pagination d’une autre édition trouvée dans un catalogue.

### 9. Ibn ʿAbd al-Barr

*Al-Istidhkār* commente les traditions du *Muwaṭṭaʾ*. Le lot distingue le récit de ʿAbd Allāh b. Zayd et l’analyse d’Ibn ʿAbd al-Barr. Il comprend la critique d’une précision généalogique, le renvoi à *al-Tamhīd*, les avis comparés sur bouche/nez, et la différence entre lavage complet et perfection de répétition. Une critique particulière d’isnād ne devient pas une invalidation générale de la tradition.

### 10. Īṣāl al-sālik

Auteur du commentaire : Muḥammad Yaḥyā b. Muḥammad al-Mukhtār al-Walātī. Le poème commenté est d’Aḥmad b. Abī Kaff. Le lot marque explicitement la citation du vers annonçant seize preuves et les développements du commentaire. Ce décompte est celui présenté par le texte, sans prétendre constituer la seule manière possible de compter les fondements malikites.

Les exemples retenus portent sur naṣṣ, ẓāhir, taʾwīl appuyé par une preuve, restrictions décrivant le cas habituel ou un bienfait, amplification et mafhūm al-muwāfaqa. Les développements dont les transcriptions comportent une coquille ont été évités dans les citations retenues.

### 11. Al-Waraqāt avec al-Ḥaṭṭāb

Le matn est d’ʿAbd al-Malik al-Juwaynī ; le commentaire consulté est *Qurrat al-ʿayn bi-sharḥ Waraqāt Imām al-Ḥaramayn* d’al-Ḥaṭṭāb al-Ruʿaynī. L’origine du matn n’est pas exclusivement malikite. Al-Ḥaṭṭāb s’appuie aussi sur le commentaire d’al-Maḥallī : les auteurs ne sont pas interchangeables.

Le PDF consulté présente un texte établi/annoté par Jalāl ʿAlī ʿĀmir al-Jahānī. Ses métadonnées internes donnent un titre et un auteur étrangers à l’ouvrage : ils n’ont pas été repris. Le titre et l’attribution ont été contrôlés sur les pages du document. Les questions portent sur les passages classiques, sans recopier les notes contemporaines.

La précision *imtithālan* distingue récompense de l’abstention et simple absence matérielle d’un acte. L’effet juridique d’un contrat et la reconnaissance d’un acte cultuel sont différenciés. Le passage qualifiant le witr de sunna confirmée chez les malikites empêche de transformer sans réserve une illustration explicitement shafiite en règle malikite ; cette illustration n’a pas été utilisée comme question de pratique malikite.

### 12. Murtaqā al-wuṣūl et Marāqī al-suʿūd

*Murtaqā al-wuṣūl* est d’Abū Bakr Ibn ʿĀṣim al-Qaysī al-Gharnāṭī. Les variantes de sous-titre ne doivent pas conduire à créer plusieurs ouvrages fictifs. Le lot étudie fiqh/uṣūl, certitude, doute, probabilité et indice, ainsi que les catégories de preuves.

*Marāqī al-suʿūd* est de ʿAbd Allāh b. al-Ḥājj Ibrāhīm al-ʿAlawī al-Shinqīṭī, **pas** de Muḥammad al-Amīn al-Shinqīṭī, auteur d’un commentaire. Le lot distingue obligation, recommandation, permission, discours de qualification, condition et pilier. L’équivalence farḍ/wājib est celle du passage ; elle ne remplace pas la terminologie hanafite par une équivalence universelle.

## Limites et décision de publication

- 150 questions rédigées ; 150 passages justificatifs renseignés ; **0 validation doctrinale humaine revendiquée**.
- Un relecteur compétent doit vérifier l’arabe, l’explication française, les conditions, les divergences et l’unicité de la réponse correcte. Il doit dater et signer réellement sa revue, et peut corriger ou rejeter des entrées.
- Les transcriptions non collationnées sur une édition critique restent des témoins numériques, avec la réserve accrue des pages Fiqh Malikite en cours de relecture.
- Les citations PDF sont des transcriptions des passages visuellement consultés, sans conservation exhaustive de leur typographie ou vocalisation. Une collation de publication peut compléter ce contrôle.
- Des thèmes voisins sont présents dans plusieurs matns : c’est une comparaison de cursus, pas 150 règles totalement indépendantes. La progression pédagogique pourra être améliorée après validation.
- Les références manquantes à une édition imprimée ne doivent jamais être remplies en transférant la page d’un autre exemplaire. La page n’est pas obligatoire lorsqu’elle n’est pas vérifiée ; le lien, la section et le passage le sont.

Tous les lots restent donc `review`/« En préparation » pour la publication. Codex peut réaliser l’import, le moteur, les routes et les tests avec ces données, puis activer uniquement les lots effectivement relus. Cela préserve la règle de fiabilité donnée dans la mission initiale tout en livrant maintenant les questions/réponses demandées.
