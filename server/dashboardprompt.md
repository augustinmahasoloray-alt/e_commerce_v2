# StepUp — Dashboard Admin — Reprise de contexte (suite)

Colle ce prompt en début de conversation pour que l'assistant ait tout le contexte avant de continuer.

---

## Projet

**StepUp Admin Dashboard** — module séparé du frontend client React (`stepup-client`), à usage strictement personnel. **Décision actée : mono-vendeur strict.** Augustin est le seul vendeur/admin. Il n'y aura **pas** de section "Gestion des vendeurs" dans le dashboard — cette entrée a été retirée du scope.

Important : le schéma Prisma garde encore les modèles `Vendor` / `VendorOrder` / `VendorTransaction` en interne (un seul enregistrement `Vendor` existe en base, résolu automatiquement côté backend via `prisma.vendor.findFirst()` — voir `adminProduct.controller.js`). On ne renomme pas ces modèles pour l'instant : ils servent de couche technique invisible pour l'admin, pas de fonctionnalité "multi-vendeur" à afficher.

## Stack

- **Dashboard admin** : pas de React/Vite — HTML pur + **Tailwind via CDN** (config inline en `<script>`) + **JS vanilla** (`fetch` natif via `apiFetch()` dans `api.js`), servi en statique par Express (`server/public/admin/`).
- **Client boutique** (`stepup-client/`) : React 19 + Vite + Tailwind v4, `localhost:5173`, proxy Vite vers `localhost:3000`.
- **Backend partagé** : Express + Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL, client Prisma généré dans `generated/prisma`.
- Auth JWT (`authMiddleware`, header `Authorization: Bearer`), rôle `admin` requis pour `/api/admin/...` (via `roleMiddleware(["admin"])`).
- Le style visuel du dashboard : sidebar + cartes `bg-surfaceColor rounded-lg p-5`, thème CSS variables (`--color-background`, `--color-surface`, `--color-text`, `--color-accent`, `--color-muted`), dark mode via `theme.js` (classe `dark`), police `font-headline` pour titres.

## Arborescence backend (confirmée, VS Code Remote-SSH sur VM Ubuntu)

```
server/
  src/
    app.js                        ← montage des routes Express (routes montées directement, pas via routes/index.js)
    server.js                     ← point d'entrée, port 3000 en dev
    config/
      db.js                       ← export default prisma (PrismaClient + adapter pg)
      cloudinary.js
    controllers/
      adminAuth.controller.js
      adminBrand.controller.js
      adminCategory.controller.js
      adminDashboard.controller.js  ← ✅ FAIT — getDashboardStats (8 stats + produits par catégorie)
      adminProduct.controller.js    ← ✅ FAIT — CRUD complet, single-vendor via findFirst(), getTopSellingProducts déjà présent
      auth.controller.js
      order.controller.js           ← ⚠️ BUG : appelle orderService.updateOrderStatus() qui n'existe plus (voir plus bas)
      product.controller.js
      user.controller.js
      vendor.controller.js
    services/
      order.service.js              ← createOrder (répartition multi-vendeur interne), getOrdersByUser, getOrderById,
                                       updateVendorOrderStatus (a remplacé updateOrderStatus), getVendorOrders
      product.service.js
    routes/
      adminAuth.routes.js
      adminBrand.routes.js
      adminCategory.routes.js
      adminDashboard.routes.js
      adminProduct.routes.js
      auth.routes.js
      index.js                      ← ne contient QUE vendor-application actuellement
      order.routes.js               ← POST /, GET /mine, GET /:id, PUT /:id/statut (⚠️ route buguée, voir bug ci-dessous)
      product.routes.js
      user.routes.js
      vendor.routes.js
      vendorApplication.routes.js
      category.routes.js
      brand.routes.js
    middlewares/
      auth.middleware.js
      admin.middleware.js
      role.middleware.js
      upload.middleware.js
      vendor.middleware.js
      error.middleware.js
    scripts/
      seedAdmin.js
      seedCategoriesBrands.js       ← pattern de référence pour futurs scripts de seed (upsert idempotent, import PrismaPg + dotenv)
  public/
    admin/
      dashboard.html                ← sidebar : Vue d'ensemble / Produits / Catégories & Marques / Commandes (placeholder "À implémenter")
      index.html                    ← connexion/inscription admin
      js/
        api.js                      ← apiFetch() wrapper (token localStorage)
        dashboard.js                ← ✅ FAIT — charge les stats + Chart.js
        products.js                 ← ✅ FAIT — CRUD produits, combobox univers/sous-catégorie/marque
        categories.js                ← ✅ FAIT
        theme.js
      fonts/qurova/
  prisma/
    schema.prisma
```

**Important** : `app.js` monte les routes directement, ex :
```javascript
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);
```
Toute nouvelle route (ex : `adminOrder.routes.js`) doit être importée et montée dans `app.js` de la même façon.

## ⚠️ Bug identifié à corriger

Dans `order.controller.js`, `updateOrderStatus` appelle `orderService.updateOrderStatus(req.params.id, req.body.statut)`, mais cette fonction **n'existe plus** dans `order.service.js` — elle a été remplacée par `updateVendorOrderStatus(vendorOrderId, statut)`. Le statut de traitement (`OrderStatus` enum : en_attente/confirmee/expediee/livree/annulee) vit désormais sur `VendorOrder`, pas sur `Order`. La route `PUT /api/orders/:id/statut` plantera si appelée en l'état — `req.params.id` est en plus un `order.id`, pas un `vendor_order_id`. À corriger en même temps que la nouvelle route admin.

