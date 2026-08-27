import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getDefaultAddress } from "../services/addressService";

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // ============ Panier classique (conservé, utilisé ailleurs) ============

  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Erreur fetchCart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (variantId, quantite = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
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

  const removeFromCart = async (itemId) => {
    if (!token) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (error) {
      console.error("Erreur removeFromCart:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(null);
    } catch (error) {
      console.error("Erreur clearCart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  // ============ Commande directe (1 clic = 1 commande) ============

  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [needsAddress, setNeedsAddress] = useState(false);
  const [pendingItem, setPendingItem] = useState(null); // { variantId, quantite } en attente d'une adresse

  /**
   * Tente de créer directement une commande pour un seul variant.
   * Si l'utilisateur n'a aucune adresse enregistrée, ne crée rien et
   * lève needsAddress=true : le composant appelant doit alors afficher
   * un formulaire d'adresse, puis rappeler createDirectOrder une fois
   * l'adresse créée.
   */
  const createDirectOrder = async (variantId, quantite = 1) => {
    if (!token) {
      setOrderError("Vous devez être connecté pour commander.");
      return null;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const address = await getDefaultAddress(token);

      if (!address) {
        setNeedsAddress(true);
        setPendingItem({ variantId, quantite });
        return null;
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address_id: address.id,
          mode_paiement: "a_definir",
          mode_livraison: "a_definir",
          items: [{ variant_id: variantId, quantite }],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur lors de la création de la commande.");

      setNeedsAddress(false);
      setPendingItem(null);
      return data.order;
    } catch (error) {
      setOrderError(error.message);
      return null;
    } finally {
      setOrderLoading(false);
    }
  };

  /**
   * À appeler après création réussie d'une adresse (depuis la modale) :
   * relance automatiquement la commande en attente.
   */
  const retryPendingOrder = async () => {
    if (!pendingItem) return null;
    const { variantId, quantite } = pendingItem;
    return createDirectOrder(variantId, quantite);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        fetchCart,
        // commande directe
        createDirectOrder,
        retryPendingOrder,
        orderLoading,
        orderError,
        needsAddress,
        setNeedsAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur de CartProvider");
  }
  return context;
};