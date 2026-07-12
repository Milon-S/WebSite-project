import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { USE_MOCK } from '../js/api';

export default function Checkout({
  cart,
  activePromoCode,
  applyPromoCode,
  promoFeedback,
  onOrderPlaced,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardname: '',
    bkashTrxId: '',
  });

  const [errors, setErrors] = useState({});
  const [cardFocused, setCardFocused] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldKey = id.replace('checkout-', '');
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));

    // Clear error immediately as user types
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: false }));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 150 || subtotal === 0 ? 0.0 : 15.0;
  const tax = subtotal * 0.08;

  let discount = 0;
  let discountPercent = 0;
  if (activePromoCode === 'AURA10' && subtotal > 0) {
    discountPercent = 10;
    discount = subtotal * 0.1;
  }

  const total = subtotal + shipping + tax - discount;

  const [promoInput, setPromoInput] = useState('');
  const handlePromoApply = () => {
    applyPromoCode(promoInput.trim().toUpperCase());
  };

  const validateForm = () => {
    const newErrors = {};

    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = true;
    }

    // Required fields
    const reqFields = ['firstname', 'lastname', 'address', 'city', 'state', 'zip'];
    if (paymentMethod === 'card') {
      reqFields.push('cardname');
    } else if (paymentMethod === 'bkash') {
      reqFields.push('bkashTrxId');
    }
    
    reqFields.forEach((field) => {
      if (!formData[field] || formData[field].trim().length === 0) {
        newErrors[field] = true;
      }
    });

    // Validate Stripe card details if not in mock mode and using card
    if (paymentMethod === 'card' && !USE_MOCK && !cardComplete) {
      if (!cardError) {
        setCardError('Please enter complete credit card details.');
      }
      newErrors.card = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleCardChange = (e) => {
    setCardComplete(e.complete);
    if (e.error) {
      setCardError(e.error.message);
    } else {
      setCardError('');
    }
  };

  const isDarkMode = document.body.classList.contains('dark-theme');
  const cardElementOptions = {
    style: {
      base: {
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': {
          color: isDarkMode ? '#64748b' : '#94a3b8',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'card' && !USE_MOCK && (!stripe || !elements)) {
      setOrderError('Stripe has not loaded yet. Please try again in a moment.');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    try {
      let paymentIntentId = '';

      if (paymentMethod === 'cod') {
        paymentIntentId = `cod_${Date.now()}`;
      } else if (paymentMethod === 'bkash') {
        paymentIntentId = `bkash_${formData.bkashTrxId}`;
      } else if (!USE_MOCK) {
        // 1. Create PaymentIntent on the backend
        const response = await fetch('/api/payments/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to initialize payment with Stripe.');
        }

        const { clientSecret, paymentIntentId: piId } = await response.json();
        paymentIntentId = piId;

        // 2. Confirm card payment with Stripe
        const cardElement = elements.getElement(CardElement);
        const { paymentIntent, error: stripeConfirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.cardname || `${formData.firstname} ${formData.lastname}`,
              email: formData.email,
              address: {
                line1: formData.address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zip,
              },
            },
          },
        });

        if (stripeConfirmError) {
          throw new Error(stripeConfirmError.message);
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error(`Payment processing failed. Current status: ${paymentIntent.status}`);
        }
      } else {
        // Simulating stripe payment delay in mock mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        paymentIntentId = `pi_mock_${Date.now()}`;
      }

      // 3. Save order details to database
      await onOrderPlaced({
        ...formData,
        paymentIntentId,
        paymentMethod,
      });

      // Clear local states on success
      setFormData({
        email: '',
        firstname: '',
        lastname: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        cardname: '',
        bkashTrxId: '',
      });

      if (paymentMethod === 'card' && !USE_MOCK) {
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
          cardElement.clear();
        }
        setCardComplete(false);
        setCardError('');
      }
    } catch (err) {
      console.error('[Checkout Error] Order placement failed:', err);
      setOrderError(err.message || 'Something went wrong placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="page-checkout" className="page-section">
      <div className="checkout-layout">
        <div className="checkout-container">
          {/* Left: Forms */}
          <div className="checkout-forms-section">
            <h2>Checkout Details</h2>

            <form id="checkout-form" className="checkout-form" onSubmit={handleSubmit}>
              {/* Contact Info */}
              <div className="form-group-wrapper">
                <h3>Contact Information</h3>
                <div className="form-row">
                  <div className={`form-group col-12 ${errors.email ? 'invalid' : ''}`}>
                    <label htmlFor="checkout-email">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="checkout-email"
                      required
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <span className="error-msg">Please enter a valid email.</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-group-wrapper">
                <h3>Shipping Address</h3>
                <div className="form-row">
                  <div className={`form-group col-6 ${errors.firstname ? 'invalid' : ''}`}>
                    <label htmlFor="checkout-firstname">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="checkout-firstname"
                      required
                      placeholder="John"
                      value={formData.firstname}
                      onChange={handleInputChange}
                    />
                    <span className="error-msg">Required.</span>
                  </div>
                  <div className={`form-group col-6 ${errors.lastname ? 'invalid' : ''}`}>
                    <label htmlFor="checkout-lastname">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="checkout-lastname"
                      required
                      placeholder="Doe"
                      value={formData.lastname}
                      onChange={handleInputChange}
                    />
                    <span className="error-msg">Required.</span>
                  </div>
                </div>
                <div className={`form-group ${errors.address ? 'invalid' : ''}`}>
                  <label htmlFor="checkout-address">
                    Street Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="checkout-address"
                    required
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  <span className="error-msg">Required.</span>
                </div>
                <div className="form-row">
                  <div className={`form-group col-4 ${errors.city ? 'invalid' : ''}`}>
                    <label htmlFor="checkout-city">
                      City <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="checkout-city"
                      required
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    <span className="error-msg">Required.</span>
                  </div>
                  <div className={`form-group col-4 ${errors.state ? 'invalid' : ''}`}>
                    <label htmlFor="checkout-state">
                      State / Province <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="checkout-state"
                      required
                      placeholder="NY"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                    <span className="error-msg">Required.</span>
                  </div>
                  <div className={`form-group col-4 ${errors.zip ? 'invalid' : ''}`}>
                    <label htmlFor="checkout-zip">
                      Zip / Postal Code <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="checkout-zip"
                      required
                      placeholder="10001"
                      value={formData.zip}
                      onChange={handleInputChange}
                    />
                    <span className="error-msg">Required.</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="form-group-wrapper">
                <h3>Payment Details</h3>
                
                <div className="payment-method-selector" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span style={{ fontWeight: paymentMethod === 'card' ? '600' : '400' }}>Credit Card</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span style={{ fontWeight: paymentMethod === 'cod' ? '600' : '400' }}>Cash on Delivery</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span style={{ fontWeight: paymentMethod === 'bkash' ? '600' : '400' }}>bKash</span>
                  </label>
                </div>

                {paymentMethod === 'bkash' && (
                  <div className={`form-group ${errors.bkashTrxId ? 'invalid' : ''}`}>
                    <label htmlFor="checkout-bkashTrxId">
                      bKash Transaction ID <span className="required">*</span>
                    </label>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Please send the total amount to our bKash number: <b>01786513661</b> and enter the Transaction ID below.
                    </div>
                    <input
                      type="text"
                      id="checkout-bkashTrxId"
                      required={paymentMethod === 'bkash'}
                      placeholder="e.g. 8NX1XXXXXXXX"
                      value={formData.bkashTrxId}
                      onChange={handleInputChange}
                    />
                    <span className="error-msg">Required.</span>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <>
                    <div className={`form-group ${errors.cardname ? 'invalid' : ''}`}>
                      <label htmlFor="checkout-cardname">
                        Name on Card <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="checkout-cardname"
                        required={paymentMethod === 'card'}
                        placeholder="John Doe"
                        value={formData.cardname}
                        onChange={handleInputChange}
                      />
                      <span className="error-msg">Required.</span>
                    </div>
                    {!USE_MOCK ? (
                      <div className={`form-group ${errors.card ? 'invalid' : ''}`}>
                        <label>
                          Card Information <span className="required">*</span>
                        </label>
                        <div className={`stripe-card-element-container ${cardFocused ? 'focused' : ''} ${cardError ? 'invalid' : ''}`}>
                          <CardElement
                            options={cardElementOptions}
                            onChange={handleCardChange}
                            onFocus={() => setCardFocused(true)}
                            onBlur={() => setCardFocused(false)}
                          />
                        </div>
                        {cardError && <span className="error-msg" style={{ display: 'block' }}>{cardError}</span>}
                      </div>
                    ) : (
                      <div className="promo-message success" style={{ marginBottom: '1.5rem', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                        <i className="fa-solid fa-circle-check"></i> Mock checkout mode is active. Click "Place Order" to verify.
                      </div>
                    )}
                  </>
                )}

                {paymentMethod === 'cod' && (
                  <div className="promo-message" style={{ marginBottom: '1.5rem', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <i className="fa-solid fa-truck"></i> You have selected Cash on Delivery. You will pay when your order is delivered.
                  </div>
                )}
              </div>

              {orderError && (
                <div className="promo-message error" style={{ marginBottom: '1rem' }}>
                  {orderError}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                id="place-order-btn"
                disabled={cart.length === 0 || isSubmitting}
              >
                {isSubmitting
                  ? 'Placing Order…'
                  : (
                    <>Place Order &bull; <span id="checkout-btn-total">${total.toFixed(2)}</span></>
                  )}
              </button>
            </form>
          </div>

          {/* Right: Summary */}
          <div className="checkout-summary-section">
            <h2>Order Summary</h2>
            <div className="checkout-summary-container">
              <div className="checkout-items-list" id="checkout-items-list">
                {cart.length === 0 ? (
                  <div className="empty-state">
                    <i className="fa-solid fa-cart-shopping"></i>
                    <p>Your shopping cart is currently empty. Please select products to purchase.</p>
                    <a href="#products" className="btn btn-primary">
                      Browse Shop
                    </a>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div className="checkout-item" key={`${item.id}-${item.variation}`}>
                      <div className="checkout-item-img">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="checkout-item-info">
                        <h4>{item.title}</h4>
                        <p>
                          Qty: {item.quantity}{' '}
                          {item.variation ? <>&bull; {item.variation}</> : ''}
                        </p>
                      </div>
                      <span className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="promo-input-container">
                <input
                  type="text"
                  id="promo-code-input"
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <button className="btn btn-secondary" id="apply-promo-btn" onClick={handlePromoApply}>
                  Apply
                </button>
              </div>
              {promoFeedback.text && (
                <div
                  className={`promo-message ${
                    promoFeedback.type === 'success' ? 'success' : 'error'
                  }`}
                  id="promo-feedback"
                >
                  {promoFeedback.text}
                </div>
              )}

              <div className="summary-breakdown">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span id="summary-subtotal">${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping</span>
                  <span id="summary-shipping">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="summary-line">
                  <span>Taxes (Estimated)</span>
                  <span id="summary-tax">${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-line discount-line" id="summary-discount-row">
                    <span>Discount ({discountPercent}%)</span>
                    <span id="summary-discount">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-line total-line">
                  <span>Total</span>
                  <span id="summary-total">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
