import axios from 'axios';

// Customer Auth API instance
export const customerApi = axios.create({
  baseURL: 'http://localhost:8002/customers',
  withCredentials: true
});

// Product Catalog API instance
export const productApi = axios.create({
  baseURL: 'http://localhost:8002/products',
  withCredentials: true
});

// Wishlist API instance
export const wishlistApi = axios.create({
  baseURL: 'http://localhost:8002/wishlist',
  withCredentials: true
});

// Cart API instance
export const cartApi = axios.create({
  baseURL: 'http://localhost:8002/cart',
  withCredentials: true
});

// Orders API instance (Lab 06)
export const orderApi = axios.create({
  baseURL: 'http://localhost:8002/orders',
  withCredentials: true
});

export default customerApi