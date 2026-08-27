import { ArrowRight, ChevronLeft, ChevronRight, Star, Store, ShieldCheck, Headset, Truck } from "lucide-react";

/**
 * StepUp — Page d'accueil publique (MARKETPLACE de chaussures, boutiques indépendantes)
 * À insérer entre <Navbar /> et <Footer /> (déjà codés) dans le routeur.
 * Le Navbar est fixed h-20 → cette page compense avec pt-20.
 * Utilise les classes générées par @theme dans index.css :
 *   bg-backgroundColor · bg-surfaceColor · text-textColor · text-accent · text-muted
 *   font-display (Qurova) · font-headline (Metal) · font-body (Albert Sans)
 */

const categories = [
  "Sneakers", "Running", "Talons", "Bottes", "Sandales", "Mocassins", "Enfants", "Accessoires",
];

const boutiques = [
  { name: "Atelier Rasoa", specialite: "Cuir artisanal malgache", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80" },
  { name: "UrbanStep", specialite: "Sneakers édition limitée", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80" },
  { name: "Kanto Shoes", specialite: "Running & sport", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { name: "Maison Tovo", specialite: "Chic & élégance", img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80" },
];

const bestSellers = [
  { name: "Sneaker Cuir Blanc", boutique: "UrbanStep", price: "89.99", rating: 4.8, reviews: 120, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80" },
  { name: "Running Air Léger", boutique: "Kanto Shoes", price: "104.99", rating: 4.7, reviews: 98, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" },
  { name: "Derby Cuir Marron", boutique: "Atelier Rasoa", price: "129.99", rating: 4.9, reviews: 156, img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=80" },
  { name: "Sandale Minimaliste", boutique: "Maison Tovo", price: "59.99", rating: 4.6, reviews: 69, img: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&q=80" },
  { name: "Botte Chelsea Noire", boutique: "Atelier Rasoa", price: "149.99", rating: 4.8, reviews: 132, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80" },
  { name: "Sneaker Édition Studio", boutique: "UrbanStep", price: "119.99", rating: 4.9, reviews: 110, img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80" },
];

const testimonials = [
  { name: "Nathalie R.", text: "J'aime pouvoir acheter directement chez de petits artisans, avec la même simplicité qu'une grande enseigne.", rating: 5 },
  { name: "Mickael A.", text: "Chaque boutique a sa personnalité, mais l'expérience d'achat reste toujours aussi fluide.", rating: 5 },
  { name: "Sarah L.", text: "Un vrai coup de cœur pour découvrir des créateurs qu'on ne trouve nulle part ailleurs.", rating: 5 },
];

function Pill({ children, variant = "primary", className = "" }) {
  const base = "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300";
  const variants = {
    primary: "bg-accent text-backgroundColor hover:opacity-90",
    secondary: "border border-muted/40 text-textColor hover:border-accent hover:text-accent",
  };
  return <button className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}

export default function PublicHome() {
  return (
    <main className="min-h-screen font-body bg-backgroundColor text-textColor pt-20">
      {/* hero */}
      <section className="grid md:grid-cols-2 gap-10 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-14 items-center">
        <div>
          <span className="text-xs tracking-[0.2em] text-accent font-medium">— LA MARKETPLACE DE LA CHAUSSURE</span>
          <h1 className="font-display font-light text-5xl md:text-7xl leading-[1.05] mt-4 mb-6 tracking-tight">
            Chaque boutique
            <br />a son histoire.
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-md mb-8">
            Découvrez des dizaines de boutiques indépendantes réunies en un seul endroit — artisans, créateurs et marques émergentes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Pill variant="primary">Explorer les boutiques <ArrowRight size={16} /></Pill>
            <Pill variant="secondary">Devenir vendeur</Pill>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-surfaceColor">
            <img
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80"
              alt="Sélection de chaussures issues de plusieurs boutiques"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-6 bg-surfaceColor rounded-xl shadow-lg p-4 flex items-center gap-3 max-w-[240px]">
            <Store size={18} className="text-accent shrink-0" />
            <div>
              <p className="text-sm font-medium">40+ boutiques actives</p>
              <p className="text-xs text-muted">Nouvelles chaque semaine</p>
            </div>
          </div>
        </div>
      </section>

      {/* catégories */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-10 flex flex-wrap gap-x-10 gap-y-6 justify-center border-y border-muted/10">
        {categories.map((cat) => (
          <div key={cat} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-surfaceColor flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <div className="w-5 h-5 rounded-sm border border-muted group-hover:border-accent" />
            </div>
            <span className="text-xs text-muted group-hover:text-accent transition-colors">{cat}</span>
          </div>
        ))}
      </section>

      {/* boutiques à la une */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl">Boutiques à la une</h2>
          <a href="/marketplace" className="text-sm text-accent inline-flex items-center gap-1">
            Voir toutes les boutiques <ArrowRight size={14} />
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {boutiques.map((b) => (
            <div key={b.name} className="group cursor-pointer">
              <div className="aspect-square rounded-xl overflow-hidden bg-surfaceColor mb-3">
                <img src={b.img} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-sm font-medium leading-tight">{b.name}</p>
              <p className="text-xs text-muted mt-0.5">{b.specialite}</p>
            </div>
          ))}
        </div>
      </section>

      {/* bannières promo */}
      <section className="grid md:grid-cols-3 gap-6 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-14">
        {[
          { tag: "Nouvelles boutiques", title: "Des créateurs à découvrir chaque semaine", cta: "Découvrir" },
          { tag: "Vente flash", title: "Jusqu'à -40% chez certains vendeurs", cta: "Voir les offres" },
          { tag: "Vous vendez des chaussures ?", title: "Ouvrez votre boutique sur StepUp", cta: "Devenir vendeur" },
        ].map((b) => (
          <div key={b.tag} className="rounded-2xl bg-surfaceColor p-8 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-xs text-muted">{b.tag}</span>
              <h3 className="font-headline text-xl mt-2 leading-snug">{b.title}</h3>
            </div>
            <a href="#" className="text-sm text-accent inline-flex items-center gap-1 mt-6">
              {b.cta} <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </section>

      {/* meilleures ventes */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl">Meilleures ventes</h2>
          <a href="/meilleures-ventes" className="text-sm text-accent inline-flex items-center gap-1">
            Voir tous les produits <ArrowRight size={14} />
          </a>
        </div>
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {bestSellers.map((p) => (
              <div key={p.name} className="group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-surfaceColor mb-3">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-[11px] text-accent uppercase tracking-wide mb-0.5">{p.boutique}</p>
                <p className="text-sm font-medium leading-tight">{p.name}</p>
                <p className="text-sm text-textColor/80 font-medium mt-1">{p.price} Ar</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" className="text-accent" />
                  ))}
                  <span className="text-[11px] text-muted ml-1">({p.reviews})</span>
                </div>
              </div>
            ))}
          </div>
          <button className="hidden md:flex absolute -right-4 top-1/3 w-9 h-9 rounded-full bg-surfaceColor shadow items-center justify-center">
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* garanties */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-10 border-y border-muted/10 grid grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { icon: Store, title: "Boutiques vérifiées", sub: "Chaque vendeur est validé" },
          { icon: ShieldCheck, title: "Paiement sécurisé", sub: "MVola & Orange Money" },
          { icon: Headset, title: "Support marketplace", sub: "Disponible 7j/7" },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3">
            <Icon size={22} className="text-accent shrink-0" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* avis clients */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-14 text-center">
        <div className="flex items-center justify-center gap-4 mb-10">
          <ChevronLeft size={18} className="text-muted cursor-pointer" />
          <h2 className="font-headline text-2xl">Ce que disent nos clients</h2>
          <ChevronRight size={18} className="text-muted cursor-pointer" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl bg-surfaceColor p-6">
              <p className="text-sm text-textColor/90 leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" className="text-accent" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA vendeur */}
      <section className="mx-4 sm:mx-6 md:mx-10 lg:mx-16 xl:mx-24 2xl:mx-40 mb-14 rounded-2xl bg-textColor text-backgroundColor p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-headline text-xl mb-1">Une boutique de chaussures à faire connaître ?</h3>
          <p className="text-sm opacity-70">Rejoignez StepUp et vendez directement à des milliers d'acheteurs.</p>
        </div>
        <Pill variant="primary">Devenir vendeur <ArrowRight size={16} /></Pill>
      </section>
    </main>
  );
}