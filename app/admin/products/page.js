'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
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

  // Stock edit tracking
  const [stockInputs, setStockInputs] = useState({});
  const [updatingStockId, setUpdatingStockId] = useState(null);

  // File Input Refs for opening OS file explorer
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // URL fallback toggle states
  const [showFrontUrl, setShowFrontUrl] = useState(false);
  const [showBackUrl, setShowBackUrl] = useState(false);
  const [showGalleryUrl, setShowGalleryUrl] = useState(false);

  // Gallery Mockups list (can contain data URLs from file explorer or web URLs)
  const [galleryImages, setGalleryImages] = useState([]);
  const [extraUrlInput, setExtraUrlInput] = useState('');

  // Add Product Form State
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
        if (data.success) {
          setProducts(data.data);
          // Initialize stock inputs
          const initialStock = {};
          data.data.forEach(p => {
            initialStock[p.id] = p.stock;
          });
          setStockInputs(initialStock);
        }
      })
      .catch(err => console.error('Error fetching products:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.fabric || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.fitType || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Client-side image compressor: scales high-res photos to max 1200px and 85% JPEG quality
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } catch {
            resolve(e.target.result);
          }
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFrontFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await compressImageFile(file);
      if (dataUrl) {
        setFormData(prev => ({ ...prev, frontImage: dataUrl }));
      }
    }
  };

  const handleBackFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await compressImageFile(file);
      if (dataUrl) {
        setFormData(prev => ({ ...prev, backImage: dataUrl }));
      }
    }
  };

  const handleGalleryFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const list = [];
    for (const f of files) {
      const dataUrl = await compressImageFile(f);
      if (dataUrl) list.push(dataUrl);
    }
    setGalleryImages(prev => [...prev, ...list]);
  };

  const removeGalleryImage = (indexToRemove) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const addExtraUrls = () => {
    if (!extraUrlInput.trim()) return;
    const urls = extraUrlInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    setGalleryImages(prev => Array.from(new Set([...prev, ...urls])));
    setExtraUrlInput('');
  };

  // Stock Quantity Update Handler (Persists directly to PostgreSQL)
  const handleStockUpdate = async (id, newStock) => {
    try {
      const stockNum = parseInt(newStock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        alert('Please enter a valid stock number (0 or higher)');
        return;
      }
      setUpdatingStockId(id);
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: stockNum })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✓ Stock quantity updated to ${stockNum} successfully!`);
        // Immediately update local state
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: stockNum } : p));
        setStockInputs(prev => ({ ...prev, [id]: stockNum }));
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.error || 'Failed to update stock in database');
      }
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.frontImage || !formData.backImage) {
      alert('Please select or provide BOTH Front-side photo (Aage ki photo) AND Back-side photo (Piche ki photo)!');
      return;
    }

    const allImages = Array.from(new Set([
      formData.frontImage.trim(),
      formData.backImage.trim(),
      ...galleryImages
    ].filter(Boolean)));

    const payload = {
      ...formData,
      frontImage: formData.frontImage.trim(),
      backImage: formData.backImage.trim(),
      images: allImages
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✓ New Men's T-Shirt added successfully with ${allImages.length} gallery views!`);
        fetchProducts();
        setShowAddModal(false);
        setGalleryImages([]);
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
        setTimeout(() => setMsg(''), 5000);
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
      setTimeout(() => setMsg(''), 4000);
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
              ERA43 ADMIN PORTAL
            </h2>
            <div className="admin-menu">
              <Link href="/admin/dashboard" className="admin-menu-link">Dashboard</Link>
              <Link href="/admin/products" className="admin-menu-link active">T-Shirts Catalog</Link>
              <Link href="/admin/orders" className="admin-menu-link">Orders Fulfillment</Link>
              <Link href="/admin/team" className="admin-menu-link">Team & Handover</Link>
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
              + Add New T-Shirt (Upload Photos)
            </button>
          </div>

          {msg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontWeight: '600', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              {msg}
            </div>
          )}

          {/* Search & High-Contrast Filter Dropdown Bar */}
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-cream)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flexGrow: 1, minWidth: '200px' }}>
              <input 
                id="admin-products-search"
                name="products_search"
                aria-label="Search T-Shirts"
                type="text" 
                placeholder="Search T-Shirts by title, fit, or fabric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.88rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}
              />
            </div>
            <select 
              id="admin-products-category"
              name="products_category"
              aria-label="Filter by Category"
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
          <div style={{ overflowX: 'auto' }}>
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
              {filteredProducts.map(p => {
                const currentStockVal = stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock;
                const isSaving = updatingStockId === p.id;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={p.frontImage} alt="Front" style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-cream)' }} title="Front View" />
                        <img src={p.backImage || p.frontImage} alt="Back" style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-cream)' }} title="Back View" />
                        {p.images && p.images.length > 2 && (
                          <span style={{ fontSize: '0.72rem', background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', fontWeight: '800', padding: '3px 6px', borderRadius: '4px', border: '1px solid var(--accent-gold)' }} title={`${p.images.length} total gallery views`}>
                            +{p.images.length - 2} mockups
                          </span>
                        )}
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
                      <strong>₹{Number(p.price).toLocaleString('en-IN')}</strong>
                      {p.originalPrice && <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-light)', marginLeft: '6px' }}>₹{p.originalPrice}</span>}
                    </td>
                    <td>
                      {/* Inline Quick Stock Quantity Manager */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="number" 
                            min="0"
                            key={`stock-key-${p.id}-${p.stock}`}
                            value={currentStockVal}
                            id={`stock-input-${p.id}`}
                            name={`stock_${p.id}`}
                            aria-label={`Stock for ${p.title}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStockInputs(prev => ({ ...prev, [p.id]: val }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleStockUpdate(p.id, currentStockVal);
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
                            disabled={isSaving}
                            onClick={() => handleStockUpdate(p.id, currentStockVal)}
                            style={{ 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              border: '1px solid var(--accent-gold)', 
                              background: isSaving ? 'var(--bg-silk)' : 'var(--accent-gold-light)', 
                              color: 'var(--accent-gold)', 
                              fontSize: '0.75rem', 
                              fontWeight: '700', 
                              cursor: isSaving ? 'not-allowed' : 'pointer',
                              opacity: isSaving ? 0.6 : 1
                            }}
                            title="Click to update stock quantity in database"
                          >
                            {isSaving ? 'Saving...' : 'Save Stock'}
                          </button>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: Number(p.stock) > 10 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                          {Number(p.stock) > 0 ? `In Stock (${p.stock})` : 'Out of Stock (0)'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => setDeleteCandidate(p)}
                        className="btn-delete-action"
                        title="Delete T-Shirt from catalog"
                      >
                        Delete T-Shirt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* Top-Down Pop-down Delete Confirmation Modal */}
          {deleteCandidate && (
            <div className="modal-overlay active" onClick={() => setDeleteCandidate(null)}>
              <div className="modal-container delete-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center', border: '1px solid #EF4444' }}>
                <button className="close-btn" onClick={() => setDeleteCandidate(null)} style={{ position: 'absolute', top: '16px', right: '16px' }}>✕</button>

                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Delete T-Shirt Confirmation
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.6 }}>
                  Are you sure you want to delete <strong style={{ color: '#EF4444' }}>"{deleteCandidate.title}"</strong> from ERA43 catalog? This action cannot be undone.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn-outline" onClick={() => setDeleteCandidate(null)}>
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteProduct}
                    style={{ background: '#EF4444', color: '#FFFFFF', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Product Modal (Mandating Front & Back Photos with Native File Explorer Upload) */}
          {showAddModal && (
            <div className="modal-overlay active" onClick={() => setShowAddModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
                <button className="close-btn" onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '8px' }}>
                  Add New Men's T-Shirt
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Select Front and Back photos directly from your computer for instant storefront dual-hover view.
                </p>

                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label htmlFor="new-prod-title" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>T-Shirt Title *</label>
                    <input id="new-prod-title" name="title" type="text" required placeholder="ERA43 Heavyweight Acid Wash Tee" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label htmlFor="new-prod-category" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Category *</label>
                      <select id="new-prod-category" name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}>
                        <option value="oversized" style={{ background: '#1E2029', color: '#FAF7F2' }}>Oversized Drop-Shoulder</option>
                        <option value="graphic" style={{ background: '#1E2029', color: '#FAF7F2' }}>Vintage Graphic Tees</option>
                        <option value="luxury" style={{ background: '#1E2029', color: '#FAF7F2' }}>Luxury Silk Blend</option>
                        <option value="polo" style={{ background: '#1E2029', color: '#FAF7F2' }}>Pique Knit Polos</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="new-prod-fit" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Fit Type *</label>
                      <input id="new-prod-fit" name="fitType" type="text" required placeholder="Oversized Drop-Shoulder Fit" value={formData.fitType} onChange={(e) => setFormData({...formData, fitType: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>

                  {/* Mandated Front and Back Photos — Native File Explorer Upload */}
                  <div style={{ background: 'var(--accent-gold-light)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.4)' }}>
                    <div className="form-grid-2">
                      {/* Front Photo Picker */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                            Front-Side Photo (Aage ki photo) *
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setShowFrontUrl(!showFrontUrl)} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {showFrontUrl ? 'Switch to File Picker' : 'Or paste URL'}
                          </button>
                        </div>

                        {showFrontUrl ? (
                          <input 
                            id="new-prod-front-img" 
                            name="frontImage" 
                            type="url" 
                            placeholder="https://images.unsplash.com/..." 
                            value={formData.frontImage} 
                            onChange={(e) => setFormData({...formData, frontImage: e.target.value})} 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.85rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} 
                          />
                        ) : (
                          <div>
                            <input 
                              ref={frontInputRef}
                              type="file" 
                              accept="image/*" 
                              onChange={handleFrontFileSelect} 
                              style={{ display: 'none' }} 
                            />
                            {formData.frontImage ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-silk)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)' }}>
                                <img src={formData.frontImage} alt="Front Preview" style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-gold)' }} />
                                <div style={{ flexGrow: 1 }}>
                                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', display: 'block' }}>✓ Photo Selected</span>
                                  <button 
                                    type="button" 
                                    onClick={() => frontInputRef.current?.click()} 
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                  >
                                    Change File
                                  </button>
                                  <span style={{ margin: '0 6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>|</span>
                                  <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, frontImage: '' }))} 
                                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => frontInputRef.current?.click()} 
                                style={{ 
                                  border: '2px dashed var(--accent-gold)', 
                                  borderRadius: '8px', 
                                  padding: '16px 12px', 
                                  textAlign: 'center', 
                                  cursor: 'pointer', 
                                  background: 'rgba(212,175,55,0.06)' 
                                }}
                              >
                                <div style={{ fontSize: '1.4rem' }}>📁</div>
                                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-gold)', marginTop: '4px' }}>
                                  Select Front Photo from PC
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Click to open File Explorer
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Back Photo Picker */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                            Back-Side Photo (Piche ki photo) *
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setShowBackUrl(!showBackUrl)} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {showBackUrl ? 'Switch to File Picker' : 'Or paste URL'}
                          </button>
                        </div>

                        {showBackUrl ? (
                          <input 
                            id="new-prod-back-img" 
                            name="backImage" 
                            type="url" 
                            placeholder="https://images.unsplash.com/..." 
                            value={formData.backImage} 
                            onChange={(e) => setFormData({...formData, backImage: e.target.value})} 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.85rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} 
                          />
                        ) : (
                          <div>
                            <input 
                              ref={backInputRef}
                              type="file" 
                              accept="image/*" 
                              onChange={handleBackFileSelect} 
                              style={{ display: 'none' }} 
                            />
                            {formData.backImage ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-silk)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)' }}>
                                <img src={formData.backImage} alt="Back Preview" style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-gold)' }} />
                                <div style={{ flexGrow: 1 }}>
                                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', display: 'block' }}>✓ Photo Selected</span>
                                  <button 
                                    type="button" 
                                    onClick={() => backInputRef.current?.click()} 
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                  >
                                    Change File
                                  </button>
                                  <span style={{ margin: '0 6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>|</span>
                                  <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, backImage: '' }))} 
                                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => backInputRef.current?.click()} 
                                style={{ 
                                  border: '2px dashed var(--accent-gold)', 
                                  borderRadius: '8px', 
                                  padding: '16px 12px', 
                                  textAlign: 'center', 
                                  cursor: 'pointer', 
                                  background: 'rgba(212,175,55,0.06)' 
                                }}
                              >
                                <div style={{ fontSize: '1.4rem' }}>📁</div>
                                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-gold)', marginTop: '4px' }}>
                                  Select Back Photo from PC
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Click to open File Explorer
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Mockup & Gallery Images (Optional) — Clean Heading with Native Multi-File Explorer Upload */}
                  <div style={{ background: 'var(--bg-silk)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-cream)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Additional Mockups & Photoshoot Views (Optional)
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: '700', background: 'var(--accent-gold-light)', padding: '2px 8px', borderRadius: '4px' }}>
                        Dynamic Gallery
                      </span>
                    </div>

                    <input 
                      ref={galleryInputRef}
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleGalleryFilesSelect} 
                      style={{ display: 'none' }} 
                    />

                    {/* Big Friendly Explorer Upload Button */}
                    <div 
                      onClick={() => galleryInputRef.current?.click()} 
                      style={{ 
                        border: '2px dashed var(--border-cream)', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        textAlign: 'center', 
                        cursor: 'pointer', 
                        background: 'rgba(212,175,55,0.04)',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📂</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                        + Select Photoshoot & Mockup Photos from File Explorer
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Click to select one or multiple images from your computer
                      </div>
                    </div>

                    {/* Previews of selected mockup files */}
                    {galleryImages.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
                            {galleryImages.length} additional photo{galleryImages.length > 1 ? 's' : ''} added:
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setGalleryImages([])} 
                            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                          >
                            Clear all mockups
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {galleryImages.map((src, i) => (
                            <div key={i} style={{ position: 'relative', width: '56px', height: '72px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-cream)' }}>
                              <img src={src} alt={`Mockup ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button 
                                type="button" 
                                onClick={() => removeGalleryImage(i)} 
                                style={{ 
                                  position: 'absolute', 
                                  top: '2px', 
                                  right: '2px', 
                                  width: '18px', 
                                  height: '18px', 
                                  borderRadius: '50%', 
                                  background: 'rgba(239, 68, 68, 0.9)', 
                                  color: '#FFFFFF', 
                                  border: 'none', 
                                  fontSize: '11px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                                title="Remove photo"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collapsible URL Fallback */}
                    <div style={{ marginTop: '8px' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowGalleryUrl(!showGalleryUrl)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        {showGalleryUrl ? '▲ Hide URL input' : '+ Or paste image URLs manually'}
                      </button>

                      {showGalleryUrl && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder="https://example.com/model-angle.jpg" 
                            value={extraUrlInput} 
                            onChange={(e) => setExtraUrlInput(e.target.value)} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addExtraUrls();
                              }
                            }}
                            style={{ flexGrow: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-cream)', fontSize: '0.8rem', background: '#FFFFFF', color: '#111111' }} 
                          />
                          <button 
                            type="button" 
                            onClick={addExtraUrls} 
                            style={{ padding: '8px 14px', borderRadius: '6px', background: 'var(--accent-gold)', color: '#000000', fontWeight: '700', fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}
                          >
                            Add URL
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label htmlFor="new-prod-price" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Selling Price (₹) *</label>
                      <input id="new-prod-price" name="price" type="number" required placeholder="1499" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label htmlFor="new-prod-stock" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Initial Stock *</label>
                      <input id="new-prod-stock" name="stock" type="number" required placeholder="50" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="new-prod-fabric" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Fabric & Care Specs</label>
                    <input id="new-prod-fabric" name="fabric" type="text" placeholder="240 GSM 100% Bio-Washed Combed Cotton" value={formData.fabric} onChange={(e) => setFormData({...formData, fabric: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                  </div>

                  <div>
                    <label htmlFor="new-prod-desc" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Description</label>
                    <textarea id="new-prod-desc" name="description" rows="3" placeholder="Handcrafted oversized T-Shirt featuring bio-washed heavy cotton..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.85rem', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}></textarea>
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
