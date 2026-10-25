# Validation déclarée et activation des quinze quiz

## Décision du propriétaire

Le 26 octobre 2026, le propriétaire a confirmé dans la conversation : **« relecture humaine ok / je valide »**. Cette déclaration porte sur les 150 questions précédemment fournies et présentées en attente de relecture. L’accord est enregistré sous `mehdi-pro-test — validation déclarée dans la conversation`, sans inventer le nom ou la qualification d’un relecteur tiers. Il ne constitue pas une attestation supplémentaire d’expertise par le logiciel.

Cette décision autorise l’activation du contenu sur la branche V1.2. **Elle n’a pas été interprétée comme une demande de fusion ou de déploiement Production** : la PR #3 reste ouverte et non fusionnée.

## Modifications

- Les quinze ouvrages et les 150 questions passent de `review` à `published`.
- Les métadonnées de relecture reprennent cette déclaration et sa date, sans changer question, choix, bonne réponse, explication ou citation.
- Les 150 décisions sont importées dans `src/data/quiz-v1.2/reviews.json` par le même validateur que les rapports ultérieurs, liées à l’empreinte canonique de cette banque exacte.
- Un test compare tous les contenus et les sources à la banque de recherche originale, conservée immuable sous `recherche/`.
- La barrière reste active : un rapport manquant, rejeté ou périmé ferme le lot ; les brouillons sont toujours vérifiés sur la banque initiale et une route d’application de test distincte.
- Les dates calendaires de relecture sont contrôlées dans le fuseau `Europe/Paris` pour accepter le jour français après minuit, même lorsque UTC est encore la veille. Un test couvre cette limite et le refus du lendemain.

## État courant sur la branche

| Parcours      | Ouvrage                                      | Questions | Approbations enregistrées | Jouable     |
| ------------- | -------------------------------------------- | --------: | ------------------------: | ----------- |
| debutant      | مختصر الأخضري                                |        10 |                        10 | Oui         |
| debutant      | المرشد المعين على الضروري من علوم الدين      |        10 |                        10 | Oui         |
| debutant      | المقدمة العشماوية                            |        10 |                        10 | Oui         |
| intermediaire | المقدمة العزية للجماعة الأزهرية              |        10 |                        10 | Oui         |
| intermediaire | أسهل المسالك في مذهب الإمام مالك             |        10 |                        10 | Oui         |
| intermediaire | الرسالة                                      |        10 |                        10 | Oui         |
| avance        | مختصر خليل                                   |        10 |                        10 | Oui         |
| avance        | الشرح الكبير على مختصر خليل                  |        10 |                        10 | Oui         |
| avance        | حاشية الدسوقي على الشرح الكبير               |        10 |                        10 | Oui         |
| ultime        | بداية المجتهد ونهاية المقتصد                 |        10 |                        10 | Oui         |
| ultime        | الاستذكار                                    |        10 |                        10 | Oui         |
| usul          | إيصال السالك إلى أصول مذهب الإمام مالك       |        10 |                        10 | Oui         |
| usul          | الورقات مع قرة العين بشرح ورقات إمام الحرمين |        10 |                        10 | Oui         |
| usul          | مرتقى الوصول إلى علم الأصول                  |        10 |                        10 | Oui         |
| usul          | مراقي السعود لمبتغي الرقي والصعود            |        10 |                        10 | Oui         |
| **Total**     | **15 ouvrages**                              |   **150** |                   **150** | **15 quiz** |

## Contrôles d’activation

- 85 tests unitaires réussis, dont conservation des 150 contenus originaux, ouverture des quinze lots, blocage des brouillons et test du changement de jour France/UTC.
- TypeScript et build de production réussis.
- Les 35 tests PostgreSQL précédents restent des résultats de la livraison initiale ; ils ne sont pas présentés comme rejoués pour cette activation qui ne touche pas à la base.
- Recette navigateur d’activation : 84 cas vérifiés sur les quatre profils. La suite globale a passé 80/84 cas ; les quatre échecs concernaient un comptage textuel en double dans HTML + RSC du test de brouillons. Le comptage a été déplacé sur les quinze cartes effectivement rendues, puis les quatre cas ont été rejoués avec succès (`--last-failed`, 4/4). Aucune assertion de fermeture ou d’absence de divulgation n’a été retirée.
- Formatage, lint sans avertissement et TypeScript : réussis.

Les E2E vérifient désormais les quinze quiz réels : lancement, première question, réponse correcte, score et citation arabe après validation sur les quatre profils navigateur. Les tests complets de score 0/10, 5/10, 10/10, double clic et Rejouer conservent leurs fixtures synthétiques. Les quinze brouillons initiaux restent fermés dans une application de test séparée, sans fuite du contenu dans son HTML/RSC.

Les [captures après validation](../screenshots/quiz-v1.2-validation/) montrent les quinze lots disponibles et une correction réelle d’Akhdari, sur desktop et mobile.

Empreinte canonique de la banque approuvée : `eb1b6ab9830e22a543603e0093f6c9ac100f6e9209cae403413c1528a26598fa`.

Les tests initiaux de V1.1 demeurent : boutique, panier, livraison, checkout invité, quiz classique et accessibilité. Aucun prix, stock, paiement, commande, e-mail, schéma ou migration modifié. Aucun accès Neon ni changement Production.

Les rapports sous `recherche/` décrivent **l’état original avant cette validation** et conservent leurs empreintes. Leurs comptes de zéro approbation ne sont pas le compte courant de la branche. Les résultats antérieurs sont dans `LIVRAISON.md`.
