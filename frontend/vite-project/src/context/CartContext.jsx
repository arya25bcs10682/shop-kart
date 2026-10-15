import { useState, useEffect, useMemo, useCallback } from 'react';
import { cartApi } from '../services/api';
import { CartContext } from './cartContextDefinition';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCart() {
      try {
        const res = await cartApi.get('/');
        if (isMounted) {
          if (res.data && Array.isArray(res.data.cart)) {
            setCart(res.data.cart);
          } else {
            setCart([]);
          }
        }
      } catch (err) {
        if (isMounted && err.response?.status !== 401) {
          console.error('Error loading cart:', err);
          setError('Unable to load your cart.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await cartApi.get('/');
      if (res.data && Array.isArray(res.data.cart)) {
        setCart(res.data.cart);
      } else {
        setCart([]);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Error loading cart:', err);
        setError('Unable to load your cart.');
      } else {
        setCart([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCartState = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * (item.quantity || 0);
    }, 0);
  }, [cart]);

  const getItemQuantity = useCallback(
    (productId) => {
      const item = cart.find(
        (i) => (i.product?._id || i.product) === productId
      );
      return item ? item.quantity : 0;
    },
    [cart]
  );

  const addToCart = useCallback(async (productId) => {
    setActionInProgress((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await cartApi.post(`/${productId}`);
      if (res.data && Array.isArray(res.data.cart)) {
        setCart(res.data.cart);
      }
      return { success: true, message: res.data?.message || 'Added to cart' };
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Failed to add product to cart';
      const status = err.response?.status;
      return { success: false, message: msg, status };
    } finally {
      setActionInProgress((prev) => ({ ...prev, [productId]: false }));
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setActionInProgress((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await cartApi.patch(`/${productId}`, { quantity });
      if (res.data && Array.isArray(res.data.cart)) {
        setCart(res.data.cart);
      }
      return { success: true, message: res.data?.message };
    } catch (err) {
      console.error('Error updating quantity:', err);
      const msg = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message: msg };
    } finally {
      setActionInProgress((prev) => ({ ...prev, [productId]: false }));
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    setActionInProgress((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await cartApi.delete(`/${productId}`);
      if (res.data && Array.isArray(res.data.cart)) {
        setCart(res.data.cart);
      } else {
        setCart((prev) =>
          prev.filter((item) => (item.product?._id || item.product) !== productId)
        );
      }
      return { success: true, message: res.data?.message };
    } catch (err) {
      console.error('Error removing from cart:', err);
      const msg = err.response?.data?.message || 'Failed to remove product from cart';
      return { success: false, message: msg };
    } finally {
      setActionInProgress((prev) => ({ ...prev, [productId]: false }));
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      cartCount,
      subtotal,
      actionInProgress,
      getItemQuantity,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
      clearCartState
    }),
    [
      cart,
      loading,
      error,
      cartCount,
      subtotal,
      actionInProgress,
      getItemQuantity,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
      clearCartState
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}