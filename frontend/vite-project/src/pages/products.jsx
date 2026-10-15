import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { productApi, customerApi } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await customerApi.get('/me');
        if (isMounted && res.data) {
          setUser(res.data);
        }
      } catch {
        // Not logged in is okay for browsing or navbar
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products with search and category filter
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');

        const params = {};
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (selectedCategory && selectedCategory !== 'All Categories') {
          params.category = selectedCategory;
        }

        const res = await productApi.get('/', { params });

        if (isMounted) {
          if (res.data && Array.isArray(res.data.products)) {
            setProducts(res.data.products);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (isMounted) {
          setError('Something went wrong while loading products.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Debounce search slightly to avoid excessive calls
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen clay-bg flex flex-col">
      {/* Navbar */}
      <Navbar user={user} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-8">
        {/* Header Hero Banner */}
        <div className="clay-card p-6 sm:p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 clay-badge text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              ✨ Discover ShopKart
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Product Catalogue
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Browse curated items across electronics, fashion, books, and home essentials.
            </p>
          </div>

          <div className="clay-card-sm px-5 py-3 text-center shrink-0">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
              Available Items
            </span>
            <span className="text-xl font-extrabold text-stone-900">
              {loading ? '...' : products.length}
            </span>
          </div>
        </div>

        {/* Task 7: Search & Category Filter UI */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* State Handling: Loading State */}
        {loading && (
          <div className="clay-card p-12 text-center flex flex-col items-center justify-center my-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/60 text-amber-800 flex items-center justify-center mb-4">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">
              Loading products...
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Fetching catalog items from backend...
            </p>
          </div>
        )}

        {/* State Handling: Error State */}
        {!loading && error && (
          <div className="clay-card p-10 text-center my-8 border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">{error}</h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              Please check your connection or ensure backend is running.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
              }}
              className="clay-btn-secondary px-5 py-2 text-xs font-semibold"
            >
              Reset Filters & Retry
            </button>
          </div>
        )}

        {/* State Handling: Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="clay-card p-12 text-center my-8">
            <div className="w-14 h-14 rounded-3xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-stone-800">
              No products found.
            </h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              No items matched your search query or selected category.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
              }}
              className="clay-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Task 6: Dynamic Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

