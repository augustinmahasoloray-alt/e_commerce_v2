function FinalCTA() {
  return (
    <section className="w-full bg-[#0B0B0B] py-28 sm:py-36 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#F5F5F5] leading-[1.1] mb-6">
          Prêt à explorer ou à rejoindre l'aventure ?
        </h2>

        <p className="font-body text-base sm:text-lg text-[#A0AEC0] leading-relaxed mb-12">
          Des produits d'exception vous attendent. Et si vous êtes créateur, une opportunité aussi.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4">
          <a
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-accent text-[#0B0B0B] font-body text-sm font-medium px-8 py-4 rounded-full hover:opacity-90 transition-opacity duration-300"
          >
            Commencer l'exploration
          </a>

          <a
            href="/vendeur/apply"
            className="inline-flex items-center gap-2 border border-white/30 text-[#F5F5F5] font-body text-sm font-medium px-8 py-4 rounded-full hover:border-white transition-colors duration-300"
          >
            Devenir vendeur
          </a>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;