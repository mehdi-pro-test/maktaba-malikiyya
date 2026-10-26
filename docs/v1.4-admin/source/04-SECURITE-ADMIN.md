# Authentification & sécurité — ADMIN UNIQUE

## Choix structurant

**Une identité propriétaire unique** dès le départ. Aucune inscription publique, aucun espace client, aucun rôle ou invitation d'employé en V1.4. L'unicité doit être assurée côté serveur et BD / fournisseur d'identité, pas seulement en masquant l'UI.

### Connexion

1. Choisir et documenter **une solution d'authentification éprouvée** compatible avec Next.js 16.4.3/Node 24, idéalement une solution maintenue prenant en charge MFA (TOTP ou passkey), rotation des sessions et récupération sécurisée. **Ne pas construire soi-même la cryptographie des mots de passe, du TOTP ou des cookies**. Tester la compatibilité avec les docs Next.js locales avant de coder. Éviter un fournisseur exigeant de mettre les identifiants secrets dans le bundle client.
2. L'identité autorisée est définie par un identifiant stable d'authentification et une allowlist serveur (`ADMIN_EMAIL` configurée côté hébergeur + provider user ID si disponible). L'e-mail seul sans preuve de connexion **ne donne aucun privilège**.
3. **MFA obligatoire** avant toute action admin (pas facultatif). Le compte est provisionné par une procédure de bootstrap **à usage unique** protégée, jamais par une route d'inscription ouverte ou un compte/test password commité. Tester déconnexion et recovery de MFA.
4. Sessions via cookie `HttpOnly`, `Secure` en production, `SameSite` approprié, durée et expiration idle raisonnables. Rotation/révocation de session sur changement sensible ; bouton de déconnexion effectif. En cas de compromission, possibilité de révoquer toutes les sessions.
5. Limitation de tentative, protection brute force et surveillance sans exposer publiquement le compte propriétaire. Échecs d'auth dans journal sans secrets.

### Autorisation incontournable

- **Chaque page admin, chaque Server Action et chaque endpoint admin** vérifie l'identité et MFA **côté serveur**, même si le layout/middleware vérifie déjà.
- Read, export, upload, mutation : tous protégés. Ne pas accepter des chemins arbitraires de fichiers ni des ID fourni par client sans contrôle d'appartenance/valeur.
- CSRF : protection de l'origine et mécanismes de la solution auth pour toutes les mutations. Cookies adaptés ; pas de GET mutateur. `Cache-Control: private, no-store` sur les pages et données personnelles.
- Ne jamais exposer dans HTML/RSC des commandes clients, adresses, emails, secrets ou questions brouillons en dehors d'une session admin valide. Éviter préchargement dans une page publique.
- `robots: noindex, nofollow` en défense UX seulement : cela **ne remplace pas l'auth**.
- Refuser les redirections externes ouvertes, encadrer uploads, validation stricte Zod côté serveur. Restreindre les origines de mutation.

### Données personnelles et conformité

Commandes = données clients ; minimiser les champs listés par défaut, privilégier numéro de commande + statut + date dans la vue liste ; les adresses complètes uniquement sur détail admin. Ne journaliser ni token commande, ni adresse complète, ni carte bancaire, ni MFA. Export CSV à autorisation forte et audit ; aucun export public. Définir une conservation de données conforme aux obligations applicables, sans suppression automatique naïve de pièces justificatives.

### Journal d'audit

Table append-only `AdminAuditEvent` : 
`id, occurredAt, actorId, action, entityType, entityId, priorSummaryRedacted?, nextSummaryRedacted?, reason?, requestCorrelationId?`.
Les opérations atomiques sauvegardent mutation + audit dans la même transaction (quand possible). Rechercher la trace des changements de prix, stock, commande, titre, publication/archivage de question. Ne pas exposer secrets et données personnelles superflues dans l'audit.

### Important

Un compte admin unique ne signifie **pas** une sécurité simplifiée : le risque sur l'intégralité de la boutique est plus élevé. Aucun bypass MFA « temporaire » en Production, aucun login admin/dev caché, aucun mot de passe par défaut.
