import React, { useState } from 'react';
import ProductCard from './ProductCard';

export default function Shop({
  products,
  category,
  maxPrice,
  sort,
  searchQuery,
  updateFilters,
  onQuickView,
  onAddToCartDirect,
}) {
  const [isMobileSidebarActive, setIsMobileSidebarActive] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = category === 'all' || p.category === category;
    const matchesPrice = p.price <= maxPrice;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts];
  if (sort === 'price-low') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    sortedProducts.sort((a, b) => b.rating - a.rating);
  }

  const handleCategoryClick = (cat) => {
    updateFilters({ category: cat });
  };

  const handlePriceChange = (e) => {
    updateFilters({ maxprice: e.target.value });
  };

  const handleSortChange = (e) => {
    updateFilters({ sort: e.target.value });
  };

  const handleResetFilters = () => {
    updateFilters({ category: 'all', maxprice: 1500, sort: 'featured', q: '' });
  };

  return (
    <section id="page-products" className="page-section">
      <div className="page-header">
        <div className="page-header-container">
          <h1 className="page-title">Explore Catalog</h1>
          <ul className="breadcrumbs">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <i className="fa-solid fa-chevron-right"></i>
            </li>
            <li className="active">Shop</li>
          </ul>
        </div>
      </div>

      <div className="shop-layout">
        <div className="shop-container">
          {/* Sidebar Filters */}
          <aside className={`shop-sidebar ${isMobileSidebarActive ? 'active' : ''}`}>
            <div className="filter-group">
              <h3>Categories</h3>
              <ul className="filter-list" id="category-filters">
                <li>
                  <button
                    className={`filter-btn ${category === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('all')}
                  >
                    All Products
                  </button>
                </li>
                <li>
                  <button
                    className={`filter-btn ${category === 'clothing' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('clothing')}
                  >
                    Clothing
                  </button>
                </li>
                <li>
                  <button
                    className={`filter-btn ${category === 'electronics' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('electronics')}
                  >
                    Electronics
                  </button>
                </li>
                <li>
                  <button
                    className={`filter-btn ${category === 'footwear' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('footwear')}
                  >
                    <i className="fa-solid fa-shoe-prints" style={{ marginRight: '6px', fontSize: '0.8em' }}></i>
                    Footwear
                  </button>
                </li>
              </ul>
            </div>

            <div className="filter-group">
              <h3>Price Range</h3>
              <div className="price-slider-container">
                <input
                  type="range"
                  id="price-range"
                  min="0"
                  max="1500"
                  value={maxPrice}
                  onChange={handlePriceChange}
                  className="slider"
                />
                <div className="price-labels">
                  <span>$0</span>
                  <span>
                    Max: {maxPrice >= 1500 ? 'Any' : `$${maxPrice}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h3>Sort By</h3>
              <select
                id="sort-select"
                className="custom-select"
                value={sort}
                onChange={handleSortChange}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </aside>

          {/* Catalog Content */}
          <div className="shop-content">
            <div className="shop-toolbar">
              <span className="results-count">
                <span id="product-count">{sortedProducts.length}</span> items found
              </span>
              {/* Mobile Filters Trigger Button */}
              <button
                id="mobile-filter-trigger"
                className="btn btn-outline btn-sm mobile-only"
                onClick={() => setIsMobileSidebarActive(!isMobileSidebarActive)}
              >
                <i className="fa-solid fa-sliders"></i> Filters
              </button>
            </div>

            <div className="products-grid" id="catalog-products-grid">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onAddToCartDirect={onAddToCartDirect}
                />
              ))}
            </div>

            {/* Empty Catalog State */}
            {sortedProducts.length === 0 && (
              <div id="empty-catalog" className="empty-state">
                <i className="fa-solid fa-magnifying-glass"></i>
                <h3>No Products Found</h3>
                <p>Try adjusting your search queries or category filters.</p>
                <button className="btn btn-primary" id="reset-filters-btn" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
