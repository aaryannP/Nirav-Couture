'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [msg, setMsg] = useState('');

  // Delete Confirmation Modal State (Top-Popdown Animation)
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add Product Form State (Mandating Front and Back Images)
  const [formData, setFormData] = useState({
    title: '',
    category: 'oversized',
    fitType: 'Oversized Drop-Shoulder Fit',
    price: '',
    originalPrice: '',
    fabric: '240 GSM 100% Bio-Washed Cotton',
    description: '',
    stock: 50,
    frontImage: '',
    backImage: '',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  });

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fitType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleStockUpdate = async (id, newStock) => {
    try {
      const stockNum = parseInt(newStock);
      if (isNaN(stockNum) || stockNum < 0) {
        alert('Please enter a valid stock number');
        return;
      }
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: stockNum })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✓ Stock quantity updated to ${stockNum} successfully!`);
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.frontImage || !formData.backImage) {
      alert('Please provide BOTH Front-side image (Aage ki photo) AND Back-side image (Piche ki photo)!');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMsg('✓ New Men\'s T-Shirt added successfully to storefront!');
        fetchProducts();
        setShowAddModal(false);
        setFormData({
          title: '',
          category: 'oversized',
          fitType: 'Oversized Drop-Shoulder Fit',
          price: '',
          originalPrice: '',
          fabric: '240 GSM 100% Bio-Washed Cotton',
          description: '',
          stock: 50,
          frontImage: '',
          backImage: '',
          sizes: ['S', 'M', 'L', 'XL', 'XXL']
        });
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteCandidate) return;
    try {
      await fetch(`/api/products?id=${deleteCandidate.id}`, { method: 'DELETE' });
      setMsg(`✓ T-Shirt "${deleteCandidate.title}" deleted from catalog.`);
      setDeleteCandidate(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <AdminGuard>
      <div>
        {/* Subheader */}
        <div className="admin-header">
          <div className="container admin-nav">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
              NIRAV ADMIN PORTAL
            </h2>
            <div className="admin-menu">
              <Link href="/admin/dashboard" className="admin-menu-link">📊 Dashboard</Link>
              <Link href="/admin/products" className="admin-menu-link active">👕 T-Shirts Catalog</Link>
              <Link href="/admin/orders" className="admin-menu-link">📦 Orders Fulfillment</Link>
              <Link href="/admin/team" className="admin-menu-link">🔐 Team & Handover</Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
                CATALOG MANAGEMENT
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                Men's T-Shirts Inventory ({filteredProducts.length})
              </h1>
            </div>

            <button className="btn-primary btn-gold" onClick={() => setShowAddModal(true)}>
              + Add New T-Shirt (Front & Back Photos)
            </button>
          </div>

          {msg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontWeight: '600', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              {msg}
            </div>
          )}

          {/* Search & High-Contrast Filter Dropdown Bar */}
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-cream)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }}>
              <input 
                type="text" 
                placeholder="Search T-Shirts by title, fit, or fabric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.88rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-cream)', 
                fontSize: '0.88rem', 
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="all" style={{ background: '#1E2029', color: '#FAF7F2' }}>All Categories ({products.length})</option>
              <option value="oversized" style={{ background: '#1E2029', color: '#FAF7F2' }}>Oversized Drop-Shoulder</option>
              <option value="graphic" style={{ background: '#1E2029', color: '#FAF7F2' }}>Vintage Graphic Tees</option>
              <option value="luxury" style={{ background: '#1E2029', color: '#FAF7F2' }}>Luxury Silk Blend</option>
              <option value="polo" style={{ background: '#1E2029', color: '#FAF7F2' }}>Pique Knit Polos</option>
            </select>
          </div>

          {/* T-Shirts Inventory Table */}
          <table className="table-custom">
            <thead>
              <tr>
                <th>Image (Front / Back)</th>
                <th>T-Shirt Title</th>
                <th>Fit & Category</th>
                <th>Price</th>
                <th>Stock Quantity Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <img src={p.frontImage} alt="Front" style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-cream)' }} title="Front View" />
                      <img src={p.backImage || p.frontImage} alt="Back" style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-cream)' }} title="Back View" />
                    </div>
                  </td>
                  <td>
                    <strong>{p.title}</strong><br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fabric: {p.fabric}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-silk)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-cream)', color: 'var(--accent-gold)' }}>
                      {p.fitType}
                    </span>
                  </td>
                  <td>
                    <strong>₹{p.price.toLocaleString('en-IN')}</strong>
                    {p.originalPrice && <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-light)', marginLeft: '6px' }}>₹{p.originalPrice}</span>}
                  </td>
                  <td>
                    {/* Inline Quick Stock Quantity Manager */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input 
                          type="number" 
                          min="0"
                          defaultValue={p.stock}
                          id={`stock-input-${p.id}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleStockUpdate(p.id, e.target.value);
                          }}
                          style={{ 
                            width: '64px', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-cream)', 
                            fontSize: '0.85rem', 
                            fontWeight: '700', 
                            textAlign: 'center',
                            background: 'var(--bg-silk)',
                            color: 'var(--text-primary)'
                          }} 
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById(`stock-input-${p.id}`);
                            if (input) handleStockUpdate(p.id, input.value);
                          }}
                          style={{ 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--accent-gold)', 
                            background: 'var(--accent-gold-light)', 
                            color: 'var(--accent-gold)', 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            cursor: 'pointer' 
                          }}
                          title="Click to update stock quantity"
                        >
                          Save Stock 💾
                        </button>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: p.stock > 10 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                        {p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock (0)'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {/* Luxury Styled Delete Action Button */}
                    <button 
                      onClick={() => setDeleteCandidate(p)}
                      className="btn-delete-action"
                      title="Delete T-Shirt from catalog"
                    >
                      🗑️ Delete T-Shirt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Top-Down Pop-down Delete Confirmation Modal */}
          {deleteCandidate && (
            <div className="modal-overlay active" onClick={() => setDeleteCandidate(null)}>
              <div className="modal-container delete-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center', border: '1px solid #EF4444' }}>
                <button className="close-btn" onClick={() => setDeleteCandidate(null)} style={{ position: 'absolute', top: '16px', right: '16px' }}>✕</button>

                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}>
                  🗑️
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Delete T-Shirt Confirmation
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.6 }}>
                  Are you sure you want to delete <strong style={{ color: '#EF4444' }}>"{deleteCandidate.title}"</strong> from NIRAV catalog? This action cannot be undone.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn-outline" onClick={() => setDeleteCandidate(null)}>
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteProduct}
                    style={{ background: '#EF4444', color: '#FFFFFF', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
                  >
                    Confirm Delete 🗑️
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Product Modal (Mandating Front & Back Photos) */}
          {showAddModal && (
            <div className="modal-overlay active" onClick={() => setShowAddModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
                <button className="close-btn" onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '8px' }}>
                  Add New Men's T-Shirt
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Provide both Front-side and Back-side photo URLs for dual hover preview on storefront.
                </p>

                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>T-Shirt Title *</label>
                    <input type="text" required placeholder="NIRAV Heavyweight Acid Wash Tee" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Category *</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}>
                        <option value="oversized" style={{ background: '#1E2029', color: '#FAF7F2' }}>Oversized Drop-Shoulder</option>
                        <option value="graphic" style={{ background: '#1E2029', color: '#FAF7F2' }}>Vintage Graphic Tees</option>
                        <option value="luxury" style={{ background: '#1E2029', color: '#FAF7F2' }}>Luxury Silk Blend</option>
                        <option value="polo" style={{ background: '#1E2029', color: '#FAF7F2' }}>Pique Knit Polos</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Fit Type *</label>
                      <input type="text" required placeholder="Oversized Drop-Shoulder Fit" value={formData.fitType} onChange={(e) => setFormData({...formData, fitType: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>

                  {/* Mandated Front and Back Photos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--accent-gold-light)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.4)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--accent-gold)' }}>
                        📷 Front-Side Photo URL (Aage ki photo) *
                      </label>
                      <input type="url" required placeholder="https://images.unsplash.com/photo-1521572267360..." value={formData.frontImage} onChange={(e) => setFormData({...formData, frontImage: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.85rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--accent-gold)' }}>
                        📷 Back-Side Photo URL (Piche ki photo) *
                      </label>
                      <input type="url" required placeholder="https://images.unsplash.com/photo-1503342217505..." value={formData.backImage} onChange={(e) => setFormData({...formData, backImage: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.85rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Selling Price (₹) *</label>
                      <input type="number" required placeholder="1499" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Original MRP (₹)</label>
                      <input type="number" placeholder="1999" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Initial Stock *</label>
                      <input type="number" required placeholder="50" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Fabric & Care Specs</label>
                    <input type="text" placeholder="240 GSM 100% Bio-Washed Combed Cotton" value={formData.fabric} onChange={(e) => setFormData({...formData, fabric: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Description</label>
                    <textarea rows="3" placeholder="Handcrafted oversized T-Shirt featuring bio-washed heavy cotton..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.85rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}></textarea>
                  </div>

                  <button type="submit" className="btn-primary btn-gold" style={{ padding: '14px', marginTop: '12px' }}>
                    Publish T-Shirt to Storefront →
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
