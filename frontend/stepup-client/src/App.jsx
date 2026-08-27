import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Boutique from "./pages/Boutique.jsx";
import VendorApply from "./pages/VendorApply.jsx";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartPage } from "./pages/CartPage";

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className={`flex-1 ${isHome ? "" : "pt-20"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          <Route path="/boutique" element={<Boutique />} />
          <Route path="/vendeur/apply" element={<VendorApply />} />

          {/* Filet de sécurité : anciennes routes marketplace multi-vendeur
              redirigées vers la boutique unique, au cas où un lien oublié
              pointerait encore vers l'une d'elles. */}
          <Route path="/boutiques" element={<Navigate to="/boutique" replace />} />
          <Route path="/marketplace" element={<Navigate to="/boutique" replace />} />
          <Route path="/categories" element={<Navigate to="/boutique" replace />} />
          <Route path="/collections" element={<Navigate to="/boutique" replace />} />
          <Route path="/nouveautes" element={<Navigate to="/boutique" replace />} />
          <Route path="/meilleures-ventes" element={<Navigate to="/boutique" replace />} />
          <Route path="/produits" element={<Navigate to="/boutique" replace />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;