import React from 'react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  adjustQty,
  removeItem,
  subtotal,
  onProceedToCheckout,
}) {
  return (
    <>
      <div
        className={`cart-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>
      <div className={`cart-drawer ${isOpen ? 'active' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
          <button id="cart-drawer-close" className="icon-btn" aria-label="Close Cart" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="cart-drawer-content">
          {/* Cart Items Container */}
          <div className={`cart-items-container ${cart.length === 0 ? 'hidden' : ''}`}>
            {cart.map((item, index) => (
              <div className="cart-item" key={`${item.id}-${item.variation}`}>
                <div className="cart-item-img">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="cart-item-details">
                  <h4>{item.title}</h4>
                  <span className="cart-item-meta">{item.variation ? 'Option: ' + item.variation : ''}</span>
                  <div className="cart-item-bottom">
                    <div className="cart-item-qty">
                      <button onClick={() => adjustQty(index, -1)} aria-label="Decrease">
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <input type="number" value={item.quantity} readOnly />
                      <button onClick={() => adjustQty(index, 1)} aria-label="Increase">
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                    <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(index)} aria-label="Remove item">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Cart State */}
          {cart.length === 0 && (
            <div id="cart-empty-state" className="cart-empty-state">
              <i className="fa-solid fa-bag-shopping"></i>
              <p>Your shopping bag is empty.</p>
              <a href="#products" className="btn btn-primary" onClick={onClose}>
                Start Shopping
              </a>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer" id="cart-drawer-footer">
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span id="cart-drawer-subtotal">${subtotal.toFixed(2)}</span>
            </div>
            <p className="shipping-info-text">Shipping & taxes calculated at checkout.</p>
            <button className="btn btn-primary btn-block btn-lg" onClick={onProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
