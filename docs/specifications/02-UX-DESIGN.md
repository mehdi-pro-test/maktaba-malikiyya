# 02 — UX/UI, identité et écrans

## Intention

Librairie traditionnelle islamique **sobre et élégante**, avec une chaleur proche d'un intérieur de bibliothèque et d'un salon de thé matcha. Éviter le kitsch et les effets décoratifs qui nuisent à l'achat. Interface en français ; seuls les titres arabes sont en arabe.

## Design tokens conseillés (ajustables)

- Vert forêt : `#183E32`
- Vert sauge : `#667C61`
- Crème : `#F7F3E8`
- Doré discret : `#B69A54`
- Brun profond / texte : `#2B261F`
- Fond secondaire : `#EEE7D7`

Palette lisible, contrastes WCAG AA pour textes et actions, pas de doré pâle utilisé seul comme texte.

## Typographie / logo

- Logo : texte « Maktaba Malikiya », **sans symbole** ; présentation calligraphique élégante mais accessible. Ne pas télécharger/utiliser une police sans licence.
- Corps : police latine lisible. Titre arabe affiché dans une police couvrant correctement les caractères arabes, `lang="ar" dir="rtl"` sur le segment arabe uniquement.
- Ne pas inventer une orthographe arabe officielle de la marque : logo latin en attendant validation.

## Écrans

### Accueil `/`

- En-tête : logo, Accueil, Coran, Hadith, Panier avec nombre d'articles.
- Grande bannière bibliothèque / lumière chaude, texte surimprimé accessible.
- Proposition de valeur : « Des ouvrages en arabe pour les étudiants en sciences islamiques, à prix accessibles. »
- Bouton : « Découvrir nos livres » ancré au catalogue.
- Bloc catalogue 2 cartes, avec photo / titre / prix / bouton.
- Bandeau discret : Livraison en France métropolitaine 4 €, offerte dès 50 € d'achats ; Europe : 20 € dans les pays desservis.
- Pied de page : Contact, mentions légales et politiques (contenu clairement à compléter avant production).

### Catégories `/coran` et `/hadith`

- Titre et petit texte FR ; liste filtrée.
- État vide si catalogue temporairement non disponible.

### Fiche `/livres/[slug]`

- Visuel, titre FR + AR, prix, disponibilité, choix quantité, « Ajouter au panier ».
- Ne pas créer de fausses informations bibliographiques.

### Panier `/panier`

- Produit, quantité +/−, suppression, sous-total.
- Prévisualisation frais selon pays sélectionné ; total final serveur recalculé à la commande.
- Bouton « Passer commande ».

### Commande `/commande`

- Champs : nom/prénom destinataire, email, adresse (ligne 1, complément facultatif, code postal, ville, pays pris en charge).
- Récapitulatif détaillé ; consentements requis si pertinents (pas de marketing opt-in forcé).
- Message très visible : « Paiement en mode test — aucun débit réel ».
- Bouton « Payer par carte (test) » vers Stripe Checkout.

### Confirmation `/commande/confirmation`

- Résultat clair : en attente / confirmée / non aboutie, via vérification côté serveur.
- Numéro de commande non secret ; ne pas révéler adresse complète via une URL publique devinable.
- Indication d'e-mail selon l'état réel.

## Interactions et accessibilité

- Responsive : petite largeur 320 px jusqu'au bureau large.
- Menu clavier et mobile fonctionnel ; label explicite pour boutons d'icônes.
- Gestion focus après ajout panier et annonces accessibles des erreurs.
- Charger les images efficacement ; afficher texte alternatif descriptif et placeholder en cas d'échec.
- Pas de fenêtres modales inutiles ; pas de dark patterns.

## Médias

Si aucune photo de livre avec droits de réutilisation clairs n'est trouvée, créer des visuels locaux neutres (couvertures stylisées) avec libellé « Visuel provisoire ». Éviter de représenter une édition réelle de façon trompeuse. Une image de bannière doit être sous licence compatible, créée spécifiquement ou remplacée par un visuel CSS/design.
