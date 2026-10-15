import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import WishlistCard from '../components/WishlistCard';
import { wishlistApi, customerApi } from '../services/api';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Fetch Wishlist products (Task 3)
  useEffect(() => {
    let isMounted = true;

    async function fetchWishlist() {
      try {
        const res = await wishlistApi.get('/');
        if (isMounted) {
          if (res.data && Array.isArray(res.data.wishlist)) {
            setWishlist(res.data.wishlist);
          } else {
            setWishlist([]);
          }
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
        if (isMounted) {
          setError("We couldn't load your wishlist.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchWishlist();

    return () => {
      isMounted = false;
    };
  }, []);

  // Manual retry function for error state
  const handleRetry = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await wishlistApi.get('/');
      if (res.data && Array.isArray(res.data.wishlist)) {
        setWishlist(res.data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  // Handle removing product from wishlist (Task 4 & Task 6)
  const handleRemoveProduct = async (productId) => {
    try {
      await wishlistApi.delete(`/${productId}`);
      // Optimistically update local wishlist array without full page refresh
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error('Error removing product from wishlist:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen clay-bg flex flex-col">
      {/* Navbar with dynamic wishlist count */}
      <Navbar user={user} wishlistCount={wishlist.length} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-8">
        {/* Wishlist Header Banner */}
        <div className="clay-card p-6 sm:p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 clay-badge text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              ❤️ Saved Collection
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Your saved items are kept here so you can easily review or purchase them later.
            </p>
          </div>

          <div className="clay-card-sm px-5 py-3 text-center shrink-0">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
              Saved Items
            </span>
            <span className="text-xl font-extrabold text-stone-900">
              {loading ? '...' : `${wishlist.length} products saved`}
            </span>
          </div>
        </div>

        {/* Task 7: Loading State */}
        {loading && (
          <div className="clay-card p-12 text-center flex flex-col items-center justify-center my-8">
            <div className="w-12 h-12 rounded-2xl bg-[#f0eae0] text-[#a47e53] flex items-center justify-center mb-4 shadow-inner">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">
              Loading your wishlist...
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Retrieving your saved favourites from backend...
            </p>
          </div>
        )}

        {/* Task 7: Error State */}
        {!loading && error && (
          <div className="clay-card p-10 text-center my-8 border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">Something went wrong.</h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">{error}</p>
            <button
              onClick={handleRetry}
              className="clay-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Task 7 & Task 9: Empty Wishlist State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="clay-card p-12 text-center my-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              ❤️
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="clay-btn-primary px-6 py-2.5 text-xs font-semibold inline-block"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Task 6: Dynamic Wishlist Card Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveProduct}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
