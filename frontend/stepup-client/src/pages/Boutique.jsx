import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal, Star, Heart, Scale, Grid3x3, List,
  ChevronDown, X, Zap, Flame, AlertTriangle,
} from "lucide-react";
import { useCart } from "../contexts/CartContext.jsx";

/**
 * StepUp — Boutique (catalogue unique, mono-vendeur)
 * Univers, sous-catégories, marques et produits sont chargés dynamiquement
 * depuis l'API (/api/categories, /api/brands, /api/products), pour que tout
 * ce qui est créé depuis le dashboard admin apparaisse ici automatiquement.
 * pt-20 NON inclus ici : App.jsx l'ajoute déjà pour toute route ≠ "/".
 */

const CONDITIONS = [
  { value: "neuf", label: "Neuf" },
  { value: "reconditionne", label: "Reconditionné" },
  { value: "occasion", label: "Occasion" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Pertinence" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
  { value: "note", label: "Notes des acheteurs" },
];

const PRICE_MAX_DEFAULT = 2500;

const badgeStyles = {
  promo: { label: "Promo", icon: null, className: "bg-red-500/90 text-white" },
  express: { label: "Livraison Express", icon: Zap, className: "bg-textColor text-backgroundColor" },
  topvente: { label: "Top vente", icon: Flame, className: "bg-textColor text-backgroundColor" },
  dernierepiece: { label: "Dernière pièce", icon: AlertTriangle, className: "bg-muted text-backgroundColor" },
};

// ============ Fonctions dérivées à partir des données produit brutes ============

function getStockTotal(product) {
  return (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
}

function getStockLabel(product) {
  const total = getStockTotal(product);
  if (total <= 0) return "Rupture";
  if (total <= 3) return `Plus que ${total} unités`;
  return "En stock";
}

function getBadges(product) {
  const badges = [];
  if (product.prix_promo) badges.push("promo");
  if (product.livraison_express) badges.push("express");
  const stockTotal = getStockTotal(product);
  if (stockTotal > 0 && stockTotal <= 3) badges.push("dernierepiece");
  const reviewsCount = product._count?.reviews ?? 0;
  if (Number(product.note_moyenne) >= 4.7 && reviewsCount >= 100) badges.push("topvente");
  return badges;
}

function Pill({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300";
  const variants = {
    primary: "bg-accent text-backgroundColor hover:opacity-90",
    secondary: "border border-muted/40 text-textColor hover:border-accent hover:text-accent",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

function Badge({ type }) {
  const cfg = badgeStyles[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${cfg.className}`}>
      {Icon && <Icon size={10} />}
      {cfg.label}
    </span>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-muted/10 py-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-sm font-medium mb-3">
        {title}
        <ChevronDown size={14} className={`transition-transform duration-300 text-muted ${open ? "rotate-180" : ""}`} />
      </button>
      {open && children}
    </div>
  );
}

export default function Boutique() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ============ Univers / catégories / marques (chargés une fois) ============
  const [universes, setUniverses] = useState([]); // [{ id, nom, children: [{id, nom}] }]
  const [brands, setBrands] = useState([]); // [{ id, nom, categories: [{id, nom}] }]
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [taxonomyError, setTaxonomyError] = useState(null);

  // 📌 Ajout du contexte du panier
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    let cancelled = false;

    async function loadTaxonomy() {
      setTaxonomyLoading(true);
      setTaxonomyError(null);
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        const catJson = await catRes.json();
        const brandJson = await brandRes.json();

        if (!catRes.ok) throw new Error(catJson.message || "Erreur lors du chargement des catégories.");
        if (!brandRes.ok) throw new Error(brandJson.message || "Erreur lors du chargement des marques.");

        if (!cancelled) {
          setUniverses(catJson.categories || []);
          setBrands(brandJson.brands || []);
        }
      } catch (err) {
        if (!cancelled) setTaxonomyError(err.message);
      } finally {
        if (!cancelled) setTaxonomyLoading(false);
      }
    }

    loadTaxonomy();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeUniversId = searchParams.get("univers") || (universes[0]?.id ?? "");
  const activeCategoryId = searchParams.get("categorie") || "";

  const currentUniverse = universes.find((u) => u.id === activeUniversId) ?? universes[0];

  // Dès que les univers sont chargés, si l'URL n'a pas encore de "univers", on fixe le premier.
  useEffect(() => {
    if (!taxonomyLoading && universes.length > 0 && !searchParams.get("univers")) {
      setSearchParams({ univers: universes[0].id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxonomyLoading, universes]);

  const universeBrands = useMemo(() => {
    if (!currentUniverse) return [];
    return brands.filter((b) => (b.categories || []).some((c) => c.id === currentUniverse.id));
  }, [brands, currentUniverse]);

  const setUnivers = (id) => {
    setSearchParams({ univers: id });
    setSelectedBrands([]);
  };

  const setCategorie = (categoryId) => {
    const params = { univers: activeUniversId };
    if (categoryId) params.categorie = categoryId;
    setSearchParams(params);
  };

  // ============ Filtres UI ============
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [view, setView] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]); // ids
  const [selectedConditions, setSelectedConditions] = useState([]); // valeurs enum
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [priceMax, setPriceMax] = useState(PRICE_MAX_DEFAULT);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  // ============ Produits (dépendent des filtres actifs) ============
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!activeUniversId) return; // pas encore d'univers résolu

    setProductsLoading(true);
    setProductsError(null);

    const params = new URLSearchParams();
    params.set("limit", "100");
    params.set("sort", sort);
    if (activeCategoryId) {
      params.set("category_id", activeCategoryId);
    } else {
      params.set("universe_id", activeUniversId);
    }
    if (selectedBrands.length > 0) params.set("brand_id", selectedBrands.join(","));
    if (selectedConditions.length > 0) params.set("etat", selectedConditions.join(","));
    if (freeDeliveryOnly) params.set("livraison_gratuite", "true");
    if (priceMax < PRICE_MAX_DEFAULT) params.set("prix_max", String(priceMax));

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erreur lors du chargement des produits.");
      setProducts(result.products || []);
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }, [activeUniversId, activeCategoryId, selectedBrands, selectedConditions, freeDeliveryOnly, priceMax, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 📌 Fonction pour gérer l'ajout au panier
  const handleAddToCart = (product) => {
    const firstVariant = product.variants?.[0]?.id;
    if (firstVariant) {
      addToCart(firstVariant, 1);
    }
  };

  const FiltersPanel = () => (
    <>
      <FilterSection title="Prix">
        <input
          type="range"
          min={0}
          max={PRICE_MAX_DEFAULT}
          step={10}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[var(--color-accent,#e09f3e)]"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>0 Ar</span>
          <span>{priceMax} Ar</span>
        </div>
      </FilterSection>

      <FilterSection title="Marques">
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
          {universeBrands.length === 0 && (
            <span className="text-xs text-muted italic">Aucune marque pour cet univers.</span>
          )}
          {universeBrands.map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.id)}
                onChange={() => toggle(selectedBrands, setSelectedBrands, b.id)}
                className="accent-[var(--color-accent,#e09f3e)]"
              />
              {b.nom}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="État">
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={selectedConditions.includes(c.value)}
                onChange={() => toggle(selectedConditions, setSelectedConditions, c.value)}
                className="accent-[var(--color-accent,#e09f3e)]"
              />
              {c.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Livraison" defaultOpen={false}>
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input type="checkbox" checked={freeDeliveryOnly} onChange={() => setFreeDeliveryOnly((v) => !v)} className="accent-[var(--color-accent,#e09f3e)]" />
          Livraison gratuite
        </label>
      </FilterSection>
    </>
  );

  if (taxonomyLoading) {
    return (
      <main className="min-h-screen font-body bg-backgroundColor text-textColor flex items-center justify-center">
        <p className="text-sm text-muted">Chargement de la boutique...</p>
      </main>
    );
  }

  if (taxonomyError) {
    return (
      <main className="min-h-screen font-body bg-backgroundColor text-textColor flex items-center justify-center">
        <p className="text-sm text-red-500">{taxonomyError}</p>
      </main>
    );
  }

  if (universes.length === 0) {
    return (
      <main className="min-h-screen font-body bg-backgroundColor text-textColor flex items-center justify-center">
        <p className="text-sm text-muted">Aucun univers n'a encore été créé.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen font-body bg-backgroundColor text-textColor">
      {/* en-tête boutique */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-10 border-b border-muted/10">
        <span className="text-xs tracking-[0.2em] text-accent font-medium">— LA BOUTIQUE STEPUP</span>
        <h1 className="font-display font-light text-4xl md:text-5xl leading-tight mt-3">
          Sélectionnés pour vous.
        </h1>

        {/* toggle univers */}
        <div className="flex gap-3 mt-6 flex-wrap">
          {universes.map((u) => (
            <button
              key={u.id}
              onClick={() => setUnivers(u.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                activeUniversId === u.id ? "bg-accent text-backgroundColor" : "bg-surfaceColor text-muted hover:text-accent"
              }`}
            >
              {u.nom}
            </button>
          ))}
        </div>
      </section>

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-8 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={16} className="text-accent" />
            <h2 className="font-headline text-lg">Filtres</h2>
          </div>
          <FiltersPanel />
        </aside>

        <div>
          {/* sous-catégories de l'univers actif */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setCategorie("")}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-300 ${
                !activeCategoryId ? "bg-accent text-backgroundColor" : "bg-surfaceColor text-muted hover:text-accent"
              }`}
            >
              Tout
            </button>
            {(currentUniverse?.children || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategorie(cat.id)}
                className={`px-4 py-2 rounded-full text-sm transition-colors duration-300 ${
                  activeCategoryId === cat.id ? "bg-accent text-backgroundColor" : "bg-surfaceColor text-muted hover:text-accent"
                }`}
              >
                {cat.nom}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-muted/30 text-muted"
              >
                <SlidersHorizontal size={14} /> Filtres
              </button>
              <span className="text-sm text-muted">{productsLoading ? "..." : `${products.length} produits`}</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-surfaceColor text-sm rounded-full px-4 py-2 outline-none"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="hidden sm:flex items-center gap-1 bg-surfaceColor rounded-full p-1">
                <button onClick={() => setView("grid")} className={`p-1.5 rounded-full ${view === "grid" ? "bg-accent text-backgroundColor" : "text-muted"}`} aria-label="Vue grille">
                  <Grid3x3 size={14} />
                </button>
                <button onClick={() => setView("list")} className={`p-1.5 rounded-full ${view === "list" ? "bg-accent text-backgroundColor" : "text-muted"}`} aria-label="Vue liste">
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {productsError && (
            <p className="text-sm text-red-500 text-center py-16">{productsError}</p>
          )}

          {!productsError && productsLoading && (
            <p className="text-sm text-muted text-center py-16">Chargement des produits...</p>
          )}

          {!productsError && !productsLoading && (
            <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {products.map((p) => {
                const badges = getBadges(p);
                const stockLabel = getStockLabel(p);
                const image = p.images?.[0]?.url;
                const prix = Number(p.prix);
                const prixPromo = p.prix_promo ? Number(p.prix_promo) : null;
                const displayPrice = prixPromo ?? prix;
                const oldPrice = prixPromo ? prix : null;
                const reviewsCount = p._count?.reviews ?? 0;

                return (
                  <div key={p.id} className={view === "grid" ? "group cursor-pointer" : "group cursor-pointer flex gap-4 bg-surfaceColor rounded-xl p-3"}>
                    <div className={view === "grid" ? "relative aspect-square rounded-xl overflow-hidden bg-surfaceColor mb-3" : "relative w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-backgroundColor"}>
                      {image ? (
                        <img src={image} alt={p.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-backgroundColor" />
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {badges.map((b) => <Badge key={b} type={b} />)}
                      </div>
                      <button aria-label="Favoris" className="absolute top-2 right-2 w-7 h-7 rounded-full bg-backgroundColor/80 flex items-center justify-center">
                        <Heart size={13} />
                      </button>
                    </div>

                    <div className="flex-1">
                      <p className="text-[11px] text-accent uppercase tracking-wide mb-0.5">{p.brand?.nom}</p>
                      <p className="text-sm font-medium leading-tight">{p.nom}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" className="text-accent" />
                        ))}
                        <span className="text-[11px] text-muted ml-1">{Number(p.note_moyenne).toFixed(1)} · {reviewsCount} avis</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-headline text-base">{displayPrice.toFixed(2)} Ar</span>
                        {oldPrice && <span className="text-xs text-muted line-through">{oldPrice.toFixed(2)} Ar</span>}
                      </div>

                      <p className={`text-[11px] mt-1 ${
                        stockLabel === "En stock" ? "text-accent" : stockLabel === "Rupture" ? "text-muted" : "text-orange-500"
                      }`}>
                        {stockLabel}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        {/* 📌 Bouton "Ajouter au panier" corrigé */}
                        <Pill
                          variant="primary"
                          className="!px-4 !py-2 text-xs flex-1"
                          disabled={stockLabel === "Rupture" || cartLoading}
                          onClick={() => handleAddToCart(p)}
                        >
                          {cartLoading ? "Ajout..." : stockLabel === "Rupture" ? "Précommander" : "Ajouter au panier"}
                        </Pill>
                        <button aria-label="Comparer" className="w-9 h-9 rounded-full border border-muted/30 flex items-center justify-center hover:border-accent hover:text-accent transition-colors shrink-0">
                          <Scale size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!productsError && !productsLoading && products.length === 0 && (
            <p className="text-sm text-muted text-center py-16">Aucun produit ne correspond à ces filtres.</p>
          )}
        </div>
      </div>

      {/* tiroir filtres mobile */}
      <div className={`fixed inset-0 z-[110] lg:hidden transition-opacity duration-300 ${mobileFiltersOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-textColor/40" onClick={() => setMobileFiltersOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-full max-w-xs bg-backgroundColor shadow-xl transition-transform duration-300 overflow-y-auto ${mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-5 py-5 border-b border-muted/10">
            <h3 className="font-headline text-lg">Filtres</h3>
            <button onClick={() => setMobileFiltersOpen(false)} aria-label="Fermer"><X size={20} /></button>
          </div>
          <div className="px-5"><FiltersPanel /></div>
          <div className="px-5 py-5">
            <Pill variant="primary" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
              Voir les résultats
            </Pill>
          </div>
        </div>
      </div>
    </main>
  );
}