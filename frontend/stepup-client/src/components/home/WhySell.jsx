import { Link } from "react-router-dom";
import { Users, Sparkles, LifeBuoy, TrendingUp } from "lucide-react";

const advantages = [
  {
    icon: Users,
    title: "Une audience exigeante",
    description:
      "Nos clients recherchent l'authenticité et la qualité. Exactement ce que vous proposez.",
  },
  {
    icon: Sparkles,
    title: "Une vitrine premium",
    description:
      "Mettez en avant votre univers dans un écrin qui valorise votre travail.",
  },
  {
    icon: LifeBuoy,
    title: "Un accompagnement sur mesure",
    description:
      "De l'intégration à la logistique, nous vous épaulons à chaque étape.",
  },
  {
    icon: TrendingUp,
    title: "Une visibilité accrue",
    description:
      "Bénéficiez de notre marketing et de notre notoriété pour développer votre marque.",
  },
];

function WhySell() {
  return (
    <section className="w-full bg-surfaceColor py-24 sm:py-32 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40">
      <div className="max-w-2xl mb-16 sm:mb-20">
        <p className="font-body text-sm tracking-[0.2em] uppercase text-accent mb-4">
          Une opportunité
        </p>

        <h2 className="font-display text-4xl sm:text-5xl text-textColor leading-[1.1] mb-6">
          Pourquoi rejoindre la marketplace ?
        </h2>

        <p className="font-body text-base text-muted leading-relaxed">
          Nous ne sommes pas un simple canal de vente. Nous sommes un partenaire.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
        {advantages.map(({ icon: Icon, title, description }) => (
          <div key={title}>
            <Icon
              size={22}
              className="text-accent mb-5"
              strokeWidth={1.5}
            />

            <h3 className="font-headline text-base text-textColor mb-3">
              {title}
            </h3>

            <p className="font-body text-sm text-muted leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          to="/vendeur/apply"
          className="inline-flex items-center gap-2 bg-accent text-[#0B0B0B] font-body text-sm font-medium px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-300"
        >
          Devenir vendeur
        </Link>

        <Link
          to="/boutiques"
          className="inline-flex items-center gap-2 border border-muted/30 text-textColor font-body text-sm font-medium px-7 py-3.5 rounded-full hover:border-textColor transition-colors duration-300"
        >
          En savoir plus
        </Link>
      </div>
    </section>
  );
}

export default WhySell;