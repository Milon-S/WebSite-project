import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../js/api';

export default function MyOrders({ authUser, onLoginClick }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!authUser) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMyOrders(authUser.email);
      setOrders(data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError('Failed to load your order history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [authUser, fetchOrders]);

  if (!authUser) {
    return (
      <section className="my-orders-page page-section">
        <div className="empty-orders-state">
          <i className="fa-solid fa-user-lock"></i>
          <h2>Access Denied</h2>
          <p>Please log in to view your order history.</p>
          <button className="btn btn-primary" onClick={onLoginClick}>
            Log In
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="my-orders-page page-section">
        <div className="orders-history-container">
          <div className="orders-history-header">
            <h1>My Order History</h1>
            <p>Track the status of your recent orders and view past receipts.</p>
          </div>
          <div className="skeleton-loading-orders">
            <div className="skeleton-order-card"></div>
            <div className="skeleton-order-card"></div>
            <div className="skeleton-order-card"></div>
          </div>
        </div>
      </section>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Processing': return 'status-processing';
      case 'Confirmed': return 'status-confirmed';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-processing';
    }
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <section className="my-orders-page page-section">
      <div className="orders-history-container">
        <div className="orders-history-header">
          <div className="orders-header-top">
            <div>
              <h1>My Order History</h1>
              <p>Track the status of your recent orders and view past receipts.</p>
            </div>
            <div className="orders-refresh-area">
              <button
                className="btn btn-secondary btn-sm orders-refresh-btn"
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                id="refresh-orders-btn"
                title="Refresh order statuses"
              >
                <i className={`fa-solid fa-rotate-right ${refreshing ? 'spin-icon' : ''}`}></i>
                {refreshing ? 'Refreshing…' : 'Refresh Status'}
              </button>
              {lastUpdated && (
                <p className="last-updated-text">
                  Last updated: {formatLastUpdated(lastUpdated)}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="orders-error-alert">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-orders-state">
            <div className="empty-icon-box">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <h2>No Orders Found</h2>
            <p>Looks like you haven't placed any orders yet. Explore our premium collections!</p>
            <a href="#products" className="btn btn-primary">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="orders-history-list">
            {orders.map((order) => {
              const orderId = order.orderId || order._id;
              const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <div className="order-history-card animate-card" key={orderId}>
                  <div className="order-history-card-header">
                    <div className="header-meta-col">
                      <span className="order-meta-label">Order Placed</span>
                      <p className="order-meta-value">{date}</p>
                    </div>
                    <div className="header-meta-col">
                      <span className="order-meta-label">Total Paid</span>
                      <p className="order-meta-value">${order.total?.toFixed(2)}</p>
                    </div>
                    <div className="header-meta-col reference-col">
                      <span className="order-meta-label">Reference</span>
                      <p className="order-meta-value">#{orderId}</p>
                    </div>
                    <div className="header-meta-col status-col">
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        <span className="status-dot"></span>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="order-history-card-body">
                    <div className="order-preview-items">
                      <p className="items-count-text">
                        Contains {itemCount} {itemCount === 1 ? 'item' : 'items'}:
                      </p>
                      <div className="items-inline-titles">
                        {order.items?.map((item, idx) => (
                          <span className="inline-item-title" key={idx}>
                            <strong>{item.title}</strong> (x{item.quantity})
                            {idx < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="order-card-actions">
                      <a 
                        href={`#order-success?id=${orderId}&email=${encodeURIComponent(order.customer?.email || authUser.email)}`} 
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="fa-solid fa-receipt"></i> View Receipt & Details
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
