import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    label: "Nouveauté",
    title: "Nouvelles Montres",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80",
    to: "/collections/nouvelles-montres",
  },
  {
    label: "Tendance",
    title: "Montres Élégantes",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80",
    to: "/collections/montres-elegantes",
  },
  {
    label: "Best-seller",
    title: "Les Montres Populaires",
    image:
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=1000&q=80",
    to: "/collections/best-sellers",
  },
  {
    label: "Édition limitée",
    title: "Collection Premium",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1000&q=80",
    to: "/collections/premium",
  },
  {
    label: "Sélection",
    title: "Sacs Homme",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    to: "/collections/sacs-homme",
  },
  {
    label: "Coup de cœur",
    title: "Sacs & Sacoches",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
    to: "/collections/sacs-sacoches",
  },
];

function CollectionCard({ c }) {
  return (
    <Link
      to="/boutiques"
      className="group relative shrink-0 w-[280px] sm:w-[340px] aspect-[3/4] overflow-hidden"
      style={{ pointerEvents: "auto" }}
    >
      <img
        src={c.image}
        alt={c.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

      <span className="absolute top-5 left-5 font-body text-xs tracking-[0.1em] uppercase text-[#0B0B0B] bg-accent px-3 py-1.5">
        {c.label}
      </span>

      <div className="relative z-10 h-full flex items-end p-6">
        <h3 className="font-headline text-xl text-[#F5F5F5]">
          {c.title}
        </h3>
      </div>
    </Link>
  );
}

function FeaturedCollections() {
  return (
    <section className="w-full bg-backgroundColor py-24 sm:py-32">
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
        <div>
          <p className="font-body text-sm tracking-[0.2em] uppercase text-accent mb-4">
            Nos coups de cœur
          </p>

          <h2 className="font-display text-4xl sm:text-5xl text-textColor leading-[1.1]">
            Collections du moment
          </h2>

          <p className="font-body text-base text-muted mt-4">
            Découvrez notre sélection de montres et sacs pour homme.
          </p>
        </div>

        <Link
          to="/boutiques"
          className="group inline-flex items-center gap-2 font-body text-sm text-textColor shrink-0"
        >
          Voir toutes les collections

          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Conteneur du marquee */}
      <div className="relative w-full overflow-hidden">

        <style jsx>{`
          .marquee-track {
            animation: marquee 30s linear infinite;
            display: flex;
            gap: 1.25rem;
            width: max-content;
          }

          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }

            100% {
              transform: translateX(-50%);
            }
          }

          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="marquee-track">
          {[...collections, ...collections].map((c, i) => (
            <CollectionCard
              key={`${c.to}-${i}`}
              c={c}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCollections;