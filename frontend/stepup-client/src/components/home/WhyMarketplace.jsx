const reasons = [
  { number: "01", title: "Une sélection sans compromis", description: "Nous ne laissons rien au hasard. Chaque marque est choisie pour la solidité de ses produits et la force de son identité." },
  { number: "02", title: "La diversité comme atout", description: "En quelques clics, passez du mobilier contemporain à l'accessoire artisanal. Sans perdre en qualité." },
  { number: "03", title: "Une expérience fluide", description: "Navigation intuitive, paiement sécurisé, livraison soignée. Rien ne doit entraver votre décision." },
  { number: "04", title: "La découverte permanente", description: "Chaque visite est une occasion de trouver l'objet que vous ne cherchiez pas. Mais que vous attendiez." },
];

function WhyMarketplace() {
  return (
    <section className="w-full bg-backgroundColor py-24 sm:py-32 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40">
      <h2 className="font-headline text-2xl sm:text-3xl text-textColor tracking-wide mb-16 sm:mb-20">
        Pourquoi acheter ici ?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
        {reasons.map((r) => (
          <div key={r.number} className="flex gap-6">
            <span className="font-display text-3xl text-accent/40 leading-none shrink-0">
              {r.number}
            </span>
            <div>
              <h3 className="font-headline text-lg text-textColor mb-3">{r.title}</h3>
              <p className="font-body text-sm text-muted leading-relaxed max-w-sm">
                {r.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyMarketplace;