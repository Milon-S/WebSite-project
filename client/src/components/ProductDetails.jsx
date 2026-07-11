import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ShoeDetails from './ShoeDetails';

export default function ProductDetails({
  productId,
  products,
  onAddToCart,
  onQuickView,
  onAddToCartDirect,
}) {
  // Use string comparison to support both numeric mock IDs and MongoDB ObjectId strings
  const product = products.find((p) => String(p.id) === String(productId));

  if (!product) {
    return (
      <div className="details-container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <p>Product not found.</p>
        <a href="#products" className="btn btn-primary">
          Back to Shop
        </a>
      </div>
    );
  }

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Footwear: selected EU size string (e.g. "42")
  const [selectedShoeSize, setSelectedShoeSize] = useState('');

  // Reset local state when product changes
  useEffect(() => {
    setActiveImage(product.image);
    setQuantity(1);
    setSelectedShoeSize(''); // Clear shoe size when switching products

    // Choose default variation (non-footwear products)
    if (product.variations) {
      if (product.variations.type === 'color') {
        setSelectedVariation(product.variations.options[0].name);
      } else {
        setSelectedVariation(product.variations.options[0]);
      }
    } else {
      setSelectedVariation('');
    }
  }, [productId, product]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    let stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i className="fa-solid fa-star" key={`d-full-${i}`}></i>);
    }
    if (halfStar) {
      stars.push(<i className="fa-solid fa-star-half-stroke" key="d-half"></i>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i className="fa-regular fa-star" key={`d-empty-${i}`}></i>);
    }
    return stars;
  };

  const handleAddToCart = () => {
    // For footwear, pass the EU size as the variation string
    const variation = product.category === 'footwear'
      ? (selectedShoeSize ? `EU ${selectedShoeSize}` : '')
      : selectedVariation;
    onAddToCart(product.id, quantity, variation);
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && String(p.id) !== String(product.id))
    .slice(0, 4);

  // Build thumbnail list (default + dynamic images if any)
  const thumbnails = [product.image, ...(product.images || [])].filter(Boolean);
  // De-duplicate thumbnails just in case
  const uniqueThumbnails = Array.from(new Set(thumbnails));

  return (
    <section id="page-product-details" className="page-section">
      <div className="details-container">
        <a href="#products" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> Back to Shop
        </a>

        <div className="product-details-grid">
          {/* Left: Images Showcase */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img id="detail-main-img" src={activeImage} alt={product.title} />
            </div>
            <div className="image-thumbs" id="detail-thumbs">
              {uniqueThumbnails.map((thumbSrc, idx) => (
                <div
                  key={idx}
                  className={`thumb ${activeImage === thumbSrc ? 'active' : ''}`}
                  onClick={() => setActiveImage(thumbSrc)}
                >
                  <img src={thumbSrc} alt="product thumbnail" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="product-info-panel">
            <span id="detail-category" className="product-badge">
              {product.category}
            </span>
            <h1 id="detail-title">{product.title}</h1>

            <div className="rating-container">
              <div className="stars" id="detail-stars">
                {renderStars(product.rating)}
              </div>
              <span className="reviews-count" id="detail-reviews-count">
                ({product.reviewsCount} verified reviews)
              </span>
            </div>

            <div className="detail-price" id="detail-price">
              ${product.price.toFixed(2)}
            </div>

            <p id="detail-description" className="detail-desc">
              {product.description}
            </p>

            {/* Specifications Box */}
            {product.specs && (
              <div className="product-specs-box" style={{ margin: '15px 0', fontSize: '0.9rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 0', fontWeight: '600', color: 'var(--text-secondary)' }}>{key}</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Product Variations — Standard (non-footwear) */}
            {product.category !== 'footwear' && product.variations && (
              <div className="product-variations" id="variations-container">
                <div className="variation-group">
                  <div className="variation-label">
                    {product.variations.type === 'color' ? 'Select Color' : 'Select Size'}
                  </div>
                  <div className="variation-options">
                    {product.variations.type === 'color' ? (
                      product.variations.options.map((opt) => (
                        <button
                          key={opt.name}
                          className={`color-option ${selectedVariation === opt.name ? 'active' : ''}`}
                          style={{ backgroundColor: opt.value }}
                          title={opt.name}
                          onClick={() => setSelectedVariation(opt.name)}
                        ></button>
                      ))
                    ) : (
                      product.variations.options.map((opt) => (
                        <button
                          key={opt}
                          className={`size-option ${selectedVariation === opt ? 'active' : ''}`}
                          onClick={() => setSelectedVariation(opt)}
                        >
                          {opt}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Product Variations — Footwear (ShoeDetails widget panel) */}
            {product.category === 'footwear' && (
              <ShoeDetails
                product={product}
                selectedSize={selectedShoeSize}
                onSizeSelect={setSelectedShoeSize}
              />
            )}

            {/* Quantity and Add to Cart */}
            <div className="purchase-actions">
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  id="qty-minus"
                  aria-label="Decrease Quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <input type="number" id="detail-qty" value={quantity} readOnly />
                <button
                  className="qty-btn"
                  id="qty-plus"
                  aria-label="Increase Quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
              <button
                className="btn btn-primary btn-block"
                id="detail-add-to-cart"
                onClick={handleAddToCart}
              >
                <i className="fa-solid fa-bag-shopping"></i> Add to Cart
              </button>
            </div>

            <div className="product-perks">
              <div className="perk-item">
                <i className="fa-solid fa-truck"></i>
                <div>
                  <strong>Free Shipping</strong>
                  <p>Delivered within 3-5 business days.</p>
                </div>
              </div>
              <div className="perk-item">
                <i className="fa-solid fa-rotate-left"></i>
                <div>
                  <strong>Easy Returns</strong>
                  <p>Friendly 30-day return policy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="section related-section">
            <div className="section-header">
              <h2 className="section-title">You May Also Like</h2>
            </div>
            <div className="products-grid" id="related-products-grid">
              {relatedProducts.map((relatedP) => (
                <ProductCard
                  key={relatedP.id}
                  product={relatedP}
                  onQuickView={onQuickView}
                  onAddToCartDirect={onAddToCartDirect}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
