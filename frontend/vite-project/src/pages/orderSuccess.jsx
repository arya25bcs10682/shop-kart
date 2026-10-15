import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { orderApi, customerApi } from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const userRes = await customerApi.get('/me');
        if (isMounted && userRes.data) {
          setUser(userRes.data);
        }
      } catch {
        // Guest / unauthenticated
      }

      try {
        const orderRes = await orderApi.get(`/${id}`);
        if (isMounted && orderRes.data?.order) {
          setOrder(orderRes.data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to retrieve order details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formattedTotal = order
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(order.totalAmount)
    : '';

  return (
    <div className="min-h-screen clay-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:px-8">
        {loading ? (
          <div className="clay-card p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f0eae0] text-[#a47e53] flex items-center justify-center mb-4">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">
              Retrieving Order Confirmation...
            </h3>
          </div>
        ) : error ? (
          <div className="clay-card p-10 text-center border-red-200">
            <h3 className="text-base font-bold text-red-600 mb-2">Error Loading Order</h3>
            <p className="text-xs text-stone-500 mb-6">{error}</p>
            <Link to="/products" className="clay-btn-primary px-5 py-2.5 text-xs font-semibold">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="clay-card p-8 sm:p-10 text-center">
            {/* Green Success Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              ✓
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mb-6">
              Thank you for shopping with ShopKart. Your payment has been verified and confirmed.
            </p>

            {/* Order Details Card */}
            <div className="clay-card-inset p-5 sm:p-6 text-left mb-8 max-w-xl mx-auto">
              <div className="flex justify-between items-center border-b border-stone-200/60 pb-3 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Order Reference ID
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-stone-800 font-mono">
                    #{order?._id}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 tracking-wider uppercase">
                  {order?.status}
                </span>
              </div>

              {/* Items Purchased */}
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider mb-2">
                  Items Purchased ({order?.items?.length})
                </span>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {order?.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-800">
                        {item.name} <span className="text-stone-400">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-stone-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Snapshot */}
              {order?.shippingAddress && (
                <div className="border-t border-stone-200/60 pt-3 mb-4 text-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider mb-1">
                    Deliver To
                  </span>
                  <p className="font-semibold text-stone-800">
                    {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                  </p>
                  <p className="text-stone-600">
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-stone-200/60 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Total Paid</span>
                <span className="text-lg font-black text-stone-900">{formattedTotal}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/orders"
                className="w-full sm:w-auto px-6 py-3 clay-btn-primary text-xs font-bold uppercase tracking-wider text-center"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto px-6 py-3 clay-btn-secondary text-xs font-bold uppercase tracking-wider text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}