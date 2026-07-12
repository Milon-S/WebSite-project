import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Shop from './components/Shop';
import ProductDetails from './components/ProductDetails';
import Checkout from './components/Checkout';

// Initialize Stripe outside component render to avoid recreation
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51Ts4V1Rp7u2uDF2HPcgQvYSae6RhOCB8FaTEB4uLqfHxJuLlnxpemSI7YFkLZHOE8myEqxAAjWJ2koREXm8y1OOz00CEzTqA7h'
);
import CartDrawer from './components/CartDrawer';
import OrderSuccess from './components/OrderSuccess';
import MyOrders from './components/MyOrders';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
// ─── Service Layer ────────────────────────────────────────────────
import {
  useProducts,
  createCartActions,
  createPromoActions,
  createOrderActions,
} from './js/app';
import { getCurrentUser, logoutUser } from './js/api';

export default function App() {
  // ── Auth State — initialized from localStorage ──────────────────────
  const [authUser, setAuthUser]     = useState(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab]       = useState('login');

  const handleAuthSuccess = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    setAuthUser(null);
    // If on admin panel, redirect home
    if (window.location.hash === '#admin') window.location.hash = '#home';
  };

  const handleLoginClick = () => {
    setAuthTab('login');
    setIsAuthOpen(true);
  };

  // ── Load all products from the service ────────────────────────
  // When the backend is live, useProducts() calls GET /api/products.
  // The UI shows a loading state automatically during the async fetch.
  const { products: allProducts, loading: productsLoading, refetch: refetchProducts } = useProducts();
  // --- States ---
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activePromoCode, setActivePromoCode] = useState(() => {
    return localStorage.getItem('aura_promo') || '';
  });

  const [promoFeedback, setPromoFeedback] = useState({ text: '', type: '' });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('aura_theme');
    return saved === 'dark';
  });

  const [searchQuery, setSearchQuery]     = useState('');
  const [activeRoute, setActiveRoute]     = useState('#home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [maxPrice, setMaxPrice]           = useState(1500);
  const [sort, setSort]                   = useState('featured');
  const [activeProductId, setActiveProductId] = useState(null);

  const [isCartOpen, setIsCartOpen]         = useState(false);

  // --- Sync local storage on cart change ---
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Theme Syncing ---
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('aura_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('aura_theme', 'light');
    }
  }, [isDarkMode]);

  // --- Router / Hash Parsing ---
  const parseQueryParams = (queryString) => {
    const params = {};
    if (!queryString) return params;
    const pairs = queryString.split('&');
    for (let pair of pairs) {
      if (!pair) continue;
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return params;
  };

  const handleRouteChange = () => {
    const rawHash = window.location.hash || '#home';
    const hashParts = rawHash.split('?');
    const route = hashParts[0];
    const queryParams = parseQueryParams(hashParts[1] || '');

    setActiveRoute(route);
    setIsCartOpen(false); // Close cart drawer on route change

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (route === '#products') {
      if (queryParams.category) {
        setActiveCategory(queryParams.category);
      } else {
        setActiveCategory('all');
      }

      if (queryParams.maxprice) {
        setMaxPrice(parseFloat(queryParams.maxprice));
      } else {
        setMaxPrice(1500);
      }

      if (queryParams.sort) {
        setSort(queryParams.sort);
      } else {
        setSort('featured');
      }

      if (queryParams.q) {
        setSearchQuery(queryParams.q);
      } else {
        setSearchQuery('');
      }
    } else if (route === '#product-details') {
      if (queryParams.id) {
        setActiveProductId(queryParams.id);
      }
    } else if (route === '#admin') {
      // Guard: redirect non-admins away from admin route
      const user = getCurrentUser();
      if (!user || !user.isAdmin) {
        window.location.hash = '#home';
      }
    }
  };

  useEffect(() => {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange(); // Trigger initial routing

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const updateFilters = (newParams) => {
    const rawHash = window.location.hash || '#products';
    const hashParts = rawHash.split('?');
    const currentParams = parseQueryParams(hashParts[1] || '');

    const merged = { ...currentParams, ...newParams };

    // Clean up empty parameters
    if (merged.category === 'all' || !merged.category) delete merged.category;
    if (parseFloat(merged.maxprice) >= 1500 || !merged.maxprice) delete merged.maxprice;
    if (merged.sort === 'featured' || !merged.sort) delete merged.sort;
    if (merged.q === '' || !merged.q) delete merged.q;

    const query = Object.keys(merged)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(merged[k])}`)
      .join('&');

    window.location.hash = `#products${query ? '?' + query : ''}`;
  };

  // --- Cart Actions (via service layer) ---
  // createCartActions returns pure handlers that operate on cart state.
  // They use `allProducts` from the service — not the old static PRODUCTS array.
  const { addToCart, addToCartDirect, adjustQty, removeItem } = createCartActions(
    cart,
    setCart,
    allProducts
  );

  const handleAddToCart = (productId, quantity = 1, variation = '') => {
    addToCart(productId, quantity, variation);
    setIsCartOpen(true);
  };

  const handleAddToCartDirect = (productId) => {
    addToCartDirect(productId);
    setIsCartOpen(true);
  };

  const handleAdjustCartQty = (index, change) => adjustQty(index, change);
  const handleRemoveCartItem = (index) => removeItem(index);

  const handleQuickView = (productId) => {
    window.location.hash = `#product-details?id=${productId}`;
  };

  // --- Promo Code Actions (via service layer) ---
  // createPromoActions calls apiService.validatePromoCode() internally.
  // When backend is live, this becomes a real POST /api/promo/validate call.
  const { applyPromoCode: handleApplyPromoCode } = createPromoActions(
    setActivePromoCode,
    setPromoFeedback
  );

  // --- Order Placement Actions (via service layer) ---
  // createOrderActions calls apiService.createOrder() internally.
  // When backend is live, this persists to MongoDB via POST /api/orders.
  const { placeOrder } = createOrderActions({
    cart,
    activePromoCode,
    authUser,
    setCart,
    setActivePromoCode,
    setPromoFeedback,
    onSuccess: (email, orderId) => {
      console.info(`[App] Order placed: ${orderId}`);
      window.location.hash = `#order-success?id=${orderId}&email=${encodeURIComponent(email)}`;
    },
  });

  // Checkout.jsx calls onOrderPlaced(formData) — we delegate to placeOrder.
  const handleOrderPlaced = async (formData) => {
    await placeOrder(formData);
  };

  // --- Subtotal ---
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Header
        activeRoute={activeRoute}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode((d) => !d)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartToggle={() => setIsCartOpen((o) => !o)}
        authUser={authUser}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
      />

      <main id="app-viewport">
        {/* Products are loaded async from the service — pass allProducts
            to components so they work identically with mock or real data. */}
        {activeRoute === '#home' && (
          <Home
            products={allProducts}
            productsLoading={productsLoading}
            onQuickView={handleQuickView}
            onAddToCartDirect={handleAddToCartDirect}
          />
        )}

        {activeRoute === '#products' && (
          <Shop
            products={allProducts}
            productsLoading={productsLoading}
            category={activeCategory}
            maxPrice={maxPrice}
            sort={sort}
            searchQuery={searchQuery}
            updateFilters={updateFilters}
            onQuickView={handleQuickView}
            onAddToCartDirect={handleAddToCartDirect}
          />
        )}

        {activeRoute === '#product-details' && (
          <ProductDetails
            productId={activeProductId}
            products={allProducts}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            onAddToCartDirect={handleAddToCartDirect}
          />
        )}

        {activeRoute === '#checkout' && (
          <Elements stripe={stripePromise}>
            <Checkout
              cart={cart}
              activePromoCode={activePromoCode}
              applyPromoCode={handleApplyPromoCode}
              promoFeedback={promoFeedback}
              onOrderPlaced={handleOrderPlaced}
            />
          </Elements>
        )}

        {activeRoute === '#order-success' && (
          <OrderSuccess />
        )}

        {activeRoute === '#orders' && (
          <MyOrders authUser={authUser} onLoginClick={handleLoginClick} />
        )}

        {/* Admin Panel — only renders for isAdmin users */}
        {activeRoute === '#admin' && (
          <AdminPanel
            authUser={authUser}
            onUnauthorized={() => { window.location.hash = '#home'; }}
            refetchProducts={refetchProducts}
          />
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        adjustQty={handleAdjustCartQty}
        removeItem={handleRemoveCartItem}
        subtotal={cartSubtotal}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          window.location.hash = '#checkout';
        }}
      />

      {/* OrderSuccess is now rendered full-page under activeRoute '#order-success' */}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authTab}
      />

      <Footer />
    </>
  );
}
