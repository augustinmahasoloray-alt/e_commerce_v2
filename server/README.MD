# StepUp — Architecture Backend

Document de référence pour comprendre l'organisation du backend (`server/`) : à garder sous la main pour situer où ajouter une nouvelle route, un nouveau contrôleur, ou pour onboarder quelqu'un (ou soi-même après une pause) sur le projet.

---

## 1. Vue d'ensemble

StepUp est composé de **deux frontends** consommant le **même backend** :

| Frontend | Stack | Usage |
|---|---|---|
| `stepup-client` | React 19 + Vite + Tailwind v4 | Boutique publique (clients) |
| `server/public/admin` | HTML pur + Tailwind CDN + JS vanilla | Dashboard admin (usage strictement personnel) |

Le backend (`server/`) est un serveur **Express** unique, avec **Prisma 7** (`@prisma/adapter-pg`) comme ORM vers **PostgreSQL**. Il sert à la fois l'API JSON consommée par le client React et les fichiers statiques du dashboard admin.

Le projet est historiquement une marketplace multi-vendeurs, **en cours de conversion vers un modèle mono-vendeur** (un seul `Vendor` en base, résolu via `prisma.vendor.findFirst()`). Les modèles `Vendor` / `VendorOrder` / `VendorTransaction` existent toujours dans le schéma pour cette raison — ce n'est pas un oubli du pivot, c'est une simplification volontaire (pas de renommage pour l'instant).

---

## 2. Structure des dossiers (`server/src`)

```
server/
├── generated/prisma/        # Client Prisma généré (output custom, PAS @prisma/client)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── public/
│   └── admin/                # Dashboard admin statique (HTML/CSS/JS vanilla)
│       ├── css/style.css
│       ├── js/                # api.js, dashboard.js, products.js, categories.js,
│       │                       # orders.js, users.js, stats.js, theme.js
│       ├── fonts/qurova/       # polices locales (.otf)
│       ├── index.html
│       ├── dashboard.html
│       └── create-account.html
└── src/
    ├── app.js                 # montage des routes + middlewares globaux
    ├── server.js               # point d'entrée (listen)
    ├── config/
    ├── controllers/
    │   ├── admin*.controller.js   # logique réservée au dashboard admin
    │   └── *.controller.js        # logique côté client (boutique)
    ├── middlewares/
    │   ├── auth.middleware.js     # vérifie le JWT
    │   └── role.middleware.js     # vérifie req.user.role (ex: ["admin"])
    ├── routes/
    │   ├── admin*.routes.js
    │   └── *.routes.js
    ├── services/
    └── scripts/                  # seedAdmin.js, seedCategoriesBrands.js, seedOrders.js…
```

**Règle de nommage** : tout ce qui est réservé au dashboard admin est préfixé `admin` (`adminProduct.controller.js`, `adminOrder.routes.js`, etc.), séparé du contrôleur/route "client" équivalent quand celui-ci existe déjà (ex: `order.controller.js` vs `adminOrder.controller.js`). Ça évite de mélanger deux logiques d'accès différentes dans un même fichier.

---

## 3. Authentification & rôles

- **JWT** signé avec `process.env.JWT_SECRET`, transmis via header `Authorization: Bearer <token>` (pas de cookies).
- `authMiddleware` : vérifie que le token est valide et peuple `req.user`. Ne vérifie **pas** le rôle.
- `roleMiddleware(["admin"])` : à chaîner après `authMiddleware` sur toute route `/api/admin/...`, vérifie que `req.user.role` fait partie de la liste autorisée.
- `User.role` (enum) : `admin | vendeur | client`. `vendeur` est en cours de suppression (pivot mono-vendeur) — ne pas construire de nouvelle fonctionnalité dessus.
- Le dashboard admin a sa **propre** page de création de compte (`create-account.html`), volontairement limitée à 2 utilisations maximum (comptage de `role: "admin"` en base), puis bascule sur une page de connexion classique réutilisant le même système JWT que le client.

Pattern systématique d'une route admin :

```javascript
router.get("/", authMiddleware, roleMiddleware(["admin"]), adminXController.list);
```

---

## 4. Convention Admin vs Client

| | Client (`stepup-client`) | Admin (`public/admin`) |
|---|---|---|
| Auth | JWT stocké côté client React | JWT stocké en `localStorage` du dashboard |
| Rôle requis | `client` (ou aucun pour les routes publiques) | `admin` uniquement |
| Contrôleurs | `product.controller.js`, `order.controller.js`, `user.controller.js`… | `adminProduct.controller.js`, `adminOrder.controller.js`, `adminUser.controller.js`, `adminStats.controller.js`… |
| Préfixe de routes | `/api/products`, `/api/orders`, `/api/users`… | `/api/admin/products`, `/api/admin/orders`, `/api/admin/users`, `/api/admin/stats` |
| Objectif | Lecture publique + actions du client sur ses propres données | CRUD complet + agrégations/statistiques sur toute la base |

Ne jamais faire porter à un contrôleur "client" une logique réservée à l'admin (et inversement) : si une route a besoin d'un accès admin, elle vit dans un fichier `admin*`, même si une route similaire existe déjà côté client.

---

## 5. Montage des routes dans `app.js`

Il n'y a **pas** de `routes/index.js` central pour l'admin : chaque nouveau module de routes admin est importé et monté directement dans `app.js`, à la suite des autres :

```javascript
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminCategoryRoutes from "./routes/adminCategory.routes.js";
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import adminUserRoutes from "./routes/adminUser.routes.js";
import adminStatsRoutes from "./routes/adminStats.routes.js";

// ...

app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
```

⚠️ Point de vigilance déjà rencontré : un import/montage dupliqué (ex. `adminOrderRoutes` importé et monté deux fois) ne casse rien en pratique (Express écrase avec le même router) mais doit être nettoyé dès qu'on le repère.

---

## 6. Prisma — points à retenir

- Client généré dans un **output custom** : `import { PrismaClient } from "../../generated/prisma/index.js"` — **pas** `@prisma/client`.
- Connexion via l'adaptateur PG :
  ```javascript
  import { PrismaPg } from "@prisma/adapter-pg";
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  ```
- Pour les agrégations groupées par jour (ex. évolution des ventes sur 30 jours), Prisma ne fait pas bien le `GROUP BY date_trunc` nativement → on passe par `prisma.$queryRaw` avec des valeurs paramétrées (template literal `${...}`, pas de concaténation de string — évite l'injection SQL).
- `SUM(...)` sur PostgreSQL renvoie un `BigInt` côté driver → toujours convertir en `Number(...)` avant de sérialiser en JSON, sinon `JSON.stringify` plante sur les `BigInt`.

---

## 7. Dashboard admin — état des lieux fonctionnel

| Section | État |
|---|---|
| Auth (create-account + login) | ✅ |
| Vue d'ensemble (cartes + graphique catégories) | ✅ |
| Produits (CRUD, soft-delete `actif:false`, combobox univers/sous-catégorie/marque) | ✅ |
| Catégories & Marques | ✅ |
| Commandes | ✅ (listing + détail + changement de statut) |
| Clients & Vendeurs (liste + blocage/déblocage) | ✅ (nécessite le champ `compte_actif` sur `User` + migration) |
| Statistiques (ventes, top produits, top catégories, nouveaux utilisateurs) | ✅ |
| Finances (revenus/bénéfices/paiements reçus) | ❌ à faire |

Chaque section suit le même pattern côté frontend vanilla :
1. Un fichier JS dédié dans `public/admin/js/` (ex. `users.js`, `stats.js`) qui appelle l'API via `apiFetch()` (défini dans `api.js`, gère le header `Authorization` et le token en `localStorage`).
2. Une fonction `loadXxx()` déclenchée au premier clic sur le bouton de nav correspondant (`data-section="xxx"`), via `{ once: true }` pour éviter les rechargements inutiles.
3. Un rendu qui remplit un conteneur déjà présent dans `dashboard.html` (tableau, graphique Chart.js, etc.).
4. Un bouton de nav `<button data-section="xxx">` dans le `<nav>` de `dashboard.html` — **sans ce bouton, la section existe en HTML mais reste inatteignable** (piège déjà rencontré avec la section Clients & Vendeurs).

---

## 8. Pattern pour ajouter une nouvelle ressource admin

Pour rester cohérent avec l'existant, toute nouvelle fonctionnalité admin suit ces 5 étapes dans l'ordre :

1. **Contrôleur** — `server/src/controllers/adminXxx.controller.js`, avec import Prisma custom + adaptateur PG comme au point 6.
2. **Routes** — `server/src/routes/adminXxx.routes.js`, chaque route protégée par `authMiddleware, roleMiddleware(["admin"])`.
3. **Montage** — ajout de l'import + `app.use("/api/admin/xxx", adminXxxRoutes)` dans `app.js`.
4. **Frontend JS** — nouveau fichier `public/admin/js/xxx.js`, chargé via `apiFetch()`, avec un déclencheur sur `[data-section="xxx"]`.
5. **HTML** — bouton de nav `data-section="xxx"` **+** section `<section id="section-xxx" class="dashboard-section hidden">` dans `dashboard.html`, plus le `<script src="/admin/js/xxx.js">` en bas de page.

---

## 9. Points d'attention connus (à surveiller / corriger)

- **Statut de commande** : le statut vit sur `VendorOrder`, pas sur `Order`. Toute route de changement de statut doit résoudre le `VendorOrder` derrière un `orderId` reçu en paramètre, pas confondre les deux ids.
- **Champ de blocage utilisateur** (`compte_actif` sur `User`) : nécessite une migration Prisma (`npx prisma migrate dev --name add_user_compte_actif`) avant d'être utilisable — sans ça, toute requête dessus plante.
- **Rôle `admin` protégé** : un compte admin ne doit jamais pouvoir être bloqué via la route de toggle de statut (vérification explicite du rôle dans le contrôleur avant update).
- **Marques restreintes par univers** : les marques proposées dans le formulaire produit doivent être filtrées par catégorie racine (univers), pas globales — relation many-to-many `Brand <-> Category` dédiée à ça.
- **Badge "Top vente"** : calculé dynamiquement à partir des commandes réelles (agrégation sur `OrderItem`), jamais un champ coché manuellement sur le produit.

---

## 10. Roadmap restante

- [ ] Section Finances du dashboard (revenus, bénéfices, paiements reçus — pas de "demandes de retrait", basé sur `VendorOrder`/`VendorTransaction`)
- [ ] Suppression définitive des modèles `Vendor`/`VendorOrder`/`VendorTransaction` et de toute la logique de commission/split, une fois le pivot mono-vendeur totalement acté
- [ ] Formulaire de candidature vendeur côté client (les liens "Devenir vendeur" doivent y mener, pas être supprimés)