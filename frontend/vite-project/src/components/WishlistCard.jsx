import { useState } from "react";
import { Link } from "react-router-dom";

export default function WishlistCard({ product, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  // Format price in INR (₹)
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleRemoveClick = async (e) => {
    e.preventDefault();
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove(_id);
    } catch (err) {
      console.error("Failed to remove item:", err);
      setIsRemoving(false);
    }
  };

  return (
    <div className="clay-card p-5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200 relative">
      {/* Product Image */}
      <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-stone-100 flex items-center justify-center relative shadow-inner">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
          }}
        />

        {/* Category Pill Tag */}
        <span className="absolute top-3 left-3 px-2.5 py-1 clay-badge text-[11px] font-semibold text-stone-700 uppercase tracking-wider backdrop-blur-sm bg-white/90">
          {category}
        </span>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-base font-bold text-stone-900 tracking-tight line-clamp-1 mb-1">
          {name}
        </h3>

        {/* Price & Stock status */}
        <div className="flex items-baseline justify-between mt-1 mb-3">
          <span className="text-lg font-extrabold text-stone-900">
            {formattedPrice}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isOutOfStock
                ? "bg-red-100 text-red-700"
                : isLowStock
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isOutOfStock ? "Out of stock" : `${stock} units left`}
          </span>
        </div>
      </div>

      {/* Action Buttons: View Details & Remove */}
      <div className="pt-3 border-t border-stone-200/60 mt-auto grid grid-cols-2 gap-2">
        <Link
          to={`/products/${_id}`}
          className="w-full py-2 px-3 clay-btn-secondary text-xs font-semibold text-center truncate flex items-center justify-center"
        >
          View Details
        </Link>
        <button
          type="button"
          onClick={handleRemoveClick}
          disabled={isRemoving}
          className="w-full py-2 px-3 clay-btn-danger text-xs font-semibold text-white text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          {isRemoving ? (
            <span>Removing...</span>
          ) : (
            <>
              <span>Remove</span>
              <span className="text-sm">♥</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