## Schéma Prisma — état actuel (extrait pertinent)

- `User` : `nom`, `prenom`, `email`, `telephone`, `role` (enum `Role`: client/vendeur/admin), `date_creation`. **Pas de champ de blocage/statut actif.** Augustin doit encore décider/valider l'ajout d'un champ (`actif` ou `statut`) avant qu'on code le blocage de comptes — il enverra le schéma à jour au moment voulu.
- `Order` → `VendorOrder` (1 par vendeur, ici un seul vendeur = un seul VendorOrder par commande en pratique) : `statut` (enum `OrderStatus`), `montant_total`, `montant_commission`, `montant_net`. Relation `items` (→ `OrderItem` → `ProductVariant`), `transactions`.
- `VendorTransaction` : `type` (credit_vente/debit_commission/versement/ajustement), `statut` (en_attente/effectue/echoue), `montant`.
- Aucune commande (`Order`/`VendorOrder`) n'existe encore en base — un script de seed sera nécessaire pour tester l'affichage.

## Où on en est (fonctionnel, testé par Augustin)

1. **Auth dashboard** : ✅ connexion admin JWT, garde d'accès sur `dashboard.html`.
2. **Vue d'ensemble** : ✅ **entièrement fonctionnelle** — 8 cartes (produits actifs, commandes en attente, CA, clients, ruptures de stock, ventes jour/semaine/mois) toutes branchées sur de vraies requêtes Prisma, + graphique Chart.js "Produits par catégorie". Actuellement à 0 pour tout ce qui dépend des commandes (normal, aucune commande en base).
3. **Produits** : ✅ CRUD complet (création, édition avec diff variantes/images, suppression en soft-delete `actif: false`), combobox univers/sous-catégorie/marque en saisie libre.
4. **Catégories & Marques** : ✅ création univers/sous-catégories/marques, affichage arbre/liste.
5. **Commandes** : ❌ placeholder `<p>À implémenter.</p>` dans `dashboard.html`, aucun contrôleur/route admin dédié.
6. **Boutique.jsx (client React)** : ✅ dynamique, filtres complets, testé et confirmé fonctionnel.

## Scope restant à livrer (ordre convenu, une étape à la fois avec confirmation avant chaque)

### 1. 🛒 Gestion des commandes — PROCHAINE ÉTAPE, en cours de cadrage
Périmètre demandé par Augustin : commandes confirmées / livrées / annulées, détails d'une commande. (Pas de "commandes en attente" séparée dans la demande explicite, mais la carte existe déjà en Vue d'ensemble.)

Prévu pour cette étape :
- Correction du bug `updateOrderStatus` (voir plus haut)
- `order.service.js` : ajout de fonctions de listing admin (toutes commandes, filtre par statut) si absentes
- `adminOrder.controller.js` + `adminOrder.routes.js`, montés sur `/api/admin/orders`
- `scripts/seedOrders.js` — génère ~8-10 commandes de test avec statuts variés et dates réparties (pour tester le filtre ET les stats "ventes jour/semaine/mois" de la Vue d'ensemble), en suivant le pattern de `seedCategoriesBrands.js`
- Remplacement du placeholder dans `dashboard.html` : tableau filtrable par statut + modal de détail (items, client, adresse, montant), même style visuel que la section Produits, dark mode inclus
- Nouveau fichier `public/admin/js/orders.js`

**Fichiers déjà vus par l'assistant pour cette étape** : `order.controller.js`, `order.routes.js`, `order.service.js`, `adminDashboard.controller.js`, `dashboard.js`, `dashboard.html` (complet), `seedCategoriesBrands.js`, `adminProduct.controller.js`. Pas besoin de les redemander sauf si Augustin signale un changement depuis.

### 2. 👥 Gestion des utilisateurs
- Liste des clients
- Blocage/déblocage des comptes (nécessite nouveau champ sur `User` — **schéma Prisma à jour à demander à Augustin avant de coder cette étape**, il a indiqué qu'il montrera le schéma au bon moment)
- Gestion des rôles

### 3. 💰 Finances
- Revenus, Bénéfices, Paiements reçus
- Pas de "Demandes de retrait" (hors scope, cohérent avec le mono-vendeur strict)
- Peut réutiliser la logique de `VendorTransaction`/`VendorOrder` déjà en place pour la Vue d'ensemble

### 4. 📈 Statistiques
- Évolution des ventes
- Produits les plus vendus (⚠️ déjà fait côté backend : `getTopSellingProducts` existe dans `adminProduct.controller.js` — juste besoin du câblage frontend dans une nouvelle section, pas de nouveau contrôleur)
- Catégories les plus populaires
- Nouveaux utilisateurs
- Taux de conversion

## Comment on travaille

- Scope découpé en étapes livrables une par une, confirmation avant de démarrer chaque étape.
- Fichiers complets plutôt que des snippets partiels, sauf modification ciblée explicitement demandée.
- Commandes terminal : forme longue d'abord, puis forme courte, puis explication des flags.
- Toujours prévoir le dark mode.
- Poser les questions de clarification nécessaires avant de coder si un point n'est pas clair.
- Demander à voir les fichiers existants pertinents avant de coder une nouvelle étape, pour rester cohérent avec le style et éviter les doublons/contradictions avec le code déjà en place.

---

**Prêt à continuer sur l'étape 1 (Gestion des commandes).** Si les fichiers listés comme "déjà vus" n'ont pas changé depuis, on peut coder directement. Sinon, demander les versions à jour avant de commencer.