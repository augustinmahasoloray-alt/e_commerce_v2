import { useState } from "react";
import { Heart } from "lucide-react";

const stockConfig = {
  "en-stock": { label: "En stock", dot: "bg-accent" },
  "rupture": { label: "Rupture de stock", dot: "bg-muted" },
  "bientot": { label: "Bientôt de retour", dot: "bg-muted" },
};

function ProductCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const stock = stockConfig[product.stockStatus] ?? stockConfig["en-stock"];
  const outOfStock = product.stockStatus !== "en-stock";

  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-surfaceColor mb-4">
        <img
          src={product.image}
          alt=""
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            outOfStock ? "opacity-50" : "group-hover:scale-105"
          }`}
        />

        {product.label && (
          <span className="absolute top-4 left-4 font-body text-xs tracking-[0.1em] uppercase text-[#0B0B0B] bg-accent px-3 py-1.5">
            {product.label}
          </span>
        )}

        {product.discountPercent && (
          <span className="absolute top-4 right-4 font-body text-xs text-[#F5F5F5] bg-[#0B0B0B]/80 px-3 py-1.5">
            -{product.discountPercent}%
          </span>
        )}

        <button
          onClick={() => setIsFavorite((v) => !v)}
          aria-label="Ajouter aux favoris"
          className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-backgroundColor/90 text-textColor hover:text-accent transition-colors duration-300"
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-accent" : ""} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
        <span className="font-body text-xs text-muted">{stock.label}</span>
      </div>

      <h3 className="font-headline text-base text-textColor mb-1">{product.name}</h3>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-body text-sm text-textColor">{product.price}</span>
        {product.oldPrice && (
          <span className="font-body text-xs text-muted line-through">{product.oldPrice}</span>
        )}
      </div>

      {product.freeShipping && (
        <p className="font-body text-xs text-accent mb-4">Livraison offerte</p>
      )}

      <button
        disabled={outOfStock}
        className={`w-full font-body text-sm py-3 transition-colors duration-300 ${
          outOfStock
            ? "border border-muted/30 text-muted cursor-not-allowed"
            : "bg-accent text-[#0B0B0B] hover:opacity-90"
        }`}
      >
        {outOfStock ? "Découvrir" : "Ajouter au panier"}
      </button>
    </div>
  );
}

export default ProductCard;