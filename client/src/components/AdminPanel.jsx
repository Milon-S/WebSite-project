import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from '../js/api';

// ─── Empty product form state ──────────────────────────────────
const EMPTY_PRODUCT_FORM = {
  title: '',
  price: '',
  description: '',
  image: '',
  category: 'electronics',
  stock: '',
  featured: false,
};

// ─── Empty promo form state ────────────────────────────────────
const EMPTY_PROMO_FORM = {
  code: '',
  discountPercent: '',
  description: '',
  active: true,
};

// ─── ProductFormModal ──────────────────────────────────────────
function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(
    isEdit
      ? {
          title:       product.title || product.name || '',
          price:       product.price ?? '',
          description: product.description || '',
          image:       product.image || '',
          category:    product.category || 'electronics',
          stock:       product.stock ?? '',
          featured:    product.featured ?? false,
        }
      : { ...EMPTY_PRODUCT_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.image || !form.category) {
      setError('Title, price, image URL, and category are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
      };
      if (isEdit) {
        await updateProduct(product._id, payload);
      } else {
        await addProduct(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-form-modal">
        <div className="admin-form-modal-header">
          <h3>{isEdit ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        </div>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-field full-width">
              <label>Product Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Premium Wireless Headphones" required />
            </div>
            <div className="admin-field">
              <label>Price ($) *</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="0.00" required />
            </div>
            <div className="admin-field">
              <label>Stock Qty</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
            </div>
            <div className="admin-field">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
            <div className="admin-field featured-check">
              <label className="checkbox-label">
                <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} />
                <span>Featured Product</span>
              </label>
            </div>
            <div className="admin-field full-width">
              <label>Image URL *</label>
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://... or assets/image.png" required />
            </div>
            {form.image && (
              <div className="admin-field full-width">
                <label>Preview</label>
                <img src={form.image} alt="preview" className="admin-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="admin-field full-width">
              <label>Description *</label>
              <textarea name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Product description…" required />
            </div>
          </div>

          {error && <div className="auth-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

          <div className="admin-form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id={isEdit ? 'admin-update-btn' : 'admin-create-btn'}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PromoFormModal ────────────────────────────────────────────
function PromoFormModal({ promo, onClose, onSaved }) {
  const isEdit = Boolean(promo);
  const [form, setForm] = useState(
    isEdit
      ? {
          code:            promo.code || '',
          discountPercent: promo.discountPercent ?? '',
          description:     promo.description || '',
          active:          promo.active ?? true,
        }
      : { ...EMPTY_PROMO_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountPercent || !form.description) {
      setError('Promo code, discount, and description are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        discountPercent: parseInt(form.discountPercent, 10),
      };
      if (isEdit) {
        // promo._id is kept in DB but hidden by toJSON, look at promo._id or promo.id if parsed
        const id = promo._id || promo.id;
        await updatePromoCode(id, payload);
      } else {
        await createPromoCode(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-form-modal">
        <div className="admin-form-modal-header">
          <h3>{isEdit ? '✏️ Edit Promo Code' : '🏷️ Create Promo Code'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        </div>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Promo Code *</label>
              <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. AURA50" required style={{ textTransform: 'uppercase' }} disabled={isEdit} />
            </div>
            <div className="admin-field">
              <label>Discount Percent (%) *</label>
              <input name="discountPercent" type="number" min="1" max="100" value={form.discountPercent} onChange={handleChange} placeholder="10" required />
            </div>
            <div className="admin-field full-width">
              <label>Description / Details *</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. 10% off your entire order" required />
            </div>
            <div className="admin-field featured-check">
              <label className="checkbox-label">
                <input name="active" type="checkbox" checked={form.active} onChange={handleChange} />
                <span>Active Coupon</span>
              </label>
            </div>
          </div>

          {error && <div className="auth-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

          <div className="admin-form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : isEdit ? 'Save Changes' : 'Create Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DeleteConfirmModal ────────────────────────────────────────
function DeleteConfirmModal({ title, onClose, onConfirm, loading }) {
  return (
    <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-confirm-modal">
        <div className="admin-confirm-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
        <h3>Delete Item?</h3>
        <p>You are about to permanently delete <strong>"{title}"</strong>. This action cannot be undone.</p>
        <div className="admin-form-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading} id="admin-confirm-delete-btn">
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Deleting…</> : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminPanel ───────────────────────────────────────────
export default function AdminPanel({ authUser, onUnauthorized, refetchProducts }) {
  // Guard — redirect non-admins
  useEffect(() => {
    if (!authUser || !authUser.isAdmin) {
      onUnauthorized?.();
    }
  }, [authUser, onUnauthorized]);

  // Tab States: 'products' | 'orders' | 'promo'
  const [activeTab, setActiveTab] = useState('products');

  // Data States
  const [products, setProducts]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [promos, setPromos]       = useState([]);

  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  // Modals States
  const [showAddModal, setShowAddModal]         = useState(false);
  const [editProduct, setEditProduct]           = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null); // { type: 'product'|'promo', id, title }
  const [deleteLoading, setDeleteLoading]       = useState(false);

  const [showPromoModal, setShowPromoModal]     = useState(false);
  const [editPromo, setEditPromo]               = useState(null);

  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Loaders ──────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadPromos = useCallback(async () => {
    try {
      const data = await getPromoCodes();
      setPromos(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders(), loadPromos()]);
    setLoading(false);
  }, [loadProducts, loadOrders, loadPromos]);

  useEffect(() => {
    if (authUser?.isAdmin) {
      loadAllData();
    }
  }, [authUser, loadAllData]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'product') {
        await deleteProduct(deleteTarget.id);
        showToast(`✅ Product "${deleteTarget.title}" deleted.`);
        loadProducts();
        refetchProducts?.(); // Refresh products on site home/shop
      } else if (deleteTarget.type === 'promo') {
        await deletePromoCode(deleteTarget.id);
        showToast(`✅ Promo code "${deleteTarget.title}" deleted.`);
        loadPromos();
      }
      setDeleteTarget(null);
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`✅ Order status updated to "${newStatus}".`);
      loadOrders();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  // ── Filters ──────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.title || p.name || '').toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return !q || 
      (o.customer?.email || '').toLowerCase().includes(q) ||
      (o.customer?.firstName || '').toLowerCase().includes(q) ||
      (o.customer?.lastName || '').toLowerCase().includes(q) ||
      (o._id || o.orderId || '').toLowerCase().includes(q);
  });

  const filteredPromos = promos.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.code || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
  });

  if (!authUser?.isAdmin) return null;

  return (
    <section id="page-admin" className="page-section admin-panel">
      {/* Toast Notification */}
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-badge"><i className="fa-solid fa-shield-halved" /> Admin Dashboard</div>
          <div>
            <h1 className="admin-title">Website Content Management</h1>
            <p className="admin-subtitle">Welcome back, <strong>{authUser.name}</strong>. Manage shop data in real time.</p>
          </div>
        </div>

        {activeTab === 'products' && (
          <button className="btn btn-primary" id="admin-add-product-btn" onClick={() => setShowAddModal(true)}>
            <i className="fa-solid fa-plus" /> Add Product
          </button>
        )}
        {activeTab === 'promo' && (
          <button className="btn btn-primary" id="admin-add-promo-btn" onClick={() => setShowPromoModal(true)}>
            <i className="fa-solid fa-plus" /> Create Coupon
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="auth-tabs" style={{ marginBottom: '2.5rem' }}>
        <button className={`auth-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); setSearch(''); }}>
          🛍️ Products ({products.length})
        </button>
        <button className={`auth-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setSearch(''); }}>
          📦 Orders ({orders.length})
        </button>
        <button className={`auth-tab ${activeTab === 'promo' ? 'active' : ''}`} onClick={() => { setActiveTab('promo'); setSearch(''); }}>
          🏷️ Coupons ({promos.length})
        </button>
      </div>

      {/* Dynamic Tab Section */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>
            {activeTab === 'products' && 'Product Catalogue'}
            {activeTab === 'orders' && 'Customer Invoices'}
            {activeTab === 'promo' && 'Active Discount Promo Codes'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeTab === 'products' && (
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-plus" /> Add Product
              </button>
            )}
            {activeTab === 'promo' && (
              <button className="btn btn-primary" onClick={() => setShowPromoModal(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-plus" /> Create Coupon
              </button>
            )}
            <div className="admin-search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder={
                  activeTab === 'products' ? 'Search products…' :
                  activeTab === 'orders' ? 'Search by email, name, order ID…' :
                  'Search promo codes…'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="admin-search-input"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <i className="fa-solid fa-spinner fa-spin" /> Syncing database tables…
          </div>
        ) : (
          <>
            {/* TABS 1: PRODUCTS LISTING */}
            {activeTab === 'products' && (
              filteredProducts.length === 0 ? (
                <div className="admin-empty">
                  <i className="fa-solid fa-box-open" />
                  <p>{search ? 'No products match search criteria.' : 'Catalogue empty. Create your first product.'}</p>
                  {!search && (
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '1rem' }}>
                      <i className="fa-solid fa-plus" /> Add Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product Details</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <img
                              src={p.image}
                              alt={p.title || p.name}
                              className="admin-table-img"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/60x60?text=?'; }}
                            />
                          </td>
                          <td>
                            <div className="admin-product-name">{p.title || p.name}</div>
                            <div className="admin-product-id">ID: {p._id}</div>
                          </td>
                          <td><span className={`admin-category-badge ${p.category}`}>{p.category}</span></td>
                          <td><strong>${Number(p.price).toFixed(2)}</strong></td>
                          <td>{p.stock ?? 0}</td>
                          <td>
                            {p.featured ? (
                              <span className="admin-featured-yes"><i className="fa-solid fa-star" /></span>
                            ) : (
                              <span className="admin-featured-no">—</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button className="admin-action-btn edit" title="Edit details" onClick={() => setEditProduct(p)} id={`admin-edit-prod-${p._id}`}>
                                <i className="fa-solid fa-pen-to-square" />
                              </button>
                              <button className="admin-action-btn delete" title="Delete product" onClick={() => setDeleteTarget({ type: 'product', id: p._id, title: p.title || p.name })} id={`admin-del-prod-${p._id}`}>
                                <i className="fa-solid fa-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* TABS 2: ORDERS LISTING */}
            {activeTab === 'orders' && (
              filteredOrders.length === 0 ? (
                <div className="admin-empty">
                  <i className="fa-solid fa-receipt" />
                  <p>No customer orders found.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Purchase items</th>
                        <th>Total Paid</th>
                        <th>Status</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o._id || o.orderId}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {o._id || o.orderId}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(o.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{o.customer?.firstName} {o.customer?.lastName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.customer?.email}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer?.address}, {o.customer?.city}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {(o.items || []).map((item, idx) => (
                                <div key={idx}>
                                  • {item.title} x{item.quantity} {item.variation ? `(${item.variation})` : ''}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td><strong>${Number(o.total).toFixed(2)}</strong></td>
                          <td>
                            <span className={`admin-category-badge`} style={{
                              backgroundColor: 
                                o.status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' :
                                o.status === 'Shipped' ? 'rgba(59, 130, 246, 0.15)' :
                                o.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' :
                                'rgba(245, 158, 11, 0.15)',
                              color:
                                o.status === 'Delivered' ? 'var(--success)' :
                                o.status === 'Shipped' ? 'var(--accent)' :
                                o.status === 'Cancelled' ? 'var(--danger)' :
                                '#f59e0b',
                            }}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o._id || o.orderId, e.target.value)}
                              style={{
                                padding: '0.4rem 0.6rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* TABS 3: PROMO CODES LISTING */}
            {activeTab === 'promo' && (
              filteredPromos.length === 0 ? (
                <div className="admin-empty">
                  <i className="fa-solid fa-tags" />
                  <p>{search ? 'No coupons match search criteria.' : 'No coupons active. Create one above!'}</p>
                  {!search && (
                    <button className="btn btn-primary" onClick={() => setShowPromoModal(true)} style={{ marginTop: '1rem' }}>
                      <i className="fa-solid fa-plus" /> Create Coupon
                    </button>
                  )}
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Discount Value</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPromos.map((p) => {
                        const id = p._id || p.id;
                        return (
                          <tr key={id || p.code}>
                            <td><strong style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>{p.code}</strong></td>
                            <td><strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{p.discountPercent}% OFF</strong></td>
                            <td>{p.description}</td>
                            <td>
                              <span className="admin-category-badge" style={{
                                backgroundColor: p.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: p.active ? 'var(--success)' : 'var(--danger)',
                              }}>
                                {p.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-row-actions">
                                <button className="admin-action-btn edit" title="Edit coupon" onClick={() => setEditPromo(p)} id={`admin-edit-promo-${p.code}`}>
                                  <i className="fa-solid fa-pen-to-square" />
                                </button>
                                <button className="admin-action-btn delete" title="Delete coupon" onClick={() => setDeleteTarget({ type: 'promo', id: id, title: p.code })} id={`admin-del-promo-${p.code}`}>
                                  <i className="fa-solid fa-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* ─── MODAL DIALOGS ─────────────────────────────────────── */}
      {showAddModal && (
        <ProductFormModal
          product={null}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { loadProducts(); refetchProducts?.(); showToast('🎉 New product added successfully!'); }}
        />
      )}

      {editProduct && (
        <ProductFormModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={() => { loadProducts(); refetchProducts?.(); showToast('🎉 Product details updated successfully!'); }}
        />
      )}

      {showPromoModal && (
        <PromoFormModal
          promo={null}
          onClose={() => setShowPromoModal(false)}
          onSaved={() => { loadPromos(); showToast('🎉 Promo coupon created successfully!'); }}
        />
      )}

      {editPromo && (
        <PromoFormModal
          promo={editPromo}
          onClose={() => setEditPromo(null)}
          onSaved={() => { loadPromos(); showToast('🎉 Coupon details updated successfully!'); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </section>
  );
}
