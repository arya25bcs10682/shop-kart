import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { orderApi, customerApi } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check auth user
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const userRes = await customerApi.get('/me');
        if (isMounted && userRes.data) {
          setUser(userRes.data);
        }
      } catch {
        // Not logged in
      }

      try {
        setLoading(true);
        setError('');
        const res = await orderApi.get('/');
        if (isMounted) {
          if (res.data && Array.isArray(res.data.orders)) {
            setOrders(res.data.orders);
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to load your orders.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen clay-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-8">
        {/* Banner */}
        <div className="clay-card p-6 sm:p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 clay-badge text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              📜 Purchase History
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Review your previous transactions and tracking status.
            </p>
          </div>

          <div className="clay-card-sm px-5 py-3 text-center shrink-0">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
              Completed Orders
            </span>
            <span className="text-xl font-extrabold text-stone-900">
              {loading ? '...' : orders.length}
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
              Loading your orders...
            </h3>
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
            <h3 className="text-base font-bold text-stone-800">Something went wrong.</h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="clay-card p-12 text-center my-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              📦
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">
              You have not placed any orders yet.
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              When you purchase items, your orders will appear here.
            </p>
            <Link
              to="/products"
              className="clay-btn-primary px-6 py-2.5 text-xs font-semibold inline-block"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-6">
            {orders.map((ord) => (
              <div key={ord._id} className="clay-card p-6 flex flex-col gap-4">
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-stone-800">
                      Order #{ord._id.slice(-8)}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500 font-medium">
                      {formatDate(ord.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'CONFIRMED' || ord.status === 'PLACED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                      {ord.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ord.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="clay-card-sm p-3 flex items-center gap-3 bg-white/60"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-inner"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-stone-800 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-stone-500 block">
                          ₹{item.price} × {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/60 mt-1">
                  <div className="text-xs text-stone-500">
                    Deliver to:{' '}
                    <span className="font-semibold text-stone-800">
                      {ord.shippingAddress?.fullName} ({ord.shippingAddress?.city},{' '}
                      {ord.shippingAddress?.pincode})
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Total Amount
                      </span>
                      <span className="text-base font-black text-stone-900">
                        {formatPrice(ord.totalAmount)}
                      </span>
                    </div>

                    <Link
                      to={`/order-success/${ord._id}`}
                      className="clay-btn-secondary px-3.5 py-1.5 text-xs font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}