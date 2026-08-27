import { useState } from "react";
import {
  SlidersHorizontal, Star, Heart, Scale, Grid3x3, List,
  ChevronDown, X, ShieldCheck, Zap, Flame, AlertTriangle,
} from "lucide-react";

/**
 * StepUp — Shop (division 2 : BOUTIQUE)
 * Marketplace Tech & Gaming (PC Gaming, Consoles, Écrans, Casques, Claviers, Smartphones).
 * Sidebar de filtres avancés + grille produits avec badges marketplace.
 * Branding : font-display (Qurova) / font-headline (Metal) / font-body (Albert Sans),
 * tokens bg-backgroundColor / bg-surfaceColor / text-textColor / text-accent / text-muted.
 * À insérer entre <Navbar /> et <Footer /> — pt-20 pour compenser le Navbar fixed.
 */

const categories = ["Tout", "PC Gaming", "Consoles", "Écrans", "Casques", "Claviers", "Smartphones"];

const brands = ["Asus", "MSI", "Sony", "Microsoft", "Samsung", "Razer", "Logitech", "Apple"];

const conditions = ["Neuf", "Reconditionné", "Occasion"];

const badgeStyles = {
  promo: { label: "-20%", icon: null, className: "bg-red-500/90 text-white" },
  express: { label: "Livraison Express", icon: Zap, className: "bg-textColor text-backgroundColor" },
  certifie: { label: "Vendeur certifié", icon: ShieldCheck, className: "bg-accent text-backgroundColor" },
  topvente: { label: "Top vente", icon: Flame, className: "bg-textColor text-backgroundColor" },
  dernierepiece: { label: "Dernière pièce", icon: AlertTriangle, className: "bg-muted text-backgroundColor" },
};

