import { useCart } from "../contexts/CartContext";
import { useState } from "react";

export const AddToCartButton = ({ variantId, quantite = 1, disabled = false }) => {
  const { addToCart, loading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    if (disabled) return;
    setIsAdding(true);
    try {
      await addToCart(variantId, quantite);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading || isAdding}
      className="w-full bg-accent text-backgroundColor px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading || isAdding ? "Ajout..." : "Ajouter au panier"}
    </button>
  );
};