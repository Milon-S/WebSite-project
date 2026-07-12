/**
 * ============================================================
 *  app.js  —  The React Custom Hooks & Orchestrator Layer
 * ============================================================
 *  Wires the apiService (api.js) to the React application.
 *  Provides custom React hooks and action handlers that
 *  components import.
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from './api';

// Re-export createCartActions from cart.js so App.jsx can import it from here
export { createCartActions } from './cart';

// ─── Data-Fetching Hooks ─────────────────────────────────────

/**
 * useProducts(filters?)
 * Fetches the full catalogue from apiService.fetchProducts().
 * Re-fetches automatically when any filter value changes.
 */
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchProducts(JSON.parse(filterKey));
      setProducts(data);
    } catch (err) {
      console.error('[useProducts] Failed to load products:', err);
      setError('Unable to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, refetch: load };
}

/**
 * useFeaturedProducts()
 * Fetches only the products flagged as featured.
 */
export function useFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getFeaturedProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error('[useFeaturedProducts] Failed:', err);
        if (!cancelled)
          setError('Unable to load featured products. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

/**
 * useProduct(id)
 * Fetches a single product by ID.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getProductById(id);
        if (!cancelled) {
          setProduct(data);
          if (!data) setError(`Product #${id} not found.`);
        }
      } catch (err) {
        console.error(`[useProduct(${id})] Failed:`, err);
        if (!cancelled)
          setError('Unable to load product details. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading, error };
}

// ─── Shoe Details Hook ───────────────────────────────────────

/**
 * useShoeDetails(id)
 * Fetches the structured size-stock array for a footwear product
 * by calling GET /api/products/:id/sizes via apiService.getShoeDetails().
 *
 * Returns the clean sizeStock array:
 *   [ { euSize, ukSize, stock, inStock }, ... ]
 *
 * Falls back gracefully in mock mode using local PRODUCTS data.
 *
 * @param {string|number} id  - Product ID (MongoDB ObjectId string or numeric mock ID)
 */
export function useShoeDetails(id) {
  const [shoeDetails, setShoeDetails] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getShoeDetails(id);
        if (!cancelled) {
          setShoeDetails(data);
        }
      } catch (err) {
        console.error(`[useShoeDetails(${id})] Failed:`, err);
        if (!cancelled) {
          setError('Unable to load shoe size details. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  return { shoeDetails, loading, error };
}


// ─── Promo Code Actions ──────────────────────────────────────

/**
 * createPromoActions(setActivePromoCode, setPromoFeedback)
 * Returns applyPromoCode to validate codes via apiService.
 */
export function createPromoActions(setActivePromoCode, setPromoFeedback) {
  const applyPromoCode = async (code) => {
    if (!code) return;

    try {
      const result = await apiService.validatePromoCode(code);

      if (result.valid) {
        setActivePromoCode(result.code);
        localStorage.setItem('aura_promo', result.code);
        setPromoFeedback({
          text: `Promo code applied: ${result.description}`,
          type: 'success',
        });
      } else {
        setPromoFeedback({ text: 'Invalid promo code.', type: 'error' });
      }
    } catch (err) {
      console.error('[applyPromoCode] Service error:', err);
      setPromoFeedback({
        text: 'Could not validate code. Please try again.',
        type: 'error',
      });
    }
  };

  return { applyPromoCode };
}

// ─── Order Actions ───────────────────────────────────────────

/**
 * createOrderActions(deps)
 * Returns placeOrder to submit order payload.
 */
export function createOrderActions({
  cart,
  activePromoCode,
  authUser,
  setCart,
  setActivePromoCode,
  setPromoFeedback,
  onSuccess,
}) {
  const placeOrder = async (formData) => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 150 || subtotal === 0 ? 0.0 : 15.0;
    const tax = subtotal * 0.08;
    
    // In real app, we validate promo discount dynamically on client or fetch from server.
    // We will hardcode the discount calculation logic for AURA10 here matching the backend.
    const discount =
      activePromoCode === 'AURA10' && subtotal > 0 ? subtotal * 0.1 : 0;
    const total = subtotal + shipping + tax - discount;

    // If the user is logged in, ALWAYS use their account email as the canonical
    // customer email so orders appear in My Orders. Fall back to form email for guests.
    const canonicalEmail = authUser?.email || formData.email;

    // Pre-populate name from auth account if form fields are blank
    const authNameParts = authUser?.name ? authUser.name.split(' ') : [];
    const firstName = formData.firstname || authNameParts[0] || '';
    const lastName  = formData.lastname  || authNameParts.slice(1).join(' ') || '';

    const orderData = {
      customer: {
        email: canonicalEmail,
        firstName,
        lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
      items: cart.map((item) => ({
        productId: item.id, // mapped from MongoDB _id on retrieve
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        variation: item.variation,
      })),
      promoCode: activePromoCode,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      paymentIntentId: formData.paymentIntentId || '',
      isPaid: formData.paymentMethod === 'card' ? !!formData.paymentIntentId : false,
      paymentMethod: formData.paymentMethod || 'card',
    };

    try {
      const result = await apiService.createOrder(orderData);

      if (result && result.success) {
        setCart([]);
        setActivePromoCode('');
        localStorage.removeItem('aura_promo');
        setPromoFeedback({ text: '', type: '' });

        // Save order details to sessionStorage for fast/local checkout summary
        sessionStorage.setItem('aura_last_order', JSON.stringify({
          ...orderData,
          orderId: result.orderId,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'Processing'
        }));

        onSuccess(canonicalEmail, result.orderId);
        return result;
      } else {
        throw new Error(result?.message || 'Order could not be placed. Please try again.');
      }
    } catch (err) {
      console.error('[placeOrder] Order submission failed:', err);
      throw err; // Re-throw so Checkout.jsx can display the error message
    }
  };

  return { placeOrder };
}
