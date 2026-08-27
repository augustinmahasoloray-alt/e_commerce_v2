import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LayoutDashboard, Sun, Moon } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import useScrolled from "../../hooks/useScrolled";
import { ArrowRight } from "lucide-react";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/boutiques", label: "Boutiques" },
  { to: "/nouveautes", label: "Nouveautés" },
  { to: "/promotions", label: "Promotions" },
  { to: "#apropos", label: "À Propos" },
];

// Mono-vendeur : le seul rôle "privilégié" restant est admin (toi, le vendeur unique)
const getAccountLink = (user) => {
  if (!user) return "/login";
  if (user.role === "admin") return "/admin";
  return "/compte";
};

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cartCount] = useState(0);

  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const menuRef = useRef(null);
  const iconsRef = useRef(null);

  const scrolled = useScrolled(40);
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  const textClass = isTransparent ? "text-white" : "text-textColor";
  const mutedClass = isTransparent ? "text-white/70 hover:text-white" : "text-muted hover:text-accent";
  const navLinkClass = `relative font-body transition-colors duration-300 whitespace-nowrap ${isTransparent ? "text-white hover:text-white/80" : "text-textColor hover:text-accent"
    } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full`;

  const checkCollision = useCallback(() => {
    if (!containerRef.current || !logoRef.current || !menuRef.current || !iconsRef.current) return;

    const available = containerRef.current.clientWidth;
    const needed =
      logoRef.current.scrollWidth +
      menuRef.current.scrollWidth +
      iconsRef.current.scrollWidth +
      100;

    setIsCollapsed(needed > available);
  }, []);

  useEffect(() => {
    checkCollision();
    const observer = new ResizeObserver(checkCollision);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", checkCollision);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkCollision);
    };
  }, [checkCollision]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`w-full h-20 flex items-center fixed top-0 left-0 z-50 font-body px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 transition-all duration-300 ${isTransparent ? "bg-transparent shadow-none" : "bg-backgroundColor shadow-md"
        }`}
    >
      <div ref={containerRef} className="flex justify-between items-center h-full w-full relative">

        <div className="flex items-center gap-4 shrink-0">
          {isCollapsed && (
            <button onClick={() => setIsOpen(true)} aria-label="Ouvrir le menu" className={textClass}>
              <Menu size={25} />
            </button>
          )}

          <Link to="/" ref={logoRef} className={isCollapsed ? "invisible" : ""}>
            <h1 className={`text-3xl font-headline tracking-wide ${textClass}`}>
              StepUp
              <span className="text-2xl font-body text-accent">.shop</span>
            </h1>
          </Link>
        </div>

        {isCollapsed && (
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <h1 className={`text-3xl font-headline tracking-wide ${textClass}`}>
              StepUp
              <span className="text-2xl font-body text-accent">.shop</span>
            </h1>
          </Link>
        )}

        {!isCollapsed && (
          <div className="flex flex-1 justify-center items-center gap-10 h-full text-base">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={navLinkClass}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div ref={iconsRef} className="flex items-center gap-5 shrink-0">
          {/* Bouton mode sombre */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
            className="text-accent hover:scale-110 transition-transform duration-200"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Search size={22} className="cursor-pointer text-accent hover:scale-110 transition-transform duration-200" />

          <Link to="/panier" className="relative cursor-pointer text-accent hover:scale-110 transition-transform duration-200">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-backgroundColor text-xs w-4 h-4 flex justify-center items-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" title="Espace admin" className="text-accent hover:scale-110 transition-transform duration-200">
              <LayoutDashboard size={22} />
            </Link>
          )}

          <Link to={getAccountLink(user)} className="text-accent hover:scale-110 transition-transform duration-200">
            <User size={22} />
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className={`hidden md:block text-sm font-body transition-colors duration-300 ${mutedClass}`}
            >
              Déconnexion
            </button>
          )}
        </div>

        <div
          ref={menuRef}
          className="flex items-center gap-10 text-base absolute opacity-0 pointer-events-none -z-10"
          aria-hidden="true"
        >
          {links.map((l) => (
            <span key={l.to} className="whitespace-nowrap">{l.label}</span>
          ))}
        </div>

      </div>

      <div
        className={`
          fixed inset-0 bg-backgroundColor text-textColor z-[100]
          flex flex-col items-center justify-center
          transition-all duration-300 ease-in-out transform
          ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}
        `}
      >
        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 z-[110]" aria-label="Fermer le menu">
          <X size={28} />
        </button>

        <div className="flex flex-col items-center gap-8 text-2xl">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setIsOpen(false)}
              className="relative font-body text-textColor hover:text-accent transition-colors duration-300"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => { setIsOpen(false); handleLogout(); }}
              className="relative font-body text-textColor hover:text-accent transition-colors duration-300"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;