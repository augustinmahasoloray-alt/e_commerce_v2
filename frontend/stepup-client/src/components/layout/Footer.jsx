import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok, FaPinterestP } from "react-icons/fa6";

const columns = [
  {
    title: "Marketplace",
    links: [
      { to: "/marketplace", label: "Explorer" },
      { to: "/categories", label: "Catégories" },
      { to: "/collections", label: "Collections" },
      { to: "/nouveautes", label: "Nouveautés" },
      { to: "/meilleures-ventes", label: "Meilleures ventes" },
    ],
  },
  {
    title: "Pour les vendeurs",
    links: [
      { to: "/vendeur/apply", label: "Devenir vendeur" },
      // { to: "/vendeur/ouvrir-boutique", label: "Ouvrir une boutique" },
      // { to: "/vendeur/dashboard", label: "Espace vendeur" },
      // { to: "/vendeur/conditions", label: "Conditions pour les vendeurs" },
    ],
  },
  // {
  //   title: "À propos",
  //   links: [
  //     { to: "/apropos/histoire", label: "Notre histoire" },
  //     { to: "/apropos/philosophie", label: "Notre philosophie" },
  //     { to: "/apropos/engagements", label: "Engagements" },
  //     { to: "/vendeur/apply", label: "Rejoindre la marketplace" },
  //   ],
  // },
  // {
  //   title: "Aide",
  //   links: [
  //     { to: "/aide", label: "Centre d'aide" },
  //     { to: "/aide/livraison", label: "Livraison" },
  //     { to: "/aide/retours", label: "Retours" },
  //     { to: "/aide/paiement", label: "Paiement sécurisé" },
  //     { to: "/contact", label: "Contact" },
  //   ],
  // },
  // {
  //   title: "Légal",
  //   links: [
  //     { to: "/legal/cgv", label: "Conditions générales" },
  //     { to: "/legal/confidentialite", label: "Politique de confidentialité" },
  //     { to: "/legal/cookies", label: "Cookies" },
  //   ],
  // },
];

const socials = [
  { Icon: FaInstagram, label: "Instagram", href: "#" },
  { Icon: FaFacebookF, label: "Facebook", href: "#" },
  { Icon: FaTiktok, label: "TikTok", href: "#" },
  { Icon: FaPinterestP, label: "Pinterest", href: "#" },
];

const columnTitleClass = "font-headline text-sm tracking-[0.15em] uppercase text-textColor mb-5";
const linkClass = "font-body text-sm text-muted hover:text-accent transition-colors duration-300";

function Footer() {
  const annee = new Date().getFullYear();

  return (
  <footer id="apropos" className="border-t border-border bg-background">
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* Haut du footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Logo */}
        <div>
          <h2 className="text-3xl font-headline">
            StepUp<span className="text-accent">.shop</span>
          </h2>

          <p className="mt-4 text-muted text-sm max-w-xs">
            L'élégance de la découverte.
          </p>
        </div>

        {/* Colonnes générées automatiquement */}
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className={columnTitleClass}>
              {col.title}
            </h3>

            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className={linkClass}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Bas du footer */}
      <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">

        <p className="text-sm text-muted text-center md:text-left">
          © {annee} StepUp. Tous droits réservés.
        </p>

        <div className="flex items-center gap-5">
          {socials.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-accent transition-colors duration-300"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="text-sm text-muted text-center md:text-right">
          Paiement sécurisé via Mvola & Orange Money
        </p>

      </div>

    </div>
  </footer>
);
}

export default Footer;