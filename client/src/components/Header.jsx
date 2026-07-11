import React, { useState, useEffect, useRef } from 'react';

export default function Header({
  activeRoute,
  activeCategory,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  toggleTheme,
  cartCount,
  onCartToggle,
  // ─── Auth Props ───────────────────────────────────────────
  authUser,        // null | { name, email, isAdmin, ... }
  onLoginClick,    // fn() → opens AuthModal
  onLogout,        // fn() → clears auth state
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen]     = useState(false);
  const userMenuRef = useRef(null);

  // Close mobile drawer when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [activeRoute, activeCategory]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!window.location.hash.startsWith('#products')) {
      window.location.hash = `#products?q=${encodeURIComponent(val)}`;
    }
  };

  // Get user initials for avatar
  const getInitials = (name = '') =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Top Promo Bar */}
      <div className="promo-bar">
        <p>
          Free worldwide shipping on orders over $150. Use code{' '}
          <span className="promo-code">AURA10</span> for 10% off!
        </p>
      </div>

      {/* Navigation Header */}
      <header className="main-header">
        <div className="header-container">
          <a href="#home" className="logo">
            <span className="logo-dot" />AURA
          </a>

          <nav className="nav-links">
            <a href="#home" className={`nav-link ${activeRoute === '#home' ? 'active' : ''}`}>
              Home
            </a>
            <a
              href="#products"
              className={`nav-link ${activeRoute === '#products' && !activeCategory ? 'active' : ''}`}
            >
              Shop
            </a>
            <a
              href="#products?category=clothing"
              className={`nav-link ${activeRoute === '#products' && activeCategory === 'clothing' ? 'active' : ''}`}
            >
              Clothing
            </a>
            <a
              href="#products?category=electronics"
              className={`nav-link ${activeRoute === '#products' && activeCategory === 'electronics' ? 'active' : ''}`}
            >
              Electronics
            </a>
          </nav>

          <div className="header-actions">
            <div className="search-bar-container">
              <input
                type="text"
                id="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button className="search-btn" aria-label="Search">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </div>

            <button id="theme-toggle" className="icon-btn" aria-label="Toggle Dark Mode" onClick={toggleTheme}>
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} />
            </button>

            {/* ─── Auth UI ─────────────────────────────────────── */}
            {authUser ? (
              /* Logged-in: avatar + dropdown */
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setIsUserMenuOpen((o) => !o)}
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                  id="user-menu-toggle"
                >
                  <span className="user-avatar">{getInitials(authUser.name)}</span>
                  <span className="user-name-display">{authUser.name.split(' ')[0]}</span>
                  <i className={`fa-solid fa-chevron-${isUserMenuOpen ? 'up' : 'down'} user-chevron`} />
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-header">
                      <p className="user-dropdown-name">{authUser.name}</p>
                      <p className="user-dropdown-email">{authUser.email}</p>
                      {authUser.isAdmin && (
                        <span className="user-admin-badge"><i className="fa-solid fa-shield-halved" /> Admin</span>
                      )}
                    </div>
                    <hr className="user-dropdown-divider" />

                    {/* Admin Panel link — hidden from non-admins */}
                    {authUser.isAdmin && (
                      <a
                        href="#admin"
                        className="user-dropdown-item admin-item"
                        role="menuitem"
                        id="admin-panel-link"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <i className="fa-solid fa-gauge-high" /> Admin Panel
                      </a>
                    )}

                    <a
                      href="#orders"
                      className="user-dropdown-item orders-item"
                      role="menuitem"
                      id="my-orders-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fa-solid fa-receipt" /> My Orders
                    </a>

                    <button
                      className="user-dropdown-item logout-item"
                      role="menuitem"
                      id="logout-btn"
                      onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                    >
                      <i className="fa-solid fa-right-from-bracket" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in: Login button */
              <button
                className="btn btn-outline-sm"
                id="header-login-btn"
                onClick={onLoginClick}
                aria-label="Login or Register"
              >
                <i className="fa-solid fa-right-to-bracket" /> Login
              </button>
            )}

            <button
              id="cart-toggle-btn"
              className="icon-btn cart-btn"
              aria-label="Open Shopping Cart"
              onClick={onCartToggle}
            >
              <i className="fa-solid fa-bag-shopping" />
              <span className={`cart-count ${cartCount > 0 ? '' : 'hidden'}`}>{cartCount}</span>
            </button>

            <button
              id="mobile-menu-btn"
              className="icon-btn mobile-only"
              aria-label="Toggle Menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <i className="fa-solid fa-bars" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-drawer-header">
          <span className="logo"><span className="logo-dot" />AURA</span>
          <button id="mobile-drawer-close" className="icon-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <nav className="mobile-nav-links">
          <a href="#home"                        className="mobile-nav-link">Home</a>
          <a href="#products"                    className="mobile-nav-link">Shop All</a>
          <a href="#products?category=clothing"  className="mobile-nav-link">Clothing</a>
          <a href="#products?category=electronics" className="mobile-nav-link">Electronics</a>

          {/* Mobile auth links */}
          <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
          {authUser ? (
            <>
              <span className="mobile-nav-link" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                👤 {authUser.name}
              </span>
              {authUser.isAdmin && (
                <a href="#admin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  🛡️ Admin Panel
                </a>
              )}
              <button
                className="mobile-nav-link"
                style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <button
              className="mobile-nav-link"
              style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}
            >
              🔑 Login / Register
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
