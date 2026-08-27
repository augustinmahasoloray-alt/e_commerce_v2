import { ArrowRight } from "lucide-react";

function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[640px] overflow-hidden">
      {/* Image de fond */}
      <img
        src="https://img.magnific.com/premium-photo/flat-lay-black-gadgets-accessories-blue-background_1353244-2026.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dégradé : lisible en bas, image respirante en haut */}
<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 pb-20 sm:pb-24">
        <div className="max-w-2xl">
          <p className="font-body text-sm tracking-[0.2em] uppercase text-accent mb-4">
            L'art de la sélection
          </p>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#F5F5F5] leading-[1.05] tracking-tight mb-6">
            Osez l'exploration,
            <br />
            vivez l'expérience.
          </h1>

          <p className="font-body text-base sm:text-lg text-[#E5E5E5] leading-relaxed mb-10 max-w-md">
            Une curation de produits qui vous ressemble.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-accent text-[#0B0B0B] font-body text-sm font-medium px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-300"
            >
              Explorer la marketplace
              <ArrowRight size={16} />
            </a>

            <a
              href="/collections"
              className="inline-flex items-center gap-2 border border-white/40 text-[#F5F5F5] font-body text-sm font-medium px-7 py-3.5 rounded-full hover:border-white hover:bg-white/5 transition-colors duration-300"
            >
              Voir les collections
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;