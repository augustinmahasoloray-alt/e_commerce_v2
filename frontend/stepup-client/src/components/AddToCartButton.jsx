import { useCart } from "../contexts/CartContext";

export const AddToCartButton = ({ variantId, quantite = 1 }) => {
  const { addToCart, loading } = useCart();

  const handleClick = () => {
    addToCart(variantId, quantite);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? "Ajout..." : "Ajouter au panier"}
    </button>
  );
};