import React from 'react';
import ProductCard from './ProductCard';
import HeroSlider from './HeroSlider';

export default function Home({ products, onQuickView, onAddToCartDirect }) {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <section id="page-home" className="page-section">
      {/* Hero Slider */}
      <HeroSlider products={products} />


      {/* Categories Section */}
      <section className="section categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">
              Browse our collections of apparel and state-of-the-art electronics.
            </p>
          </div>
          <div className="categories-grid">
            <a
              href="#products?category=clothing"
              className="category-card"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url('assets/product-jacket.png')`,
              }}
            >
              <div className="category-content">
                <h3>Apparel</h3>
                <span>
                  Discover Clothing <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
            <a
              href="#products?category=electronics"
              className="category-card"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url('assets/product-headphones.png')`,
              }}
            >
              <div className="category-content">
                <h3>Electronics</h3>
                <span>
                  Discover Gear <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section featured-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Trending Now</h2>
            <p className="section-subtitle">Our most popular and highly rated essentials.</p>
          </div>
          <div className="products-grid" id="trending-products-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                onAddToCartDirect={onAddToCartDirect}
              />
            ))}
          </div>
          <div className="section-footer">
            <a href="#products" className="btn btn-outline">
              View All Products <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Premium Features Banner */}
      <section className="features-banner">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <h3>Express Shipping</h3>
            <p>Complimentary delivery on orders above $150 worldwide.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-arrows-rotate"></i>
            </div>
            <h3>30-Day Returns</h3>
            <p>Hassle-free, prompt exchanges or full refunds.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3>Secure Checkout</h3>
            <p>Encrypted transactions keeping payment data safe.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
