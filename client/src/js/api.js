/**
 * ============================================================
 *  api.js  —  The API/Data Client (Service Architecture)
 * ============================================================
 *  Performs fetch() operations against the backend API.
 *  Includes a `USE_MOCK` toggle to run entirely on frontend mock data
 *  without requiring the backend server or MongoDB to be running.
 * ============================================================
 */

import { PRODUCTS } from '../data/products';

// ─── TOGGLE MOCK MODE HERE ───────────────────────────────────
// Set to true to view the app with mock data (No Database / Server needed)
// Set to false to connect to your Node.js + Express + MongoDB backend
const USE_MOCK = false; 

const BASE_URL = '/api';
const MOCK_DELAY = 300;

// Helper to simulate network latency in mock mode
const simulateDelay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY));

// Mock promo codes data
const _MOCK_PROMO_CODES = {
  AURA10: { discountPercent: 10, description: '10% off your order' },
  SAVE20: { discountPercent: 20, description: '20% off your order' },
};

export const apiService = {
  /**
   * fetchProducts(filters)
   * Fetch all products matching query filters.
   */
  async fetchProducts(filters = {}) {
    if (USE_MOCK) {
      let data = PRODUCTS.map((p) => ({ ...p }));

      // Category filter
      if (filters.category && filters.category !== 'all') {
        data = data.filter((p) => p.category === filters.category);
      }

      // Max price filter
      if (filters.maxPrice) {
        data = data.filter((p) => p.price <= filters.maxPrice);
      }

      // Search query filter
      if (filters.q && filters.q.trim() !== '') {
        const query = filters.q.toLowerCase().trim();
        data = data.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
      }

      // Sorting
      if (filters.sort) {
        if (filters.sort === 'price-asc') {
          data.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price-desc') {
          data.sort((a, b) => b.price - a.price);
        } else if (filters.sort === 'rating') {
          data.sort((a, b) => b.rating - a.rating);
        }
      }

      return simulateDelay(data);
    }

    // Real API Call
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }
    if (filters.sort) {
      params.append('sort', filters.sort);
    }
    if (filters.q) {
      // 'keyword' is the updated param name — also pass as 'q' for backward compat
      params.append('keyword', filters.q);
    }
    if (filters.featured) {
      params.append('featured', filters.featured);
    }

    const response = await fetch(`${BASE_URL}/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`fetchProducts failed: ${response.statusText}`);
    }

    // The updated backend returns { products, page, pages, total }.
    // Extract just the products array for the existing UI hooks.
    const data = await response.json();
    return Array.isArray(data) ? data : (data.products ?? data);
  },

  /**
   * getProductById(id)
   * Fetch a single product by ID.
   */
  async getProductById(id) {
    if (!id) return null;

    if (USE_MOCK) {
      // Find by numeric ID or string representation
      const product = PRODUCTS.find((p) => String(p.id) === String(id)) ?? null;
      return simulateDelay(product ? { ...product } : null);
    }

    // Real API Call
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`getProductById(${id}) failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * getFeaturedProducts()
   * Fetch featured products.
   */
  async getFeaturedProducts() {
    if (USE_MOCK) {
      const featured = PRODUCTS.filter((p) => p.featured).map((p) => ({ ...p }));
      return simulateDelay(featured);
    }

    // Real API Call
    const response = await fetch(`${BASE_URL}/products?featured=true`);
    if (!response.ok) {
      throw new Error(`getFeaturedProducts failed: ${response.statusText}`);
    }
    // Extract the products array from the paginated response
    const featuredData = await response.json();
    return Array.isArray(featuredData) ? featuredData : (featuredData.products ?? featuredData);
  },

  /**
   * validatePromoCode(code)
   * Validates a coupon code via POST.
   */
  async validatePromoCode(code) {
    if (USE_MOCK) {
      const upperCode = String(code).trim().toUpperCase();
      const promo = _MOCK_PROMO_CODES[upperCode];
      if (promo) {
        return simulateDelay({ valid: true, code: upperCode, ...promo });
      }
      return simulateDelay({
        valid: false,
        code: upperCode,
        discountPercent: 0,
        description: '',
      });
    }

    // Real API Call
    const response = await fetch(`${BASE_URL}/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      throw new Error(`validatePromoCode failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * createOrder(orderData)
   * Submit custom customer and items payload to place an order.
   */
  async createOrder(orderData) {
    if (USE_MOCK) {
      console.info('[apiService] createOrder (Mock Mode) →', orderData);
      const mockOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, '0')}`;
      
      const newMockOrder = {
        ...orderData,
        orderId: mockOrderId,
        _id: mockOrderId,
        status: 'Processing',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      try {
        const existing = JSON.parse(localStorage.getItem('aura_mock_orders') || '[]');
        existing.push(newMockOrder);
        localStorage.setItem('aura_mock_orders', JSON.stringify(existing));
      } catch (e) {
        console.error('Failed to save mock order to localStorage', e);
      }

      return simulateDelay({
        success: true,
        orderId: mockOrderId,
        message: `Order ${mockOrderId} placed successfully!`,
        order: newMockOrder,
      });
    }

    // Real API Call
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.message || `createOrder failed: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * getOrderById(orderId)
   * Fetch placed order by ID for order success screen or status check.
   */
  async getOrderById(orderId) {
    if (USE_MOCK) {
      const mockOrder = {
        orderId,
        status: 'Processing',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };
      return simulateDelay(mockOrder);
    }

    // Real API Call
    const response = await fetch(`${BASE_URL}/orders/${orderId}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`getOrderById(${orderId}) failed: ${response.statusText}`);
    }
    return response.json();
  },


  /**
   * getMyOrders(email)
   * Fetch all orders placed by the current user.
   */
  async getMyOrders(email) {
    if (USE_MOCK) {
      try {
        const existing = JSON.parse(localStorage.getItem('aura_mock_orders') || '[]');
        const userOrders = existing.filter(
          (o) => o.customer?.email?.toLowerCase() === email?.toLowerCase()
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return simulateDelay(userOrders);
      } catch (e) {
        return simulateDelay([]);
      }
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const response = await fetch(`${BASE_URL}/orders/myorders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `getMyOrders failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * getShoeDetails(id)
   * Fetch the size-stock mapping for a single footwear product.
   * @route  GET /api/products/:id/sizes   (live backend)
   * @returns {Promise<object>} Shape:
   *   {
   *     productId, title, category,
   *     soleMaterial, upperMaterial,
   *     sizeStock: [{ euSize, ukSize, stock, inStock }, ...]
   *   }
   *
   * Mock mode builds the same shape from the local PRODUCTS data
   * so the component can render identically without a running backend.
   */
  async getShoeDetails(id) {
    if (!id) return null;

    if (USE_MOCK) {
      // Find the product by numeric or string ID in mock data
      const product = PRODUCTS.find((p) => String(p.id) === String(id));
      if (!product || product.category !== 'footwear') return null;

      const rawMap   = product.stockBySize || {};
      const ukArr    = product.ukSizes     || [];

      // Build sorted sizeStock array matching the live API shape
      const sizeStock = Object.keys(rawMap)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .map((euSize, idx) => {
          const qty = rawMap[euSize];
          return {
            euSize,                            // e.g. "41"
            ukSize: ukArr[idx] ?? null,        // e.g. 7
            stock:   qty,                       // exact quantity
            inStock: qty > 0,                  // boolean shortcut
          };
        });

      return simulateDelay({
        productId:     product.id,
        title:         product.title,
        category:      product.category,
        soleMaterial:  product.soleMaterial  || '',
        upperMaterial: product.upperMaterial || '',
        sizeStock,
      });
    }

    // Live backend: GET /api/products/:id/sizes
    const response = await fetch(`${BASE_URL}/products/${id}/sizes`);
    if (response.status === 404 || response.status === 400) return null;
    if (!response.ok) {
      throw new Error(`getShoeDetails(${id}) failed: ${response.statusText}`);
    }
    return response.json();
  },
};
export { USE_MOCK };

// ============================================================
//  Auth & Admin API Functions
//  Standalone named exports — these are the functions described
//  in the user's spec. They operate independently of apiService.
// ============================================================

const TOKEN_KEY = 'aura_auth_token';
const USER_KEY  = 'aura_auth_user';

/**
 * getAuthToken()
 * Retrieves the JWT from localStorage.
 */
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * getCurrentUser()
 * Returns the saved user object from localStorage (parsed JSON).
 * Shape: { _id, name, email, isAdmin }
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Internal helper — persists auth data after login/register */
const _persistAuth = (data) => {
  if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
  // Save user profile separately (no token) for UI reads
  const { token: _t, ...user } = data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * loginUser(email, password)
 * POST /api/users/login
 * Saves JWT + user profile to localStorage.
 * Returns the full user payload (including token).
 */
export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Login failed: ${response.statusText}`);

  _persistAuth(data);
  return data; // { _id, name, email, isAdmin, token }
}

/**
 * registerUser(name, email, password)
 * POST /api/users
 * Saves JWT + user profile to localStorage.
 * Returns the full user payload (including token).
 */
export async function registerUser(name, email, password) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Registration failed: ${response.statusText}`);

  _persistAuth(data);
  return data; // { _id, name, email, isAdmin, token }
}

/**
 * fetchProducts(searchQuery, page)
 * GET /api/products?keyword=<searchQuery>&page=<page>
 * Supports keyword search and pagination (8 products per page).
 * Returns { products, page, pages, total }.
 */
export async function fetchProducts(searchQuery = '', page = 1) {
  const params = new URLSearchParams();

  if (searchQuery && searchQuery.trim() !== '') {
    params.append('keyword', searchQuery.trim());
  }
  params.append('page', String(page));

  const response = await fetch(`${BASE_URL}/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`fetchProducts failed: ${response.statusText}`);
  }

  return response.json(); // { products, page, pages, total }
}

/**
 * addProduct(productData)
 * POST /api/products
 * Admin-only endpoint. Automatically retrieves the JWT from
 * localStorage and attaches it as Authorization: Bearer <token>.
 * Returns the newly created product document.
 */
export async function addProduct(productData) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No auth token found. Please log in as an admin.');
  }

  const response = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `addProduct failed: ${response.statusText}`);
  }

  return data; // The created product document
}

