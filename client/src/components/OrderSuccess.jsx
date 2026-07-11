import React, { useEffect, useState } from 'react';
import { apiService } from '../js/api';

export default function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getQueryParams = () => {
    const hash = window.location.hash || '';
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return {};
    const searchParams = new URLSearchParams(hash.substring(queryIndex + 1));
    return {
      id: searchParams.get('id') || '',
      email: searchParams.get('email') || '',
    };
  };

  const { id: queryId, email: queryEmail } = getQueryParams();

  useEffect(() => {
    const { id } = getQueryParams();
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        let cacheDetails = null;

        // Load local cache — only used for item/address details as a fallback
        try {
          const cached = sessionStorage.getItem('aura_last_order');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.orderId === id || parsed._id === id || parsed.paymentIntentId === id) {
              cacheDetails = parsed;
            }
          }
        } catch (e) {
          console.warn('Failed to parse cached order', e);
        }

        // ALWAYS fetch live order from the API to get the real-time status
        let liveOrder = null;
        try {
          liveOrder = await apiService.getOrderById(id);
        } catch (fetchErr) {
          console.warn('Could not fetch live order, falling back to cache:', fetchErr);
        }

        if (liveOrder) {
          // Live data from DB is authoritative — use it, but fill in items/customer
          // from cache if the API response is missing those (e.g. mock fallback)
          const merged = {
            ...cacheDetails,
            ...liveOrder,
            // Prefer live fields but keep cache items if live has none
            items: (liveOrder.items?.length > 0 ? liveOrder.items : cacheDetails?.items) || [],
            customer: liveOrder.customer || cacheDetails?.customer,
          };
          setOrder(merged);
        } else if (cacheDetails) {
          // Server unreachable — fall back to cached data
          setOrder(cacheDetails);
        } else {
          setError('Order details could not be found.');
        }
      } catch (err) {
        console.error('Error loading order details:', err);
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <section className="order-success-page page-section">
        <div className="order-success-container skeleton-loading">
          <div className="skeleton-circle"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-card"></div>
        </div>
      </section>
    );
  }

  const displayEmail = order?.customer?.email || queryEmail || 'your email';
  const displayId = order?.orderId || order?._id || queryId || 'N/A';
  const customerName = order?.customer?.firstName || 'Valued Customer';
  const formattedDelivery = order?.estimatedDelivery 
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '5 business days';

  return (
    <section className="order-success-page page-section">
      <div className="order-success-container">
        {/* Success Animation Header */}
        <div className="order-success-header">
          <div className="success-icon animate-success">
            <div className="success-checkmark-wrapper">
              <span className="checkmark-tip animate-tip"></span>
              <span className="checkmark-long animate-long"></span>
            </div>
          </div>
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">
            Thank you for shopping at AURA, <strong>{customerName}</strong>.
          </p>
          <div className="order-badge">
            Reference: <span id="success-order-id">#{displayId}</span>
          </div>
          <p className="success-info-text">
            We have sent a receipt and tracking information to <strong className="user-email">{displayEmail}</strong>.
          </p>
        </div>

        {/* Details Grid */}
        <div className="order-success-grid">
          {/* Left Column: Items purchased */}
          <div className="success-card items-card">
            <h3>Items Purchased</h3>
            <div className="success-items-list">
              {order?.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div className="success-item-row" key={idx}>
                    <div className="success-item-info">
                      <h4>{item.title}</h4>
                      {item.variation && (
                        <p className="success-item-variation">
                          Variation: <span>{item.variation}</span>
                        </p>
                      )}
                      <p className="success-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <div className="success-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-items-details">
                  <p>Items details are currently loading or unavailable.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Address and Price breakdown */}
          <div className="success-details-column">
            {/* Delivery Info */}
            <div className="success-card delivery-card">
              <h3>Delivery Details</h3>
              <div className="delivery-status-wrapper">
                <div className="delivery-icon-box">
                  <i className="fa-solid fa-truck-fast"></i>
                </div>
                <div>
                  <p className="delivery-label">Estimated Delivery Date</p>
                  <p className="delivery-date">{formattedDelivery}</p>
                </div>
              </div>
              
              {order?.customer && (
                <div className="shipping-address-summary">
                  <p className="address-title">Shipping Address</p>
                  <p className="address-name">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="address-line">{order.customer.address}</p>
                  <p className="address-city-state-zip">
                    {order.customer.city}, {order.customer.state} {order.customer.zip}
                  </p>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="success-card pricing-card">
              <h3>Payment Summary</h3>
              <div className="pricing-breakdown">
                <div className="pricing-line">
                  <span>Subtotal</span>
                  <span>${order?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="pricing-line">
                  <span>Shipping</span>
                  <span>{order?.shipping === 0 ? 'Free' : `$${order?.shipping?.toFixed(2)}`}</span>
                </div>
                <div className="pricing-line">
                  <span>Tax (8%)</span>
                  <span>${order?.tax?.toFixed(2) || '0.00'}</span>
                </div>
                {order?.discount > 0 && (
                  <div className="pricing-line discount">
                    <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pricing-line total">
                  <span>Total Paid</span>
                  <span>${order?.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="order-success-actions">
          <a href="#home" className="btn btn-primary" id="success-home-btn">
            <i className="fa-solid fa-arrow-left"></i> Continue Shopping
          </a>
          <button className="btn btn-secondary" onClick={handlePrint} id="success-print-btn">
            <i className="fa-solid fa-print"></i> Print Receipt
          </button>
        </div>
      </div>
    </section>
  );
}
