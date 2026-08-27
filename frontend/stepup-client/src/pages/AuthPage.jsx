import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register } = useAuth();

    // Si on arrive via /register, on ouvre directement le formulaire d'inscription
    const [isSignUp, setIsSignUp] = useState(location.pathname === "/register");

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
    });

    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
        try {
            await login(loginData);
            navigate("/");
        } catch (err) {
            setLoginError(
                err.response?.data?.message || "Email ou mot de passe incorrect"
            );
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError("");
        setRegisterLoading(true);
        try {
            await register(registerData);
            navigate("/");
        } catch (err) {
            setRegisterError(
                err.response?.data?.message || "Impossible de créer le compte"
            );
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-backgroundColor px-4 py-16">
            {/* ============ VERSION DESKTOP — panneau glissant ============ */}
            <div
                className="hidden md:block relative w-full max-w-4xl overflow-hidden rounded-[2rem] shadow-2xl bg-surfaceColor"
                style={{ minHeight: 560 }}
            >
                {/* ---- Formulaire Connexion (toujours à gauche) ---- */}
                <div
                    className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center px-12 transition-opacity duration-300"
                    style={{
                        opacity: isSignUp ? 0 : 1,
                        pointerEvents: isSignUp ? "none" : "auto",
                    }}
                    aria-hidden={isSignUp}
                >
                    <form onSubmit={handleLoginSubmit} className="w-full max-w-sm">
                        <h1 className="font-headline text-3xl text-textColor mb-8">
                            Connexion
                        </h1>

                        <label className="block font-body text-sm text-muted mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent transition-colors"
                        />

                        <label className="block font-body text-sm text-muted mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                            className="w-full mb-2 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent transition-colors"
                        />

                        <div className="text-right mb-6">
                            <button
                                type="button"
                                className="font-body text-sm text-accent hover:underline"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        {loginError && (
                            <p className="font-body text-sm text-red-500 mb-4">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full py-3 rounded-xl bg-accent text-white font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {loginLoading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>
                </div>

                {/* ---- Formulaire Inscription (toujours à droite) ---- */}
                <div
                    className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-center px-12 transition-opacity duration-300"
                    style={{
                        opacity: isSignUp ? 1 : 0,
                        pointerEvents: isSignUp ? "auto" : "none",
                    }}
                    aria-hidden={!isSignUp}
                >
                    <form onSubmit={handleRegisterSubmit} className="w-full max-w-sm">
                        <h1 className="font-headline text-3xl text-textColor mb-8">
                            Créer un compte
                        </h1>

                        <label className="block font-body text-sm text-muted mb-1">
                            Prénom
                        </label>
                        <input
                            type="text"
                            name="prenom"
                            value={registerData.prenom}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent transition-colors"
                        />

                        <label className="block font-body text-sm text-muted mb-1">
                            Nom
                        </label>
                        <input
                            type="text"
                            name="nom"
                            value={registerData.nom}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent transition-colors"
                        />

                        <label className="block font-body text-sm text-muted mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent transition-colors"
                        />

                        <label className="block font-body text-sm text-muted mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-6 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent transition-colors"
                        />

                        {registerError && (
                            <p className="font-body text-sm text-red-500 mb-4">
                                {registerError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={registerLoading}
                            className="w-full py-3 rounded-xl bg-accent text-white font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {registerLoading ? "Création..." : "S'inscrire"}
                        </button>
                    </form>
                </div>

                {/* ---- Panneau coloré glissant ---- */}
                <div
                    className="absolute top-0 h-full w-1/2 bg-accent transition-transform duration-700 ease-in-out flex items-center justify-center z-10"
                    style={{
                        transform: isSignUp ? "translateX(0%)" : "translateX(100%)",
                        borderRadius: isSignUp ? "0 2rem 2rem 0" : "2rem 0 0 2rem",
                    }}
                >
                    {/* Message affiché quand le panneau est à droite (mode connexion) */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 transition-all duration-500"
                        style={{
                            opacity: isSignUp ? 0 : 1,
                            transform: isSignUp ? "translateX(20px)" : "translateX(0)",
                            pointerEvents: isSignUp ? "none" : "auto",
                        }}
                        aria-hidden={isSignUp}
                    >
                        <h2 className="font-display text-3xl text-white mb-4">
                            Bonjour !
                        </h2>
                        <p className="font-body text-white/90 mb-8">
                            Pas encore de compte ? Inscrivez-vous et profitez de StepUp.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className="px-8 py-3 rounded-xl border-2 border-white text-white font-body font-medium hover:bg-white hover:text-accent transition-colors"
                        >
                            S'inscrire
                        </button>
                    </div>

                    {/* Message affiché quand le panneau est à gauche (mode inscription) */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 transition-all duration-500"
                        style={{
                            opacity: isSignUp ? 1 : 0,
                            transform: isSignUp ? "translateX(0)" : "translateX(-20px)",
                            pointerEvents: isSignUp ? "auto" : "none",
                        }}
                        aria-hidden={!isSignUp}
                    >
                        <h2 className="font-display text-3xl text-white mb-4">
                            Bienvenue sur StepUp
                        </h2>
                        <p className="font-body text-white/90 mb-8">
                            Déjà un compte ? Connectez-vous pour continuer.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className="px-8 py-3 rounded-xl border-2 border-white text-white font-body font-medium hover:bg-white hover:text-accent transition-colors"
                        >
                            Se connecter
                        </button>
                    </div>
                </div>
            </div>

            {/* ============ VERSION MOBILE — bascule simple, sans slide ============ */}
            <div className="md:hidden w-full max-w-sm bg-surfaceColor rounded-2xl shadow-xl p-8">
                <div className="flex mb-8 rounded-xl bg-backgroundColor p-1">
                    <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-2 rounded-lg font-body text-sm transition-colors ${!isSignUp ? "bg-accent text-white" : "text-muted"
                            }`}
                    >
                        Connexion
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-2 rounded-lg font-body text-sm transition-colors ${isSignUp ? "bg-accent text-white" : "text-muted"
                            }`}
                    >
                        Inscription
                    </button>
                </div>

                {!isSignUp ? (
                    <form onSubmit={handleLoginSubmit}>
                        <h1 className="font-headline text-2xl text-textColor mb-6">
                            Connexion
                        </h1>
                        <label className="block font-body text-sm text-muted mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent"
                        />
                        <label className="block font-body text-sm text-muted mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                            className="w-full mb-6 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent"
                        />
                        {loginError && (
                            <p className="font-body text-sm text-red-500 mb-4">
                                {loginError}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full py-3 rounded-xl bg-accent text-white font-body font-medium disabled:opacity-60"
                        >
                            {loginLoading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit}>
                        <h1 className="font-headline text-2xl text-textColor mb-6">
                            Créer un compte
                        </h1>
                        <label className="block font-body text-sm text-muted mb-1">
                            Prénom
                        </label>
                        <input
                            type="text"
                            name="prenom"
                            value={registerData.prenom}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent"
                        />

                        <label className="block font-body text-sm text-muted mb-1">
                            Nom
                        </label>
                        <input
                            type="text"
                            name="nom"
                            value={registerData.nom}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent"
                        />
                        <label className="block font-body text-sm text-muted mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent"
                        />
                        <label className="block font-body text-sm text-muted mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required
                            className="w-full mb-6 px-4 py-3 rounded-xl border border-muted/30 bg-backgroundColor text-textColor font-body outline-none focus:border-accent"
                        />
                        {registerError && (
                            <p className="font-body text-sm text-red-500 mb-4">
                                {registerError}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={registerLoading}
                            className="w-full py-3 rounded-xl bg-accent text-white font-body font-medium disabled:opacity-60"
                        >
                            {registerLoading ? "Création..." : "S'inscrire"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthPage;