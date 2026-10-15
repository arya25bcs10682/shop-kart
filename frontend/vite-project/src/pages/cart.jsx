import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/cartContextDefinition';
import { customerApi } from '../services/api';

export default function Cart() {
  const { cart, loading, error, cartCount, subtotal, refreshCart } = useCart();
  const [user, setUser] = useState(null);

  // Fetch authenticated user info for navbar
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await customerApi.get('/me');
        if (isMounted && res.data) {
          setUser(res.data);
        }
      } catch {
        // Not logged in
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(subtotal);

  return (
    <div className="min-h-screen clay-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-8">
        {/* Cart Header Banner */}
        <div className="clay-card p-6 sm:p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 clay-badge text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              🛒 Shopping Bag
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              My Cart
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Review your items and proceed to checkout whenever you are ready.
            </p>
          </div>

          <div className="clay-card-sm px-5 py-3 text-center shrink-0">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
              Total Units
            </span>
            <span className="text-xl font-extrabold text-stone-900">
              {loading ? '...' : `${cartCount} items`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="clay-card p-12 text-center flex flex-col items-center justify-center my-8">
            <div className="w-12 h-12 rounded-2xl bg-[#f0eae0] text-[#a47e53] flex items-center justify-center mb-4 shadow-inner">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">
              Loading your cart...
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Retrieving your selected products from backend...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="clay-card p-10 text-center my-8 border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">Unable to load your cart.</h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">{error}</p>
            <button
              onClick={refreshCart}
              className="clay-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cart.length === 0 && (
          <div className="clay-card p-12 text-center my-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              🛒
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              to="/products"
              className="clay-btn-primary px-6 py-2.5 text-xs font-semibold inline-block"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Active Cart Layout with Order Summary */}
        {!loading && !error && cart.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List (2 cols on large screen) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cart.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}
            </div>

            {/* Order Summary (1 col on large screen) */}
            <div className="clay-card p-6 flex flex-col gap-5 sticky top-24">
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200/60 pb-3">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Total Items</span>
                  <span className="font-semibold text-stone-800">{cartCount} units</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-700 uppercase text-xs tracking-wider">
                    Free
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200/60 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-stone-900">Total Amount</span>
                <span className="text-xl font-black text-stone-900">{formattedSubtotal}</span>
              </div>

              <Link
                to="/checkout"
                className="w-full py-3.5 px-4 clay-btn-primary text-xs sm:text-sm font-bold tracking-wide uppercase cursor-pointer text-center mt-2 flex items-center justify-center gap-2"
                title="Proceed to checkout"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                to="/products"
                className="text-xs text-center font-semibold text-stone-500 hover:text-stone-800 transition"
              >
                or Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}