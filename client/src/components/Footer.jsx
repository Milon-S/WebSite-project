import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Subscribed successfully!');
    setEmail('');
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <a href="#home" className="logo">
            <span className="logo-dot"></span>AURA
          </a>
          <p className="brand-desc">
            Curating premium apparel and high-performance electronics to elevate your modern lifestyle. Crafted for design-conscious consumers.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" aria-label="X">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a href="#" aria-label="Pinterest">
              <i className="fa-brands fa-pinterest-p"></i>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3>Shop Collections</h3>
          <ul>
            <li>
              <a href="#products">All Products</a>
            </li>
            <li>
              <a href="#products?category=clothing">New Apparel</a>
            </li>
            <li>
              <a href="#products?category=electronics">Modern Tech</a>
            </li>
            <li>
              <a href="#products">Trending Essentials</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Customer Service</h3>
          <ul>
            <li>
              <a href="#">Shipping & Deliveries</a>
            </li>
            <li>
              <a href="#">Returns & Exchanges</a>
            </li>
            <li>
              <a href="#">FAQs</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </div>

        <div className="footer-col newsletter-col">
          <h3>Stay Connected</h3>
          <p>
            Subscribe to receive news, private collection releases, and exclusive discount codes.
          </p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" aria-label="Subscribe">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} AURA. All rights reserved. Created for design excellence.
          </p>
          <div className="payment-methods">
            <i className="fa-brands fa-cc-visa"></i>
            <i className="fa-brands fa-cc-mastercard"></i>
            <i className="fa-brands fa-cc-apple-pay"></i>
            <i className="fa-brands fa-cc-paypal"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