/**
 * addProductReview(productId, { rating, comment })
 * POST /api/products/:id/reviews
 * Logged-in users only. Attaches Authorization header automatically.
 */
export async function addProductReview(productId, { rating, comment }) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No auth token found. Please log in to leave a review.');
  }

  const response = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `addProductReview failed: ${response.statusText}`);
  }

  return data;
}

/**
 * logoutUser()
 * Removes the JWT + user from localStorage, effectively logging the user out.
 */
export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Admin Product Functions ───────────────────────────────────

/** Internal helper to build auth headers */
const _authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
});

/**
 * getAdminProducts()
 * GET /api/products?limit=100 — fetches all products for the admin table.
 */
export async function getAdminProducts() {
  const response = await fetch(`${BASE_URL}/products?limit=100`);
  if (!response.ok) throw new Error('Failed to fetch products');
  const data = await response.json();
  return Array.isArray(data) ? data : (data.products ?? data);
}

/**
 * updateProduct(id, productData)
 * PUT /api/products/:id — admin only, auto-attaches Bearer token.
 */
export async function updateProduct(id, productData) {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: _authHeaders(),
    body: JSON.stringify(productData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Update failed');
  return data;
}

/**
 * deleteProduct(id)
 * DELETE /api/products/:id — admin only, auto-attaches Bearer token.
 */
export async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: _authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Delete failed');
  return data;
}

