import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Montres Homme",
    description: "Des montres élégantes et intemporelles pour affirmer votre style.",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80",
    to: "/categorie/montres-homme",
    featured: true,
  },
  {
    title: "Sacs Homme",
    description: "Des sacs pratiques et élégants pour accompagner chaque journée.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    to: "/categorie/sacs-homme",
  },
  {
    title: "Sacoches",
    description: "Des modèles compacts et modernes pour transporter vos essentiels.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
    to: "/categorie/sacoches-homme",
  },
  {
    title: "Montres Élégantes",
    description: "Des modèles raffinés pour les occasions qui comptent.",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80",
    to: "/categorie/montres-elegantes",
  },
  {
    title: "Sacs de Voyage",
    description: "Des sacs robustes et spacieux pour vos déplacements.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    to: "/categorie/sacs-voyage",
  },
  {
    title: "Accessoires Homme",
    description: "Les détails qui complètent un style masculin soigné.",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1000&q=80",
    to: "/categorie/accessoires-homme",
  },
];

function CategoryCard({ category, className = "" }) {
  return (
    <Link
      to="/boutiques"
      className={`group relative block overflow-hidden ${className}`}
    >
      <img
        src={category.image}
        alt={category.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8">
        <h3 className="font-headline text-xl sm:text-2xl text-[#F5F5F5] mb-2">
          {category.title}
        </h3>

        <p className="font-body text-sm text-[#E5E5E5] leading-relaxed mb-4 max-w-xs">
          {category.description}
        </p>

        <span className="inline-flex items-center gap-2 font-body text-sm text-accent">
          Explorer
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

function Categories() {
  const [featured, ...rest] = categories;

  return (
    <section className="w-full bg-backgroundColor py-24 sm:py-32 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40">
      <h2 className="font-headline text-2xl sm:text-3xl text-textColor tracking-wide mb-12 sm:mb-16">
        Nos collections
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <CategoryCard
          category={featured}
          className="lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto"
        />

        {rest.map((cat) => (
          <CategoryCard
            key={cat.to}
            category={cat}
            className="aspect-[4/3]"
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;