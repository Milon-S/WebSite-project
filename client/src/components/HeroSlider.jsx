import React, { useState, useEffect, useCallback, useRef } from 'react';

const SLIDE_INTERVAL = 5000; // 5 seconds per slide

export default function HeroSlider({ products }) {
  const slides = products.filter((p) => p.featured);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(null);
  const timerRef = useRef(null);

  const totalSlides = slides.length;

  const goTo = useCallback(
    (index) => {
      if (isTransitioning || totalSlides === 0) return;
      setIsTransitioning(true);
      setActiveIndex((index + totalSlides) % totalSlides);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning, totalSlides]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    timerRef.current = setInterval(goNext, SLIDE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [goNext, isPaused, totalSlides]);

  // Reset progress bar animation on slide change
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.animation = 'none';
      // Force reflow
      void progressRef.current.offsetWidth;
      progressRef.current.style.animation = `sliderProgress ${SLIDE_INTERVAL}ms linear forwards`;
    }
  }, [activeIndex]);

  if (totalSlides === 0) return null;

  // Build gradient colors per slide for visual variety
  const gradients = [
    'linear-gradient(135deg, rgba(10, 25, 47, 0.88) 0%, rgba(15, 23, 42, 0.55) 60%, rgba(0,0,0,0.2) 100%)',
    'linear-gradient(135deg, rgba(30, 10, 60, 0.85) 0%, rgba(20, 10, 40, 0.5) 60%, rgba(0,0,0,0.15) 100%)',
    'linear-gradient(135deg, rgba(5, 30, 30, 0.88) 0%, rgba(10, 40, 35, 0.5) 60%, rgba(0,0,0,0.2) 100%)',
    'linear-gradient(135deg, rgba(40, 20, 10, 0.85) 0%, rgba(30, 15, 5, 0.5) 60%, rgba(0,0,0,0.15) 100%)',
  ];

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((product, index) => (
        <div
          key={product.id}
          className={`hero-slider__slide ${index === activeIndex ? 'active' : ''} ${
            index < activeIndex ? 'prev' : ''
          }`}
          style={{
            backgroundImage: `${gradients[index % gradients.length]}, url('${product.image}')`,
          }}
        >
          <div className="hero-slider__content">
            <span className="hero-slider__tag">
              <i className="fa-solid fa-fire"></i> FEATURED
            </span>
            <h2 className="hero-slider__title">{product.title}</h2>
            <p className="hero-slider__desc">{product.description}</p>
            <div className="hero-slider__meta">
              <span className="hero-slider__price">${product.price.toFixed(2)}</span>
              <span className="hero-slider__rating">
                <i className="fa-solid fa-star"></i> {product.rating}
                <span className="hero-slider__reviews">({product.reviewsCount} reviews)</span>
              </span>
            </div>
            <div className="hero-slider__actions">
              <a
                href={`#product-details?id=${product.id}`}
                className="btn btn-primary btn-lg"
              >
                <i className="fa-solid fa-bag-shopping"></i> Shop Now
              </a>
              <a href="#products" className="btn btn-secondary btn-lg">
                Explore All
              </a>
            </div>
          </div>

          {/* Floating product image card — clickable to details */}
          <div className="hero-slider__product-visual">
            <a href={`#product-details?id=${product.id}`} className="hero-slider__img-card">
              <img src={product.image} alt={product.title} />
            </a>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            className="hero-slider__arrow hero-slider__arrow--prev"
            onClick={goPrev}
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            className="hero-slider__arrow hero-slider__arrow--next"
            onClick={goNext}
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </>
      )}

      {/* Bottom Bar: Dots + Progress */}
      {totalSlides > 1 && (
        <div className="hero-slider__bottom-bar">
          <div className="hero-slider__dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hero-slider__dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="hero-slider__progress-track">
            <div
              ref={progressRef}
              className="hero-slider__progress-bar"
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            />
          </div>
          <span className="hero-slider__counter">
            {String(activeIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
