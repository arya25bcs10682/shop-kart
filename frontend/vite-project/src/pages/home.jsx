import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { customerApi, productApi } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [meRes, prodRes] = await Promise.allSettled([
          customerApi.get('/me'),
          productApi.get('/')
        ]);

        if (isMounted) {
          if (meRes.status === 'fulfilled' && meRes.value?.data) {
            setUser(meRes.value.data);
          } else {
            navigate('/login', { replace: true });
            return;
          }

          if (prodRes.status === 'fulfilled' && prodRes.value?.data?.products) {
            setFeaturedProducts(prodRes.value.data.products.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
        if (isMounted) {
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogoutSuccess = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen clay-bg flex flex-col items-center justify-center p-4">
        <div className="clay-card p-8 flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/60 text-amber-800 flex items-center justify-center">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-800">Authenticating...</h3>
            <p className="text-xs text-stone-500 mt-1">Verifying your secure session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.fullName || user.fullname || 'Valued Customer';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
        day: 'numeric'
      })
    : 'Recently';

  return (
    <div className="min-h-screen clay-bg flex flex-col">
      {/* Navbar with Logout */}
      <Navbar user={user} onLogoutSuccess={handleLogoutSuccess} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-8">
        {/* Welcome Hero Card */}
        <section className="clay-card p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 clay-badge text-xs font-semibold text-emerald-700 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Secure Session
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Welcome back, <span className="text-[#a47e53]">{displayName}</span>! 👋
              </h1>
              <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl">
                Ready to shop? Our newly launched product catalogue is now live. Explore electronics, fashion, books, and home essentials.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <Link
                  to="/products"
                  className="clay-btn-primary px-5 py-2.5 text-xs font-bold"
                >
                  🛒 Explore Product Catalog
                </Link>
              </div>
            </div>

            {/* Quick Action Pill */}
            <div className="clay-card-sm p-4 text-center min-w-[160px]">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-1">
                Account Status
              </span>
              <span className="text-sm font-bold text-emerald-700">
                Verified Customer
              </span>
            </div>
          </div>
        </section>

        {/* Customer Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Full Name */}
          <div className="clay-card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ede6dc] text-[#7d5f3a] flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Customer Name
              </p>
              <h2 className="text-lg font-bold text-stone-900 break-words">
                {displayName}
              </h2>
              <span className="text-[11px] text-stone-400">Primary Account Holder</span>
            </div>
          </div>

          {/* Card 2: Email */}
          <div className="clay-card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ede6dc] text-[#7d5f3a] flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Email Address
              </p>
              <h2 className="text-lg font-bold text-stone-900 break-all">
                {user.email}
              </h2>
              <span className="text-[11px] text-stone-400">Linked to authentication</span>
            </div>
          </div>

          {/* Card 3: Phone */}
          <div className="clay-card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ede6dc] text-[#7d5f3a] flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Phone Number
              </p>
              <h2 className="text-lg font-bold text-stone-900">
                {user.phone || 'Not provided'}
              </h2>
              <span className="text-[11px] text-stone-400">Order notifications</span>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-stone-900">
                Trending In Catalog
              </h3>
              <Link
                to="/products"
                className="text-xs font-bold text-[#a47e53] hover:underline"
              >
                View All Catalog →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Account Summary Strip */}
        <div className="clay-card-inset p-4 rounded-2xl flex items-center justify-between text-xs text-stone-600">
          <span>Member registered since: <strong className="text-stone-800">{memberSince}</strong></span>
          <span className="font-mono text-stone-400">ID: {user._id ? user._id.slice(-6) : 'N/A'}</span>
        </div>
      </main>
    </div>
  );
}
