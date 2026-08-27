import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Assure-toi que ce fichier existe aussi

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Récupérer le panier depuis le backend
  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Erreur fetchCart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un produit au panier
  const addToCart = async (variantId, quantite = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variantId, quantite }),
      });
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Erreur addToCart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un item du panier
  const removeFromCart = async (itemId) => {
    if (!token) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchCart(); // Rafraîchir le panier
    } catch (error) {
      console.error("Erreur removeFromCart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Vider le panier
  const clearCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await fetch("http://localhost:3000/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(null);
    } catch (error) {
      console.error("Erreur clearCart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger le panier au montage si l'utilisateur est connecté
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, removeFromCart, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);