/**
 * getAdminOrders()
 * GET /api/orders — fetches recent orders for the admin dashboard.
 * Note: This is a public endpoint in the current backend — secured by admin guard on frontend.
 */
export async function getAdminOrders() {
  const response = await fetch(`${BASE_URL}/orders`, { headers: _authHeaders() });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * updateOrderStatus(id, status)
 * PUT /api/orders/:id/status — admin only, updates status of an order.
 */
export async function updateOrderStatus(id, status) {
  const response = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: _authHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update order status');
  return data;
}

/**
 * getPromoCodes()
 * GET /api/promo — admin only, fetches all promo codes in database.
 */
export async function getPromoCodes() {
  const response = await fetch(`${BASE_URL}/promo`, { headers: _authHeaders() });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * createPromoCode(promoData)
 * POST /api/promo — admin only, creates a new promo code.
 */
export async function createPromoCode(promoData) {
  const response = await fetch(`${BASE_URL}/promo`, {
    method: 'POST',
    headers: _authHeaders(),
    body: JSON.stringify(promoData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create promo code');
  return data;
}

/**
 * updatePromoCode(id, promoData)
 * PUT /api/promo/:id — admin only, updates an existing promo code.
 */
export async function updatePromoCode(id, promoData) {
  const response = await fetch(`${BASE_URL}/promo/${id}`, {
    method: 'PUT',
    headers: _authHeaders(),
    body: JSON.stringify(promoData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update promo code');
  return data;
}

/**
 * deletePromoCode(id)
 * DELETE /api/promo/:id — admin only, deletes a promo code.
 */
export async function deletePromoCode(id) {
  const response = await fetch(`${BASE_URL}/promo/${id}`, {
    method: 'DELETE',
    headers: _authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete promo code');
  return data;
}
