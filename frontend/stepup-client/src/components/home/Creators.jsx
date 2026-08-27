import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const sampleCreators = [
  {
    name: "Atelier Horloger",
    category: "Montres Homme",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80",
    to: "/vendeur/atelier-horloger",
  },
  {
    name: "Maison Élégance",
    category: "Montres Élégantes",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80",
    to: "/vendeur/maison-elegance",
  },
  {
    name: "Cuir & Style",
    category: "Sacs Homme",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    to: "/vendeur/cuir-et-style",
  },
  {
    name: "Maison Voyage",
    category: "Sacs & Sacoches",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
    to: "/vendeur/maison-voyage",
  },
];

function Creators({ creators = sampleCreators }) {
  return (
    <section className="w-full bg-backgroundColor py-24 sm:py-32 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 mb-16">
        <div className="max-w-xl">
          <p className="font-body text-sm tracking-[0.2em] uppercase text-accent mb-4">
            Univers
          </p>

          <h2 className="font-display text-4xl sm:text-5xl text-textColor leading-[1.1] mb-6">
            Nos sélections
          </h2>

          <p className="font-body text-base text-muted leading-relaxed">
            Découvrez notre sélection de montres et de sacs pour homme.
            Des pièces soigneusement choisies pour leur style, leur qualité
            et leur caractère.
          </p>
        </div>

        <Link
          to="/boutiques"
          className="group inline-flex items-center gap-2 font-body text-sm text-textColor shrink-0"
        >
          Découvrir les boutiques
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {creators.map((c) => (
          <div key={c.to} className="group block">
            <Link
              to="/boutiques"
              className="relative aspect-[3/4] overflow-hidden mb-4 block"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </Link>

            <h3 className="font-headline text-base text-textColor mb-1">
              {c.name}
            </h3>

            <p className="font-body text-sm text-muted mb-2">
              {c.category}
            </p>

            <Link
              to="/boutiques"
              className="font-body text-xs text-accent group-hover:underline"
            >
              Voir la boutique
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Creators;