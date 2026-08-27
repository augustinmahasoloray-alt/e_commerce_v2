# StepUp — Dashboard Admin — Contexte de démarrage

Colle ce prompt en début de conversation pour que l'assistant ait tout le contexte avant que tu demandes des modifications.

---

## Projet

**StepUp Admin Dashboard** est un nouveau module, séparé du frontend client React (`stepup-client`), destiné à un usage **strictement personnel** (moi = seul admin/vendeur, cohérent avec le pivot single-vendor de StepUp). Il sert à piloter la marketplace : ajout/gestion de produits, et potentiellement d'autres ressources (catégories, marques, commandes, etc.), avec visualisation de données (graphiques) tirées de la base réelle.

## Stack (différente du client principal — volontairement)

- **Pas de React, pas de Vite** pour ce module : HTML pur + Tailwind + JS vanilla (`fetch` natif, pas de framework).
- **Backend partagé** : même serveur Express/Prisma/PostgreSQL que le client principal (`server/`). Le dashboard consomme et alimente les mêmes tables via l'API existante ou de nouvelles routes admin dédiées.
- Le dashboard doit rester **cohérent visuellement** avec le marketplace React, mais implémenté séparément (pas de composants partagés — les mêmes tokens de design sont reproduits en CSS pur).

## Design system exact à répliquer (copié du fichier CSS source du client React)

**Polices :**
- `Albert Sans` (Bunny Fonts, poids 100–900 + italiques) → police de corps (`font-body`)
- `Metal` (Bunny Fonts, poids 400) → police de titres (`font-headline`)
- `Qurova` (fichiers `.otf` locaux, poids 300/400/500/600/700) → police display (`font-display`). **Sur le dashboard, ces fichiers `.otf` devront être copiés ou référencés depuis un chemin statique accessible** (à trancher : dossier `public/fonts/qurova/` partagé ou dupliqué).

**Couleurs (variables CSS, basculées via classe `.dark` sur `<html>`) :**
```css
:root {
  --color-background: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-text: #111827;
  --color-accent: #e09f3e;
  --color-muted: #03045e;
}
.dark {
  --color-background: #0B0B0B;
  --color-surface: #161616;
  --color-text: #F5F5F5;
  --color-accent: #e09f3e; /* identique en light et dark */
  --color-muted: #A0AEC0;
}
```

**Transition douce entre thèmes :** `background-color 300ms ease, color 300ms ease` sur `body`.

**Décision technique pour le dashboard (pas de build Tailwind v4 ici, donc pas de `@theme`/`@import "tailwindcss"`) :**
On utilisera le **CDN Tailwind (`cdn.tailwindcss.com`)** avec une config inline en `<script>` qui déclare les couleurs et polices ci-dessus comme extensions du thème (`tailwind.config = { theme: { extend: { colors: {...}, fontFamily: {...} } } }`), plus une petite feuille `<style>` pour les `@font-face` de Qurova et les variables CSS `.dark`. Ça reproduit `bg-backgroundColor`, `text-accent`, `font-display`, etc. sans avoir besoin d'un pipeline de build.

## Fonctionnalités attendues

- **Authentification restreinte, spécifique à ce dashboard** :
  - Une page "Créer un compte" qui ne doit fonctionner **que 2 fois maximum** (puis se désactive/se bloque définitivement, ou renvoie une erreur). Logique proposée : vérifier `await prisma.user.count({ where: { role: "admin" } })` côté backend, refuser au-delà de 2.
  - Une page "Connexion" classique ensuite, réutilisant le système JWT déjà en place côté backend (`authMiddleware`, `JWT_SECRET`, header `Authorization: Bearer`).
  - Le dashboard entier doit être inaccessible sans être connecté en tant qu'admin (token stocké en `localStorage` côté dashboard, comme sur le client React).
- **Gestion produits (CRUD)** : ajouter, modifier, supprimer des produits — avec leurs variantes (taille/couleur/stock), images, catégorie, marque.
- **Autres ressources potentielles** (à confirmer au fur et à mesure) : catégories, marques, commandes, éventuellement coupons.
- **Graphiques / stats** : lecture de données agrégées depuis la base (ventes, stock, produits par catégorie) affichées en graphiques. Bibliothèque proposée : **Chart.js via CDN**, simple à intégrer en JS vanilla.
- **Flux de données** : les produits/données créés ou modifiés depuis le dashboard doivent être immédiatement visibles côté marketplace (`Boutique.jsx` du client React), via les endpoints API partagés ou dédiés `/api/admin/...`.

## Contexte technique existant à réutiliser (backend)

- Prisma 7 avec `@prisma/adapter-pg`, client généré dans un `output` custom (`generated/prisma`, **pas** `@prisma/client` par défaut — attention aux imports, ex. `import { PrismaClient } from "../../generated/prisma/index.js"`).
- `authMiddleware` existant, basé sur un header `Authorization: Bearer <token>` (pas de cookies), vérifie un JWT signé avec `process.env.JWT_SECRET`.
- `User.role` enum déjà présent : `client | vendeur | admin` — `vendeur` en cours de suppression (pivot single-vendor), `admin` est le rôle pertinent pour ce dashboard.
- Modèles Prisma pertinents : `Product`, `ProductVariant`, `ProductImage`, `Category` (hiérarchique via `parent_id`, utilisable pour "univers" > "catégorie"), `Brand`, `Order`/`OrderItem` (pas encore branchés côté frontend).

## Points à trancher ensemble avant de coder

1. Où vit physiquement le dashboard : servi en statique par Express (ex: `server/public/admin/`), ou dossier totalement séparé ouvert directement en navigateur ? (Le servir depuis Express simplifie l'accès aux fonts locales Qurova et évite les soucis CORS.)
2. Confirmer la logique de limite "2 comptes admin max" — comptage en base suffit, ou tu veux un flag/env plus strict ?
3. Confirmer Chart.js (CDN) pour les graphiques, sauf préférence contraire.
4. Nouvelles routes Express dédiées `/api/admin/...`, protégées par un middleware qui vérifie `role === "admin"` en plus du JWT (`authMiddleware` actuel ne vérifie que la validité du token, pas le rôle) ?

## Comment je veux qu'on travaille

- Fichiers complets plutôt que des snippets partiels, sauf modification ciblée explicitement demandée.
- Commandes terminal : forme longue d'abord, puis forme courte, puis explication des flags.
- Toujours prévoir le dark mode.
- `Ctrl+A` puis coller pour remplacer le contenu d'un fichier en cas de merge complet.

---

**Prêt à passer à l'action.** Premier sujet concret : *[à préciser]*