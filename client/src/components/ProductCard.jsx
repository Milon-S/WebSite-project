import React from 'react';

export default function ProductCard({ product, onQuickView, onAddToCartDirect }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i className="fa-solid fa-star" key={`full-${i}`}></i>);
    }
    if (halfStar) {
      stars.push(<i className="fa-solid fa-star-half-stroke" key="half"></i>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i className="fa-regular fa-star" key={`empty-${i}`}></i>);
    }
    return stars;
  };

  const handleCardClick = () => {
    window.location.hash = `#product-details?id=${product.id}`;
  };

  return (
    <article className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <span className="product-badge">{product.category}</span>
      <div className="product-card-img-wrapper">
        <img src={product.image} alt={product.title} loading="lazy" />
        <div className="product-card-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product.id);
            }}
          >
            Quick View
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCartDirect(product.id);
            }}
          >
            <i className="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <h3 className="product-card-title">{product.title}</h3>
        <div className="product-card-rating">
          <div className="stars">{renderStars(product.rating)}</div>
          <span>({product.reviewsCount})</span>
        </div>
        <div className="product-card-price">${product.price.toFixed(2)}</div>
      </div>
    </article>
  );
}
