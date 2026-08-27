import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { createAddress } from "../../services/addressService";

export default function AddressModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const { retryPendingOrder } = useCart();
  const [form, setForm] = useState({ ligne1: "", ligne2: "", ville: "", code_postal: "", pays: "Madagascar" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createAddress(token, form);
      const order = await retryPendingOrder();
      if (order) {
        onSuccess?.(order);
      } else {
        setError("Adresse enregistrée, mais la commande n'a pas pu être créée.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-textColor/40" onClick={onClose} />
      <div className="relative bg-backgroundColor text-textColor rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg">Adresse de livraison</h3>
          <button onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>

        <p className="text-sm text-muted mb-4">
          Aucune adresse enregistrée. Ajoutez-en une pour valider votre commande.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="ligne1" placeholder="Adresse (ligne 1)" required value={form.ligne1} onChange={handleChange}
            className="bg-surfaceColor rounded-lg px-3 py-2 text-sm outline-none" />
          <input name="ligne2" placeholder="Complément d'adresse (optionnel)" value={form.ligne2} onChange={handleChange}
            className="bg-surfaceColor rounded-lg px-3 py-2 text-sm outline-none" />
          <input name="ville" placeholder="Ville" required value={form.ville} onChange={handleChange}
            className="bg-surfaceColor rounded-lg px-3 py-2 text-sm outline-none" />
          <input name="code_postal" placeholder="Code postal" required value={form.code_postal} onChange={handleChange}
            className="bg-surfaceColor rounded-lg px-3 py-2 text-sm outline-none" />
          <input name="pays" placeholder="Pays" required value={form.pays} onChange={handleChange}
            className="bg-surfaceColor rounded-lg px-3 py-2 text-sm outline-none" />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={saving}
            className="bg-accent text-backgroundColor rounded-full py-2.5 text-sm font-medium mt-2 disabled:opacity-60">
            {saving ? "Enregistrement..." : "Enregistrer et commander"}
          </button>
        </form>
      </div>
    </div>
  );
}