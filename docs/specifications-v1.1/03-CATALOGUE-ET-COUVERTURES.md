# 03 — Catalogue, couverture réelle et provenance

## Décision importante : ouvrages vs éditions

Le client a demandé de **vraies images de couvertures trouvées sur Internet**, et n'a pas défini d'édition précise. Nous avons identifié de **vraies photographies/extraits d'annonces** correspondant aux titres mais **pas nécessairement aux exemplaires physiquement possédés**. C'est une **sélection de références visuelles non contractuelles**. Avant de les déployer en catalogue commercial, comparer avec les livres vendus et obtenir les droits de réutilisation requis (ou prendre ses propres photos). Le simple fait que l'image soit publique n'accorde pas une licence. Ne pas hotlinker durablement sans autorisation.

## Candidats trouvés

### 1. Coran Tajwid (Coran / Moshaf)

- Page source : https://mushaf.store/en/products/mushaf-al-tajweed-economic-edition-artistic-cover-with-word-meanings-17-24-cm
- Photo publiée : https://mushaf.store/cdn/shop/files/MushafAl-Tajweed_EconomicEditionArtisticCoverwithWordMeanings17x24C1.jpg?v=1736446187&width=1080
- Couverture : fond bleu, ornementations dorées, vraie édition Tajwid vendue sur la page.
- **À valider :** est-ce le type/édition du Coran réellement possédé ? Sinon photo illustrative seulement, remplacée plus tard.
- Prix du site Maktaba reste **10 €** (ne pas recopier le prix du marchand tiers).

### 2. Sahih al-Bukhari

- Page source : https://www.alsalam-buch.com/product-page/%D8%B5%D8%AD%D9%8A%D8%AD-%D8%A7%D9%84%D8%A8%D8%AE%D8%A7%D8%B1%D9%8A
- Photo publiée : https://static.wixstatic.com/media/79790a_f50d807751094dd09b73240dd55e0179~mv2.jpg/v1/fill/w_980%2Ch_1375%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/79790a_f50d807751094dd09b73240dd55e0179~mv2.jpg
- Couverture : fond bleu sombre, ornements dorés ; l'annonce décrit un ensemble en 4 volumes.
- **À valider :** le nombre de volumes et l'édition réellement vendus. Une couverture d'un coffret 4 tomes ne doit pas suggérer de vendre 4 tomes si ce n'est pas le cas.
- Prix Maktaba reste **100 €**.

### 3. Mukhtasar al-Akhdari — مختصر الأخضري

- Page source d'un **livre physique en arabe** : https://iqrashop.net/41215
- Couverture publiée (GIF) : https://iqrashop.net/images/41215-mukhtasar-al-akhdari.gif
- Référence de page : ouvrage arabe de jurisprudence, édition Maison d'Ennour citée, **à titre documentaire, sans promesse que ce soit ton stock**.
- Référence complémentaire éditeur : https://www.maisondennour.com/produit/mukhtasar-al-akhdari-la-priere-selon-le-rites-malikite-arabe
- **Prix Maktaba : NON COMMUNIQUÉ. Stock Maktaba : NON COMMUNIQUÉ.** Produit brouillon, pas d'ajout au panier.

## Règles d'implémentation images

1. Documenter `sourcePage`, `sourceImage`, `copyrightStatus`, `editionVerified`, `lastReviewedAt` par asset ou dans le registre de média.
2. **Ne pas télécharger ni réutiliser les photos tierces sur le site public sans droits/autorisation vérifiés**. Les URL ci-dessus servent à contrôler les véritables visuels et permettent au propriétaire d'obtenir l'accord ou de produire des photos identiques de ses exemplaires.
3. Dans l'attente, conserver les couvertures SVG V1 en production (ou utiliser une image utilisable légitimement), mais prévoir tout le câblage `realCoverPath` et possibilité de remplacer.
4. Si droit confirmé, télécharger dans `public/images/books/` en JPEG/WebP/AVIF optimisé et servir depuis la boutique ; ne pas dépendre d'URL tiers à l'exécution. GIF : convertir en WebP/PNG statique si autorisé. Enregistrer crédits et justificatif.
5. Alt text factuel : « Couverture de [titre], édition [éditeur] » **uniquement si vérifié** ; sinon « Couverture illustrative de [titre] — édition à confirmer ».
6. Vérifier poids <250 Ko quand possible, ratios 3:4, `next/image`, chargement optimisé, repli en cas d'erreur.
7. Les données édition/ISBN ne sont publiées que si vérifiées auprès du stock réel. Les tarifs externes ne fixent **jamais** les tarifs Maktaba.

## Modèle catalogue V1.1

Product : garder id, slug, prix centimes, stock, statut actif et noms. Ajouter une `Category` persistante : `id`, `slug`, `nameFr`, `parentId` nullable, `sortOrder`, `active`; créer parent `livres` puis 3 enfants `coran`, `hadith`, `fiqh`. Relier les produits à la catégorie enfant via clé de relation ou adapter le champ actuel sans casse, détaillé dans `05-ARCHITECTURE-MIGRATION.md`.

Pour Akhdari, le modèle devra supporter **un prix nullable uniquement pour le statut DRAFT**, sans casser le calcul checkout ; préférer une enum de statut claire (DRAFT/ACTIVE) et validation stricte en serveur. Éviter un faux prix à 0 €.