const products = [
  { name: "PC Gaming Asus ROG Strix", cat: "PC Gaming", boutique: "TechProShop", price: "1899.00", oldPrice: "2199.00", rating: 4.7, reviews: 234, stock: "En stock", badges: ["promo", "certifie"], img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80" },
  { name: "Écran MSI 27\" 240Hz QHD", cat: "Écrans", boutique: "ScreenHub", price: "349.00", oldPrice: null, rating: 4.6, reviews: 98, stock: "Plus que 3 unités", badges: ["express"], img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80" },
  { name: "Casque Sony WH-1000XM5", cat: "Casques", boutique: "AudioStore", price: "329.00", oldPrice: "379.00", rating: 4.9, reviews: 512, stock: "En stock", badges: ["promo", "topvente"], img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80" },
  { name: "Console PlayStation 5", cat: "Consoles", boutique: "GameCenter", price: "549.00", oldPrice: null, rating: 4.8, reviews: 876, stock: "En stock", badges: ["certifie", "topvente"], img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80" },
  { name: "Clavier Razer BlackWidow V4", cat: "Claviers", boutique: "GearZone", price: "159.00", oldPrice: null, rating: 4.5, reviews: 143, stock: "Plus que 3 unités", badges: ["express"], img: "https://images.unsplash.com/photo-1595225476474-63038da0b6f5?w=600&q=80" },
  { name: "Smartphone Samsung Galaxy S25", cat: "Smartphones", boutique: "MobileWorld", price: "899.00", oldPrice: "999.00", rating: 4.7, reviews: 601, stock: "En stock", badges: ["promo", "certifie"], img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80" },
  { name: "PC Gaming MSI Aegis", cat: "PC Gaming", boutique: "TechProShop", price: "2199.00", oldPrice: null, rating: 4.6, reviews: 87, stock: "Rupture", badges: ["certifie"], img: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&q=80" },
  { name: "Écran Samsung Odyssey 4K", cat: "Écrans", boutique: "ScreenHub", price: "599.00", oldPrice: null, rating: 4.8, reviews: 156, stock: "En stock", badges: ["topvente"], img: "https://images.unsplash.com/photo-1616763355603-9755a640a287?w=600&q=80" },
  { name: "Casque Logitech G Pro X", cat: "Casques", boutique: "GearZone", price: "119.00", oldPrice: "139.00", rating: 4.4, reviews: 210, stock: "En stock", badges: ["promo"], img: "https://images.unsplash.com/photo-1599669454699-248893623440?w=600&q=80" },
  { name: "Console Xbox Series X", cat: "Consoles", boutique: "GameCenter", price: "499.00", oldPrice: null, rating: 4.7, reviews: 445, stock: "Plus que 3 unités", badges: ["express", "certifie"], img: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&q=80" },
  { name: "Clavier Logitech MX Mechanical", cat: "Claviers", boutique: "GearZone", price: "139.00", oldPrice: null, rating: 4.6, reviews: 92, stock: "En stock", badges: [], img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80" },
  { name: "Smartphone Apple iPhone 16", cat: "Smartphones", boutique: "MobileWorld", price: "1099.00", oldPrice: null, rating: 4.9, reviews: 934, stock: "En stock", badges: ["topvente"], img: "https://images.unsplash.com/photo-1592286927505-1def25115481?w=600&q=80" },
];

const sortOptions = ["Pertinence", "Prix croissant", "Prix décroissant", "Notes des acheteurs", "Popularité"];

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

export default function Shop() {
  const [activeCat, setActiveCat] = useState("Tout");
  const [sort, setSort] = useState(sortOptions[0]);
  const [view, setView] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [inStoreOnly, setInStoreOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [priceMax, setPriceMax] = useState(2500);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = products.filter((p) => activeCat === "Tout" || p.cat === activeCat);

  const FiltersPanel = () => (
    <>
      <FilterSection title="Prix">
        <input
          type="range"
          min={0}
          max={2500}
          step={50}
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
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => toggle(selectedBrands, setSelectedBrands, b)}
                className="accent-[var(--color-accent,#e09f3e)]"
              />
              {b}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="État">
        <div className="flex flex-col gap-2">
          {conditions.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={selectedConditions.includes(c)}
                onChange={() => toggle(selectedConditions, setSelectedConditions, c)}
                className="accent-[var(--color-accent,#e09f3e)]"
              />
              {c}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Vendeur">
        <select className="w-full bg-surfaceColor rounded-lg px-3 py-2 text-sm text-textColor outline-none">
          <option>Tous les vendeurs</option>
          <option>TechProShop ★ 98%</option>
          <option>ScreenHub ★ 96%</option>
          <option>AudioStore ★ 99%</option>
          <option>GameCenter ★ 97%</option>
          <option>GearZone ★ 95%</option>
          <option>MobileWorld ★ 98%</option>
        </select>
      </FilterSection>

      <FilterSection title="Livraison & disponibilité" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input type="checkbox" checked={freeDeliveryOnly} onChange={() => setFreeDeliveryOnly((v) => !v)} className="accent-[var(--color-accent,#e09f3e)]" />
            Livraison gratuite
          </label>
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input type="checkbox" checked={inStoreOnly} onChange={() => setInStoreOnly((v) => !v)} className="accent-[var(--color-accent,#e09f3e)]" />
            Disponible en boutique physique
          </label>
        </div>
      </FilterSection>
    </>
  );

  return (
    <main className="min-h-screen font-body bg-backgroundColor text-textColor pt-20">
      {/* en-tête boutique */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-10 border-b border-muted/10">
        <span className="text-xs tracking-[0.2em] text-accent font-medium">— LA BOUTIQUE STEPUP</span>
        <h1 className="font-display font-light text-4xl md:text-5xl leading-tight mt-3">
          Tech & Gaming, sélectionnés pour vous.
        </h1>
        <p className="text-muted text-sm mt-3 max-w-xl">
          PC gaming, consoles, écrans, casques, claviers et smartphones — proposés par nos boutiques partenaires.
        </p>
      </section>

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-8 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* sidebar filtres — desktop */}
        <aside className="hidden lg:block">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={16} className="text-accent" />
            <h2 className="font-headline text-lg">Filtres</h2>
          </div>
          <FiltersPanel />
        </aside>

        {/* zone principale */}
        <div>
          {/* catégories */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-2 rounded-full text-sm transition-colors duration-300 ${
                  activeCat === cat ? "bg-accent text-backgroundColor" : "bg-surfaceColor text-muted hover:text-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* barre d'outils */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-muted/30 text-muted"
              >
                <SlidersHorizontal size={14} /> Filtres
              </button>
              <span className="text-sm text-muted">{filtered.length} produits</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-surfaceColor text-sm rounded-full px-4 py-2 outline-none"
              >
                {sortOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
              <div className="hidden sm:flex items-center gap-1 bg-surfaceColor rounded-full p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-full ${view === "grid" ? "bg-accent text-backgroundColor" : "text-muted"}`}
                  aria-label="Vue grille"
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-full ${view === "list" ? "bg-accent text-backgroundColor" : "text-muted"}`}
                  aria-label="Vue liste"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* grille / liste produits */}
          <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {filtered.map((p) => (
              <div
                key={p.name}
                className={view === "grid" ? "group cursor-pointer" : "group cursor-pointer flex gap-4 bg-surfaceColor rounded-xl p-3"}
              >
                <div className={view === "grid" ? "relative aspect-square rounded-xl overflow-hidden bg-surfaceColor mb-3" : "relative w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-backgroundColor"}>
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {p.badges.map((b) => <Badge key={b} type={b} />)}
                  </div>
                  <button aria-label="Favoris" className="absolute top-2 right-2 w-7 h-7 rounded-full bg-backgroundColor/80 flex items-center justify-center">
                    <Heart size={13} />
                  </button>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{p.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} fill="currentColor" className="text-accent" />
                    ))}
                    <span className="text-[11px] text-muted ml-1">{p.rating} · {p.reviews} avis</span>
                  </div>
                  <p className="text-[11px] text-muted mt-1">{p.boutique} ★ vendeur certifié</p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-headline text-base">{p.price} Ar</span>
                    {p.oldPrice && <span className="text-xs text-muted line-through">{p.oldPrice} Ar</span>}
                  </div>

                  <p className={`text-[11px] mt-1 ${
                    p.stock === "En stock" ? "text-accent" : p.stock === "Rupture" ? "text-muted" : "text-orange-500"
                  }`}>
                    {p.stock}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <Pill variant="primary" className="!px-4 !py-2 text-xs flex-1" disabled={p.stock === "Rupture"}>
                      {p.stock === "Rupture" ? "Précommander" : "Ajouter au panier"}
                    </Pill>
                    <button aria-label="Comparer" className="w-9 h-9 rounded-full border border-muted/30 flex items-center justify-center hover:border-accent hover:text-accent transition-colors shrink-0">
                      <Scale size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          <div className="flex justify-center items-center gap-2 mt-12">
            <Pill variant="secondary" className="!px-4 !py-2">1</Pill>
            <Pill variant="secondary" className="!px-4 !py-2">2</Pill>
            <Pill variant="secondary" className="!px-4 !py-2">3</Pill>
            <Pill variant="secondary" className="!px-4 !py-2">Suivant</Pill>
          </div>
        </div>
      </div>

      {/* sidebar filtres — tiroir mobile */}
      <div className={`fixed inset-0 z-[110] lg:hidden transition-opacity duration-300 ${mobileFiltersOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-textColor/40" onClick={() => setMobileFiltersOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-full max-w-xs bg-backgroundColor shadow-xl transition-transform duration-300 overflow-y-auto ${mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-5 py-5 border-b border-muted/10">
            <h3 className="font-headline text-lg">Filtres</h3>
            <button onClick={() => setMobileFiltersOpen(false)} aria-label="Fermer"><X size={20} /></button>
          </div>
          <div className="px-5">
            <FiltersPanel />
          </div>
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