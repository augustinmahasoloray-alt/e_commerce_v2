import { useCart } from "../contexts/CartContext.jsx";
import { Link } from "react-router-dom";

export const CartPage = () => {
  const { cart, removeFromCart, clearCart, loading } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-4 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <Link to="/" className="text-blue-500 hover:underline">
          Continuer vos achats
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mon Panier</h1>

      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <img
                src={item.variant.product.images?.[0]?.url || "/placeholder.jpg"}
                alt={item.variant.product.nom}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h2 className="font-semibold">{item.variant.product.nom}</h2>
                <p className="text-sm text-gray-500">
                  {item.variant.taille && `Taille: ${item.variant.taille}`}
                  {item.variant.couleur && `, Couleur: ${item.variant.couleur}`}
                </p>
                <p className="text-sm">
                  Prix: {item.variant.product.prix} Ar x {item.quantite} ={" "}
                  <span className="font-bold">
                    {(item.variant.product.prix * item.quantite).toFixed(2)} Ar
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              disabled={loading}
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-xl font-bold">Total: {cart.total.toFixed(2)} Ar</p>
        <div className="space-x-4">
          <button
            onClick={clearCart}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Vider le panier
          </button>
          <Link
            to="/checkout"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Passer à la caisse
          </Link>
        </div>
      </div>
    </div>
  );
};