# Checklist — 190 nouvelles questions déjà approuvées par le propriétaire

## Validation du contenu : acquise

- [x] **Décision du propriétaire reçue dans la conversation du 26/10/2026 :** « je valide les questions réponses donc pas de brouillon ».
- [x] **190 questions couvertes** : 140 *Bidāyat al-Mujtahid*, 50 *Al-Istidhkār*.
- [x] Enregistrement daté des approbations individuelles, avec empreintes SHA du texte reçu et de la banque actualisée, dans `08-VALIDATION-PROPRIETAIRE-190.json`.
- [x] Chaque question conserve quatre choix, une réponse, l'explication française et la citation arabe.

## Vérifications distinctes (ne pas présenter comme faites)

- [ ] Contrôler à l'aide d'une édition primaire ou d'une transcription fiable chaque citation arabe (celles-ci sont parfois tirées d'URL de chapitre) : **non attesté**.
- [ ] Vérifier les attributions d'avis rapportés et les exceptions de fiqh comparé chez Ibn Rushd : **non attesté**.
- [ ] Comparer automatiquement et humainement les énoncés avec les derniers QCM réellement en Production : collisions sémantiques éventuelles.
- [ ] Confirmer qu'il n'existe pas de distracteur également défendable.
- [ ] Ne pas compléter page, ISBN, éditeur ni relecteur sans preuve. Les citations restent un relevé de transcription en ligne et `textCheck: requires-editorial-collation` n'est pas une attestation de lecture d'un fac-similé.

## Contrôles techniques Codex

- [ ] 140 nouveaux IDs Bidāya, 50 nouveaux IDs Istidhkār ; préserver les 20 historiques.
- [ ] Adapter `MAX_APPROVED_POOL=100` pour un pool d'au moins 150, sans régression ni troncature.
- [ ] Vérifier `10/150` et `10/60` sans remise, stabilité d'une tentative, Rejouer et score final /10.
- [ ] Vérifier que les citations RTL s'affichent après réponse, pas avant, et que les contenus effectivement non approuvés restent cachés.
- [ ] Vérifier bibliographie, doublons, cohérence de l'empreinte de validation et non-altération des réponses.
- [ ] Tests unitaires, lint, typecheck, build, Playwright desktop/mobile ; base DB de test isolée si nécessaire.
- [ ] Ouvrir une PR non fusionnée. Aucune migration de Production, fusion ou déploiement sans demande expresse.

**Statut final du lot : `owner-approved`, PAS `research-draft`.** Cette validation éditoriale ne doit pas être décrite comme une expertise religieuse indépendante.
