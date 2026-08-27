import { Link } from "react-router-dom";

function JoinUs() {
  return (
    <section className="w-full bg-[#0B0B0B] py-24 sm:py-32 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40">
      <div className="max-w-2xl">
        <p className="font-body text-sm tracking-[0.2em] uppercase text-accent mb-6">
          On recrute
        </p>

        <h2 className="font-display text-4xl sm:text-5xl text-[#F5F5F5] leading-[1.1] mb-8">
          Votre marque mérite mieux qu'un simple site.
        </h2>

        <p className="font-body text-base text-[#A0AEC0] leading-relaxed mb-12 max-w-xl">
          Rejoignez un espace où l'exigence est la norme. Développez votre
          visibilité, gagnez en crédibilité et rencontrez une clientèle prête
          à reconnaître votre valeur. Nous mettons notre plateforme et notre
          expertise au service de votre succès.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/vendeur/apply"
            className="inline-flex items-center gap-2 bg-accent text-[#0B0B0B] font-body text-sm font-medium px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-300"
          >
            Proposer sa marque
          </Link>

          <Link
            to="/boutiques"
            className="inline-flex items-center gap-2 border border-white/30 text-[#F5F5F5] font-body text-sm font-medium px-7 py-3.5 rounded-full hover:border-white transition-colors duration-300"
          >
            En savoir plus
          </Link>
        </div>
      </div>
    </section>
  );
}

export default JoinUs;