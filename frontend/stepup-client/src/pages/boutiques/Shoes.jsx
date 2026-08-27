import { useState } from "react";
import {
  Heart, Bell, MessageCircle, Scale, Star, ShieldCheck, Truck,
  RotateCcw, ChevronDown, X, Minus, Plus, Send,
} from "lucide-react";

/**
 * StepUp — Product (fiche produit détaillée, PUBLIC)
 * Intègre : alerte prix, chat en direct avec le vendeur, comparateur (tiroir latéral).
 * Respecte strictement le branding : font-display (Qurova) / font-headline (Metal) /
 * font-body (Albert Sans), accent #e09f3e, tokens bg-backgroundColor / bg-surfaceColor / text-muted.
 * À insérer entre <Navbar /> et <Footer /> — pt-20 pour compenser le Navbar fixed.
 */

const images = [
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&q=80",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900&q=80",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=80",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900&q=80",
];

const colors = [
  { name: "Blanc", hex: "#F5F5F5" },
  { name: "Noir", hex: "#111827" },
  { name: "Camel", hex: "#C99A5B" },
];

const pointures = [38, 39, 40, 41, 42, 43, 44];

const similaires = [
  { name: "Sneaker Édition Studio", boutique: "UrbanStep", price: "119.99", img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80" },
  { name: "Running Air Léger", boutique: "Kanto Shoes", price: "104.99", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { name: "Sneaker Trail", boutique: "Kanto Shoes", price: "112.99", img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80" },
  { name: "Bottine Daim", boutique: "UrbanStep", price: "134.99", img: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80" },
];

const tabs = ["Description", "Caractéristiques", "Avis (120)", "Questions / Réponses"];

function Pill({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300";
  const variants = {
    primary: "bg-accent text-backgroundColor hover:opacity-90",
    secondary: "border border-muted/40 text-textColor hover:border-accent hover:text-accent",
    ghost: "text-textColor hover:text-accent",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export default function Product() {
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(colors[0].name);
  const [pointure, setPointure] = useState(41);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(tabs[0]);
  const [priceAlertOn, setPriceAlertOn] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareItems] = useState([similaires[0], similaires[1]]);

  return (
    <main className="min-h-screen font-body bg-backgroundColor text-textColor pt-20 relative">
      {/* fil d'ariane */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 pt-6 text-xs text-muted">
        Boutique <span className="mx-1">/</span> Sneakers <span className="mx-1">/</span>
        <span className="text-textColor">Sneaker Cuir Blanc</span>
      </div>

      {/* fiche principale */}
      <section className="grid md:grid-cols-2 gap-12 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-10">
        {/* galerie */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-surfaceColor mb-4 relative">
            <img src={images[activeImg]} alt="Sneaker Cuir Blanc" className="w-full h-full object-cover" />
            <span className="absolute top-4 left-4 bg-textColor text-backgroundColor text-[11px] px-3 py-1 rounded-full">
              Vendeur certifié
            </span>
          </div>
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImg(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-all ${
                  activeImg === i ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* résumé produit */}
        <div>
          <p className="text-[11px] text-accent uppercase tracking-wide mb-1">UrbanStep · Réf. SU-8842</p>
          <h1 className="font-display font-light text-3xl md:text-4xl leading-tight mb-3">
            Sneaker Cuir Blanc
          </h1>
          <div className="flex items-center gap-2 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} fill="currentColor" className="text-accent" />
            ))}
            <span className="text-sm text-muted">4.8 · 120 avis</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-headline text-3xl">89.99 Ar</span>
            <span className="text-sm text-muted line-through">109.99 Ar</span>
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">-18%</span>
          </div>
          <p className="text-xs text-muted mb-6">Paiement en 3x sans frais disponible</p>

          {/* couleur */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Couleur — {color}</p>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.name ? "border-accent" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* pointure */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Pointure — {pointure}</p>
            <div className="flex flex-wrap gap-2">
              {pointures.map((p) => (
                <button
                  key={p}
                  onClick={() => setPointure(p)}
                  className={`w-11 h-11 rounded-lg text-sm transition-colors duration-300 ${
                    pointure === p
                      ? "bg-accent text-backgroundColor"
                      : "bg-surfaceColor text-textColor hover:text-accent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* vendeur + stock */}
          <div className="bg-surfaceColor rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Vendu par UrbanStep</p>
              <p className="text-xs text-muted">★ 4.9 · 98% d'avis positifs</p>
            </div>
            <span className="text-xs text-accent">En stock</span>
          </div>

          {/* quantité + CTA */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-muted/30 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3"><Minus size={14} /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3"><Plus size={14} /></button>
            </div>
            <Pill variant="primary" className="flex-1">Ajouter au panier</Pill>
            <button
              onClick={() => {}}
              aria-label="Ajouter aux favoris"
              className="w-12 h-12 rounded-full border border-muted/30 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
            >
              <Heart size={18} />
            </button>
          </div>

          {/* actions secondaires : alerte prix / chat / comparateur */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setPriceAlertOn((v) => !v)}
              className={`inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-colors duration-300 ${
                priceAlertOn ? "border-accent text-accent bg-accent/10" : "border-muted/30 text-muted hover:text-accent hover:border-accent"
              }`}
            >
              <Bell size={13} />
              {priceAlertOn ? "Alerte prix activée" : "Alerte prix"}
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border border-muted/30 text-muted hover:text-accent hover:border-accent transition-colors duration-300"
            >
              <MessageCircle size={13} />
              Discuter avec UrbanStep
            </button>
            <button
              onClick={() => setCompareOpen(true)}
              className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border border-muted/30 text-muted hover:text-accent hover:border-accent transition-colors duration-300"
            >
              <Scale size={13} />
              Comparer ({compareItems.length})
            </button>
          </div>

          {/* réassurance */}
          <div className="grid grid-cols-3 gap-4 border-t border-muted/10 pt-6">
            {[
              { icon: Truck, label: "Livraison suivie" },
              { icon: ShieldCheck, label: "Paiement sécurisé" },
              { icon: RotateCcw, label: "Retour sous 14j" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5">
                <Icon size={18} className="text-accent" />
                <span className="text-[11px] text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* onglets */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-10">
        <div className="flex flex-wrap gap-8 border-b border-muted/15 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 text-sm font-medium transition-colors duration-300 border-b-2 -mb-px ${
                tab === t ? "border-accent text-accent" : "border-transparent text-muted hover:text-textColor"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Description" && (
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Une sneaker en cuir pleine fleur, pensée pour un usage quotidien. Semelle en caoutchouc naturel,
            doublure respirante, finitions cousues main par l'atelier UrbanStep.
          </p>
        )}

        {tab === "Caractéristiques" && (
          <div className="max-w-2xl divide-y divide-muted/10 text-sm">
            {[
              ["Matière dessus", "Cuir pleine fleur"],
              ["Semelle", "Caoutchouc naturel"],
              ["Doublure", "Textile respirant"],
              ["Origine", "Fabriqué à Madagascar"],
              ["Entretien", "Chiffon doux + cirage incolore"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3">
                <span className="text-muted">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "Avis (120)" && (
          <div className="max-w-2xl space-y-5">
            {[
              { name: "Nathalie R.", text: "Confortable dès le premier jour, le cuir est superbe." },
              { name: "Mickael A.", text: "Livraison rapide, exactement comme sur les photos." },
            ].map((r) => (
              <div key={r.name} className="border-b border-muted/10 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" className="text-accent" />
                  ))}
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <p className="text-sm text-muted">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Questions / Réponses" && (
          <div className="max-w-2xl space-y-5">
            <div>
              <p className="text-sm font-medium">Cette paire taille-t-elle grand ?</p>
              <p className="text-sm text-muted mt-1">Réponse d'UrbanStep : Elle taille normalement, prenez votre pointure habituelle.</p>
            </div>
            <Pill variant="secondary" className="!px-4 !py-2 text-xs">Poser une question</Pill>
          </div>
        )}
      </section>

      {/* produits similaires */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-14 border-t border-muted/10">
        <h2 className="font-headline text-2xl mb-6">Vous aimerez aussi</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {similaires.map((p) => (
            <div key={p.name} className="group cursor-pointer">
              <div className="aspect-square rounded-xl overflow-hidden bg-surfaceColor mb-3">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-[11px] text-accent uppercase tracking-wide mb-0.5">{p.boutique}</p>
              <p className="text-sm font-medium leading-tight">{p.name}</p>
              <p className="text-sm text-textColor/80 font-medium mt-1">{p.price} Ar</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== tiroir comparateur ===== */}
      <div
        className={`fixed inset-0 z-[110] transition-opacity duration-300 ${
          compareOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-textColor/40" onClick={() => setCompareOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-md bg-backgroundColor shadow-xl transition-transform duration-300 flex flex-col ${
            compareOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-muted/10">
            <h3 className="font-headline text-lg">Comparateur</h3>
            <button onClick={() => setCompareOpen(false)} aria-label="Fermer"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {compareItems.map((p) => (
              <div key={p.name} className="flex items-center gap-3 bg-surfaceColor rounded-xl p-3">
                <img src={p.img} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{p.name}</p>
                  <p className="text-xs text-muted">{p.boutique} · {p.price} Ar</p>
                </div>
              </div>
            ))}
            <button className="w-full border border-dashed border-muted/30 rounded-xl py-4 text-sm text-muted hover:text-accent hover:border-accent transition-colors">
              + Ajouter un produit à comparer
            </button>
          </div>
          <div className="px-6 py-5 border-t border-muted/10">
            <Pill variant="primary" className="w-full">Voir la comparaison complète</Pill>
          </div>
        </div>
      </div>

      {/* ===== bulle + panneau chat vendeur ===== */}
      <div className="fixed bottom-6 right-6 z-[105]">
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Discuter avec le vendeur"
            className="w-14 h-14 rounded-full bg-accent text-backgroundColor flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={22} />
          </button>
        )}

        {chatOpen && (
          <div className="w-80 max-w-[90vw] h-96 bg-surfaceColor rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-textColor text-backgroundColor">
              <div>
                <p className="text-sm font-medium">UrbanStep</p>
                <p className="text-[11px] opacity-70">Répond généralement en quelques heures</p>
              </div>
              <button onClick={() => setChatOpen(false)} aria-label="Fermer le chat"><X size={18} /></button>
            </div>
            <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto text-sm">
              <div className="bg-backgroundColor rounded-xl rounded-tl-none px-3 py-2 max-w-[80%]">
                Bonjour ! Une question sur la Sneaker Cuir Blanc ?
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-3 border-t border-muted/10">
              <input
                type="text"
                placeholder="Écrire un message…"
                className="flex-1 bg-backgroundColor rounded-full px-4 py-2 text-sm outline-none"
              />
              <button aria-label="Envoyer" className="w-9 h-9 rounded-full bg-accent text-backgroundColor flex items-center justify-center shrink-0">
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}