import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistApi } from '../services/api';
import { useCart } from '../context/cartContextDefinition';

export default function ProductCard({
  product,
  isInitiallyWishlisted = false,
  onWishlistChange
}) {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, actionInProgress } = useCart();
  const [wishlistState, setWishlistState] = useState(
    isInitiallyWishlisted ? 'saved' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [cartSuccessNotice, setCartSuccessNotice] = useState(false);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const inCartQty = getItemQuantity(_id);
  const isAddingToCart = Boolean(actionInProgress[_id]);
  const isStockLimitReached = inCartQty >= stock;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistState === 'saving') return;

    setWishlistState('saving');
    setErrorMessage('');

    try {
      if (wishlistState === 'saved') {
        await wishlistApi.delete(`/${_id}`);
        setWishlistState('idle');
        if (onWishlistChange) onWishlistChange(_id, false);
      } 
      else {
        await wishlistApi.post(`/${_id}`);
        setWishlistState('saved');
        if (onWishlistChange) onWishlistChange(_id, true);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setErrorMessage('Sign in to save items');
        setWishlistState('error');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Please log in to save items to your wishlist' }
          });
        }, 1200);
      } else if (status === 409) {
        setWishlistState('saved');
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Unable to save. Please try again.'
        );
        setWishlistState('error');
        setTimeout(() => setWishlistState('idle'), 2500);
      }
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || isOutOfStock || isStockLimitReached) return;

    setErrorMessage('');
    const result = await addToCart(_id);

    if (result.success) {
      setCartSuccessNotice(true);
      setTimeout(() => setCartSuccessNotice(false), 2000);
    } else {
      if (result.status === 401) {
        setErrorMessage('Sign in to add to cart');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Please log in to add items to your cart' }
          });
        }, 1200);
      } else {
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  return (
    <div className="clay-card p-5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200 relative">
      {/* Product Image Frame */}
      <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-stone-100 flex items-center justify-center relative shadow-inner">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category Pill Tag */}
        <span className="absolute top-3 left-3 px-2.5 py-1 clay-badge text-[11px] font-semibold text-stone-700 uppercase tracking-wider backdrop-blur-sm bg-white/90">
          {category}
        </span>

        {/* Top-Right Quick Heart Action */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={wishlistState === 'saving'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            wishlistState === 'saved'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/90 text-stone-600 hover:text-rose-500 shadow-sm'
          }`}
          title={
            wishlistState === 'saved'
              ? 'Remove from Wishlist'
              : 'Add to Wishlist'
          }
        >
          {wishlistState === 'saving' ? (
            <svg className="animate-spin w-4 h-4 text-stone-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : wishlistState === 'saved' ? (
            <span className="text-sm">♥</span>
          ) : (
            <span className="text-sm">♡</span>
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-base font-bold text-stone-900 tracking-tight line-clamp-1 mb-1">
          {name}
        </h3>

        {/* Price & Stock Status */}
        <div className="flex items-baseline justify-between mt-1 mb-3">
          <span className="text-lg font-extrabold text-stone-900">
            {formattedPrice}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isOutOfStock
                ? 'bg-red-100 text-red-700'
                : isLowStock
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : `${stock} units left`}
          </span>
        </div>

        {/* Messages / Notifications */}
        {cartSuccessNotice && (
          <p className="text-[11px] font-semibold text-emerald-600 mb-2 flex items-center gap-1">
            <span>✓</span> In Cart ({inCartQty})
          </p>
        )}

        {errorMessage && (
          <p className="text-[11px] font-semibold text-rose-600 mb-2">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Actions: View Details and Add to Cart */}
      <div className="pt-3 border-t border-stone-200/60 mt-auto flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/products/${_id}`}
            className="w-full py-2 px-3 clay-btn-secondary text-xs font-semibold text-center truncate flex items-center justify-center"
          >
            View Details
          </Link>

          {/* Task 7: Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || isOutOfStock || isStockLimitReached}
            className={`w-full py-2 px-3 text-xs font-semibold text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              inCartQty > 0
                ? 'clay-btn-primary !bg-[#d39e82] text-white'
                : 'clay-btn-primary'
            }`}
            title={
              isStockLimitReached
                ? 'Maximum stock reached in cart'
                : 'Add to Shopping Cart'
            }
          >
            {isAddingToCart ? (
              <span>⏳ Adding...</span>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : isStockLimitReached ? (
              <span>Max Stock</span>
            ) : inCartQty > 0 ? (
              <span>Add Another (+1)</span>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}  