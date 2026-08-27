import { Lock, BadgeCheck, Truck, Headphones, RotateCcw, ShieldCheck } from "lucide-react";

const badges = [
  { icon: Lock, label: "Paiement 100 % sécurisé" },
  { icon: BadgeCheck, label: "Vendeurs vérifiés" },
  { icon: Truck, label: "Livraison express" },
  { icon: Headphones, label: "Service client réactif" },
  { icon: RotateCcw, label: "Retours sous 30 jours" },
  { icon: ShieldCheck, label: "Acheteur protégé" },
];

function TrustBadges() {
  return (
    <section className="w-full bg-backgroundColor border-y border-muted/10 py-16 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40">
      <h2 className="font-headline text-xl text-textColor tracking-wide mb-12 text-center">
        La sérénité en plus
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center text-center gap-3">
            <Icon size={20} className="text-accent" strokeWidth={1.5} />
            <p className="font-body text-xs text-muted leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBadges;