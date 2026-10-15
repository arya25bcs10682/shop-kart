import { Link, useNavigate, useLocation } from 'react-router-dom';
import { customerApi } from '../services/api';
import { useCart } from '../context/cartContextDefinition';

export default function Navbar({ user, onLogoutSuccess, wishlistCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await customerApi.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (onLogoutSuccess) {
        onLogoutSuccess();
      } else {
        navigate('/login');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 px-4 py-3 sm:px-8">
      <nav className="clay-card max-w-6xl mx-auto px-5 py-3 flex items-center justify-between transition-all">
        {/* Logo / Brand */}
        <div className="flex items-center gap-6">
          <Link to={user ? "/home" : "/products"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#c8a984] flex items-center justify-center text-[#26201b] shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-stone-900">
                Shop<span className="text-[#a47e53]">Kart</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold -mt-1">
                Catalogue & Store
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/products"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/products')
                  ? 'clay-btn-primary text-xs !py-1.5 !px-3.5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              Products
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/wishlist')
                  ? 'clay-btn-primary text-xs !py-1.5 !px-3.5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link connected to global CartContext */}
            <Link
              to="/cart"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/cart')
                  ? 'clay-btn-primary text-xs !py-1.5 !px-3.5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#a47e53] text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Orders Link */}
            {user && (
              <Link
                to="/orders"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/orders')
                    ? 'clay-btn-primary text-xs !py-1.5 !px-3.5'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                My Orders
              </Link>
            )}

            {user && (
              <Link
                to="/home"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/home')
                    ? 'clay-btn-primary text-xs !py-1.5 !px-3.5'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 clay-card-sm text-sm text-stone-700">
                <div className="w-6 h-6 rounded-full bg-[#f0eae0] text-[#7d5f3a] font-black flex items-center justify-center text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-semibold text-xs max-w-[120px] truncate text-stone-800">
                  {user.fullName || user.fullname}
                </span>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="clay-btn-danger px-3.5 py-1.5 text-xs text-white font-semibold cursor-pointer"
                title="Log out of your account"
              >
                <svg
                  className="w-3.5 h-3.5 mr-1 inline-block"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="clay-btn-secondary px-3.5 py-1.5 text-xs font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="clay-btn-primary px-3.5 py-1.5 text-xs font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}