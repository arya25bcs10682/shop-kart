import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { productApi, customerApi } from '../services/api';
import { useCart } from '../context/cartContextDefinition';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, actionInProgress } = useCart();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check auth user optionally for navbar
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await customerApi.get('/me');
        if (isMounted && res.data) {
          setUser(res.data);
        }
      } catch {
        // Unauthenticated visitor is allowed to view products
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch product by ID
  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError('');

        const res = await productApi.get(`/${id}`);
        if (isMounted) {
          if (res.data?.product) {
            setProduct(res.data.product);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (isMounted) {
          const msg =
            err.response?.status === 404
              ? 'Product not found'
              : 'Failed to load product details';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    setErrorMessage('');
    const result = await addToCart(product._id);

    if (result.success) {
      setAddedNotice(true);
      setTimeout(() => {
        setAddedNotice(false);
      }, 2500);
    } else {
      if (result.status === 401) {
        setErrorMessage('Please log in to add items to your cart');
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

  const formattedPrice = product
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(product.price)
    : '';

  const isOutOfStock = product ? product.stock <= 0 : false;
  const inCartQty = product ? getItemQuantity(product._id) : 0;
  const isAddingToCart = product ? Boolean(actionInProgress[product._id]) : false;
  const isStockLimitReached = product ? inCartQty >= product.stock : false;

  return (
    <div className="min-h-screen clay-bg flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-8">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products Catalogue
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="clay-card p-12 text-center flex flex-col items-center justify-center my-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/60 text-amber-800 flex items-center justify-center mb-4">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">
              Loading product details...
            </h3>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="clay-card p-10 text-center my-8">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-800">{error}</h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              The product you are looking for does not exist or was removed.
            </p>
            <Link to="/products" className="clay-btn-primary px-5 py-2.5 text-xs font-semibold">
              Browse All Products
            </Link>
          </div>
        )}

        {/* Product Details Layout */}
        {!loading && !error && product && (
          <div className="clay-card p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Product Large Image */}
              <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-stone-100 shadow-inner flex items-center justify-center relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute top-4 left-4 px-3 py-1 clay-badge text-xs font-bold text-stone-700 uppercase tracking-wider backdrop-blur-sm bg-white/95">
                  {product.category}
                </span>
              </div>

              {/* Product Meta & Description */}
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Category: <span className="text-stone-800 font-bold">{product.category}</span>
                    </span>
                    <span className="text-stone-300">•</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isOutOfStock ? 'Out of stock' : `${product.stock} units available`}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
                    {product.name}
                  </h1>

                  <div className="mb-6">
                    <span className="text-3xl font-black text-stone-900">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-stone-500 ml-2">inclusive of all taxes</span>
                  </div>

                  {/* Description Box */}
                  <div className="clay-card-inset p-5 mb-6 text-sm text-stone-700 leading-relaxed">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Product Description
                    </h4>
                    <p>{product.description}</p>
                  </div>
                </div>

                {/* Add to Cart Section */}
                <div>
                  {addedNotice && (
                    <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Added to your cart! Total in cart: {inCartQty}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      id="add-to-cart-btn"
                      type="button"
                      disabled={isOutOfStock || isAddingToCart || isStockLimitReached}
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 px-6 clay-btn-primary text-sm font-bold tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {isAddingToCart
                        ? 'Adding to Cart...'
                        : isOutOfStock
                        ? 'Sold Out'
                        : isStockLimitReached
                        ? 'Max Stock in Cart'
                        : inCartQty > 0
                        ? `Add Another (In Cart: ${inCartQty})`
                        : 'Add to Cart'}
                    </button>

                    <Link
                      to="/cart"
                      className="py-3.5 px-5 clay-btn-secondary text-sm font-semibold text-center flex items-center justify-center gap-2"
                    >
                      View Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}