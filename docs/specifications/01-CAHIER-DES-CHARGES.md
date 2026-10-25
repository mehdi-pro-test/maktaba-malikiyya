# 01 — Cahier des charges produit V1

## 1. Vision et positionnement

Maktaba Malikiya aide les étudiants francophones en sciences islamiques à acheter des livres religieux en **arabe**, depuis une boutique accessible en **français** et à **prix accessibles**. L'approche privilégiée est la simplicité et la confiance, plutôt qu'un catalogue très étendu.

**Cible initiale** : client francophone achetant en France métropolitaine ou dans certains pays européens ; peut ne pas maîtriser l'arabe comme langue d'interface, mais cherche des ouvrages arabophones.

**Objectif du MVP** : vérifier l'expérience de découverte → panier → livraison → paiement Stripe **test** → confirmation sans prélever d'argent réel.

## 2. Produits

| Champ | Produit A | Produit B |
|---|---|---|
| Identifiant logique | `moshaf-coran` | `sahih-al-bukhari` |
| Nom affiché FR | Coran (Moshaf) | Sahih al-Bukhari |
| Nom AR suggéré | مصحف القرآن الكريم | صحيح البخاري |
| Catégorie | Coran | Hadith |
| Prix | 10,00 € | 100,00 € |
| Stock de démonstration | 10 | 10 |
| Images | visuel provisoire licite | visuel provisoire licite |

Aucune édition, pagination, maison d'édition, reliure ou traduction spécifique ne doit être inventée. Les photos internet ne peuvent être reprises que si leur réutilisation est autorisée ; sinon utiliser des visuels graphiques provisoires clairement identifiés.

## 3. Parcours principal

1. Le visiteur ouvre l'accueil et voit la grande bannière « Découvrir nos livres ».
2. Il accède à un catalogue ou aux catégories Coran / Hadith.
3. Il ouvre une fiche minimaliste (photo, prix, bouton Ajouter au panier).
4. Il peut choisir plusieurs exemplaires dans la limite du stock disponible.
5. Il voit sous-total et estimation de livraison selon pays.
6. Il saisit son e-mail et son adresse, sans compte client.
7. Il paie dans Stripe Checkout **test** avec carte de test.
8. Après notification serveur vérifiée du paiement, la commande passe à payée, le stock est diminué et la confirmation e-mail est programmée.
9. La page de confirmation affiche un numéro de commande (les données privées ne doivent pas être exposées avec un identifiant devinable seul).

## 4. Règles métier (source de vérité serveur)

- Monnaie : EUR ; conserver les montants en **centimes entiers**.
- Coran = `1000` centimes ; Sahih al-Bukhari = `10000` centimes.
- Frais d'expédition France métropolitaine : `400` centimes si sous-total produits **< 5000**, sinon `0`.
- Frais pour tout autre pays européen **autorisé à la commande** : `2000` centimes forfaitaires, même au-delà de 50 €.
- La liste exacte des pays européens desservis est **paramétrable** et doit être explicite dans le projet. Hors pays autorisés : refuser la commande proprement. Les codes postaux ultramarins ne relèvent pas automatiquement du tarif France métropolitaine.
- Un acheteur peut commander plusieurs exemplaires, **sans dépasser le disponible**.
- Jamais de prix, totaux, livraison ni état de paiement décidés côté navigateur.
- Le succès par retour du navigateur Stripe **ne suffit jamais** à marquer une commande payée : webhook Stripe signé obligatoire.
- Rejeu d'un webhook : aucun deuxième retrait de stock, aucune deuxième commande, pas de deuxième e-mail automatique.
- En V1, les stocks sont modifiables par seed/script base de données documenté, **sans interface admin**.
- **Aucun paiement en mode live** autorisé durant la V1 ; si une clé `sk_live` apparaît, l'application refuse de démarrer son intégration de paiement.

## 5. Fonctionnalités V1 / hors V1

### Inclus

- Accueil, en-tête, catégories, fiches, panier, validation des quantités.
- Formulaire commande invité et validation des adresses/pays.
- Stripe Checkout test, notifications webhooks, page retour/annulation.
- Stock durable avec mécanisme contre survente simultanée.
- E-mail de confirmation de commande en mode configuré ; fallback sûr en environnement local sans domaine vérifié.
- Mentions des frais de livraison et du caractère « paiement test » visibles.
- Responsive, accessibilité de base, référencement élémentaire.
- Logs sans données sensibles ; scripts et guide de mise en route.

### Exclu

- Comptes clients et espace personnel.
- Panel d'administration.
- PayPal ou carte en paiement réel.
- Gestion de catalogue complexe, coupons, promotions et transporteur intégré par API.
- Application mobile native.
- E-mails marketing, statistiques de suivi publicitaire, recommandations personnalisées.

## 6. Critères d'acceptation globaux

- [ ] Un utilisateur peut ajouter 3 Corans, modifier à 2, supprimer un item et voir le total juste.
- [ ] Panier 1 Coran en France : 10 € + 4 € = **14 €**.
- [ ] Panier 5 Corans en France : 50 € + 0 € = **50 €**.
- [ ] Panier 1 Sahih al-Bukhari en France : 100 € + 0 € = **100 €**.
- [ ] Panier 1 Coran en pays européen pris en charge : 10 € + 20 € = **30 €**.
- [ ] Le formulaire invité exige un e-mail valide et une adresse de livraison complète.
- [ ] Stripe n'utilise **que** des clés de test et le paiement de test est réalisable.
- [ ] Une commande test réussie figure en base ; le stock baisse une seule fois et l'e-mail de confirmation suit la bonne logique d'envoi.
- [ ] Un paiement annulé ou expiré ne consomme pas le stock final.
- [ ] Deux achats concurrents ne peuvent pas dépasser le stock total.
- [ ] Le site fonctionne sur mobile, tablette, bureau, clavier et avec images indisponibles.
- [ ] Lint, typage, tests et build sont verts dans GitHub Actions.

## 7. Questions volontairement différées (ne pas bloquer le démarrage)

- Tarifs réels de Colissimo, dimensions/poids et éventuels écarts avec les frais commerciaux fixés.
- Liste finale exacte des pays servis ; douane, taxes et exclusions hors UE.
- Régime fiscal du vendeur et traitement TVA des livres (ne pas écrire « TTC » sans vérification).
- Domaine e-mail d'envoi et identité de l'expéditeur confirmés.
- Édition, photos autorisées et vraies données de stock avant exploitation commerciale.
- Informations légales obligatoires et politique de retour avant activation de la vente réelle.
