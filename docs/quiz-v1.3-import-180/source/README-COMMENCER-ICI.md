# Maktaba Malikiyya — alimentation Intermédiaire et Avancé (V1.3)

**Ce ZIP unique comporte 180 nouvelles questions-réponses rédigées :** 30 pour chacun des trois ouvrages intermédiaires et 30 pour chacun des trois ouvrages avancés. Les questions sont à l’état **research-draft**, non approuvées et non publiées. L’archive contient six banques JSON, un export CSV complet, le registre de contrôle, une méthode de révision et le prompt Codex.

## Dénombrement exact

| Niveau | Ouvrage | Questions V1.2 connues | Nouvelles candidates | Total rédigé après ajout | Manque pour 100 |
|---|---|---:|---:|---:|---:|
| Intermédiaire | المقدمة العزية للجماعة الأزهرية | 10 | 30 | 40 | 60 |
| Intermédiaire | أسهل المسالك في مذهب الإمام مالك | 10 | 30 | 40 | 60 |
| Intermédiaire | الرسالة | 10 | 30 | 40 | 60 |
| Avancé | مختصر خليل | 10 | 30 | 40 | 60 |
| Avancé | الشرح الكبير على مختصر خليل | 10 | 30 | 40 | 60 |
| Avancé | حاشية الدسوقي على الشرح الكبير | 10 | 30 | 40 | 60 |
| **TOTAL** | **6 livres** | **60** | **180** | **240** | **360** |

## Contenu du ZIP

- `banques/*.json` : 6 fichiers conformes au style éditorial V1.3 existant (`schemaVersion: 1.3-research-candidates-1`, `editorialStatus: research-draft`). Ils contiennent la question, quatre options, un ID de réponse correcte, une explication, un titre/auteur/chapitre arabe et une citation **provisoire** accompagnée d’une URL.
- `QUESTIONS-REPONSES-180.csv` : l’intégralité des 180 QCM à relire, avec réponses visibles ; séparateur `;` en UTF-8 avec BOM pour Excel français.
- `MANIFEST-CONTROLE.json` : compte de questions, contrôles automatiques réussis et limites.
- `documentation/CONTROLE-DES-SOURCES.md` : consignes de vérification et fiches de sources.
- `documentation/PROMPT-CODEX.md` : prompt technique prêt à copier-coller.

## Mise en garde éditoriale essentielle

Cette livraison est une **rédaction de candidats QCM**, et non une attestation de vérification par un spécialiste. Les extraits arabes sont des *repères de travail* : ils n’ont pas été collationnés mot à mot sur un fac-similé authentifié, en particulier pour **l’‘Izziyya**, dont les versions OCR consultées sont de qualité variable. Pour **al-Dardîr et al-Dasûqî**, la séparation entre texte du commentaire et annotations de la glose exige une vérification distincte. Tous les distracteurs (mauvaises réponses) doivent également être relus : certains sont tirés des autres bonnes réponses du même thème et peuvent être ambigus pour une autre question.

**Aucune des 180 nouvelles questions ne doit apparaître comme publiée à cette étape.** On conserve les 150 QCM approuvés de V1.2, les banques débutantes V1.3 et les approbations V1.3 déjà présentes sur le dépôt. Codex ne doit pas inventer, approuver ou publier du contenu religieux.

## Base existante et non-régression

Le dépôt a été contrôlé sur le HEAD `bc8df4071c87db6037afd86136b0c698406f6223` le 26 octobre 2026. Codex doit récupérer le **dernier** `origin/main` au moment de l’intégration (qui peut être plus récent), créer une nouvelle branche/PR et préserver les routes `/quiz/niveaux`, le moteur de tirage, toutes les banques et la boutique sans changer Prisma, stocks, Stripe TEST, Resend, commandes ou migrations de Production.
