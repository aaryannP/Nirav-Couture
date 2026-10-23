'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id || '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    fetch('/api/orders?all=true')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const found = data.data.find(
            o => o.id.toUpperCase() === orderId.toUpperCase()
          );
          if (found) {
            setOrder(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [orderId]);

  const customerName = order?.customerName || order?.name || 'Valued Customer';
  const customerPhone = order?.phone || '';
  const customerEmail = order?.customerEmail || order?.email || '';
  const shippingAddress = order?.shippingAddress || order?.address || '';
  const paymentMethod = order?.paymentMethod || 'Cash on Delivery (COD)';
  const status = order?.status || order?.orderStatus || 'CONFIRMED';
  const items = Array.isArray(order?.items) ? order?.items : [];
  const finalTotal = Number(order?.finalTotal || order?.totalAmount || 0);
  const discountAmount = Number(order?.discountAmount || 0);
  const subtotal = Number(order?.totalAmount || (finalTotal + discountAmount));
  const orderDate = order?.date || new Date().toISOString().split('T')[0];

  // GST 18% calculation
  const taxableValue = Math.round((finalTotal / 1.18) * 100) / 100;
  const gstAmount = Math.round((finalTotal - taxableValue) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount / 2) * 100) / 100;

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      let str = '';
      if (n > 19) {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      } else {
        str += a[n];
      }
      return str;
    };

    let n = Math.floor(num);
    if (n === 0) return 'Zero Rupees Only';

    let output = '';
    if (Math.floor(n / 10000000) > 0) {
      output += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      output += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      output += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      output += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      output += inWords(n);
    }
    return output.trim() + ' Rupees Only';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = (target = 'any') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://era43.com';
    const invoiceUrl = `${origin}/invoice/${orderId}`;
    const text = encodeURIComponent(
      `🧾 *ERA43 LUXURY HAUTE COUTURE — TAX INVOICE*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Order Ref:* ${orderId}\n` +
      `*Customer:* ${customerName}\n` +
      `*Payment:* ${paymentMethod}\n` +
      `*Status:* ${status}\n\n` +
      `📦 *Items:*\n` +
      items.map(i => `• ${i.title} (${i.selectedSize || 'M'}) × ${i.qty || 1} — ₹${((i.price || 0) * (i.qty || 1)).toLocaleString('en-IN')}`).join('\n') +
      `\n\n*Total Amount:* ₹${finalTotal.toLocaleString('en-IN')} (Incl. 18% GST)\n` +
      `*Delivery Address:* ${shippingAddress}\n\n` +
      `📄 *View / Download Official Tax Invoice Bill:* \n${invoiceUrl}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Thank you for choosing ERA43 Luxury.`
    );

    let url = `https://api.whatsapp.com/send?text=${text}`;
    if (target === 'self' && customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, '');
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${fullPhone}?text=${text}`;
    } else if (target === 'store') {
      const storePhone = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '917990629029';
      url = `https://wa.me/${storePhone}?text=${text}`;
    }

    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '600' }}>Loading Official Tax Invoice...</p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', padding: '20px' }}>
        <div style={{ maxWidth: '440px', textAlign: 'center', background: '#FFFFFF', padding: '40px 30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📄🔍</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>Invoice Not Found</h2>
          <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: '24px' }}>
            We could not find an invoice for reference <strong>{orderId}</strong>. Please check your order ID and try again.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link href="/track-order" className="btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              Track Another Order
            </Link>
            <Link href="/products" className="btn-primary btn-gold" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              Browse Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', padding: '30px 15px 60px' }}>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media print {
          body {
            background: #FFFFFF !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .invoice-no-print {
            display: none !important;
          }
          .invoice-print-container {
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Top Floating Control Bar */}
      <div className="invoice-no-print" style={{ maxWidth: '820px', margin: '0 auto 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <Link href={`/track-order?id=${orderId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none' }}>
          ← Back to Order Tracking
        </Link>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleShareWhatsApp('any')}
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💬</span> Share to Anyone
          </button>

          {customerPhone && (
            <button
              onClick={() => handleShareWhatsApp('self')}
              style={{
                background: '#1F2937',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📱</span> Send to My WhatsApp
            </button>
          )}

          <button
            onClick={handlePrint}
            style={{
              background: '#000000',
              color: '#D4AF37',
              border: '1px solid #D4AF37',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🖨️</span> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Printable Canvas */}
      <div
        className="invoice-print-container"
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          background: '#FFFFFF',
          color: '#000000',
          border: '1.5px solid #000000',
          padding: '32px 36px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.08)',
          borderRadius: '4px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              ERA43
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2px 0 6px', color: '#444' }}>
              Luxury Streetwear & Haute Couture
            </div>
            <div style={{ fontSize: '0.76rem', color: '#333', lineHeight: '1.4' }}>
              <strong>ERA43 Apparels Pvt. Ltd.</strong><br />
              Odhav Industrial Estate, Ahmedabad, Gujarat – 382415<br />
              GSTIN: <strong>24AAACE4343K1Z5</strong> | State Code: 24 (Gujarat)<br />
              Email: support@era43.com | Phone: +91 79906 29029
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#000000', color: '#FFFFFF', padding: '5px 14px', fontSize: '0.76rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
              <div><strong>Invoice No:</strong> INV-{orderId.replace('ERA-ORD-', '')}</div>
              <div><strong>Order Ref:</strong> {orderId}</div>
              <div><strong>Date:</strong> {orderDate}</div>
              <div><strong>Payment:</strong> {paymentMethod}</div>
              <div><strong>Status:</strong> {status}</div>
            </div>
          </div>
        </div>

        {/* Billed To & Shipped To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderBottom: '1px solid #000000', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', color: '#555' }}>
              BILLED & SHIPPED TO:
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>{customerName}</div>
            <div style={{ fontSize: '0.82rem', color: '#333', lineHeight: '1.4', marginTop: '3px' }}>
              {shippingAddress}<br />
              Phone: {customerPhone || 'Not provided'}<br />
              Email: {customerEmail || 'Not provided'}
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#333', lineHeight: '1.5' }}>
            <div><strong>Place of Supply:</strong> Gujarat (24)</div>
            <div><strong>Reverse Charge:</strong> No</div>
            <div><strong>Invoice Type:</strong> Regular B2C Tax Invoice</div>
            <div><strong>Fulfillment Hub:</strong> ERA43 Central Logistics, Ahmedabad</div>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '16px' }}>
          <thead>
            <tr style={{ background: '#F4F4F5', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
              <th style={{ padding: '8px', textAlign: 'left', width: '35px' }}>#</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Description of Goods</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '75px' }}>HSN</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '50px' }}>Size</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '45px' }}>Qty</th>
              <th style={{ padding: '8px', textAlign: 'right', width: '85px' }}>Rate (₹)</th>
              <th style={{ padding: '8px', textAlign: 'right', width: '95px' }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '9px 8px' }}>{idx + 1}</td>
                <td style={{ padding: '9px 8px', fontWeight: '600' }}>
                  {item.title}
                  <div style={{ fontSize: '0.72rem', color: '#666', fontWeight: 'normal' }}>
                    100% Luxury Bio-Washed Combed Cotton
                  </div>
                </td>
                <td style={{ padding: '9px 8px', textAlign: 'center', fontFamily: 'monospace' }}>61091000</td>
                <td style={{ padding: '9px 8px', textAlign: 'center', fontWeight: '700' }}>{item.selectedSize || 'M'}</td>
                <td style={{ padding: '9px 8px', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '9px 8px', textAlign: 'right' }}>₹{(item.price || 0).toLocaleString('en-IN')}</td>
                <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: '700' }}>
                  ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST & Totals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderTop: '1px solid #000', paddingTop: '12px' }}>
          <div style={{ fontSize: '0.76rem', color: '#444' }}>
            <div style={{ marginBottom: '6px' }}>
              <strong>Amount in Words:</strong><br />
              <span style={{ fontStyle: 'italic', color: '#111' }}>{numberToWords(finalTotal)}</span>
            </div>
            <div style={{ border: '1px dashed #CCC', padding: '8px 10px', borderRadius: '4px', marginTop: '10px', background: '#FAFAFA' }}>
              <strong>Tax Summary (18% GST Included):</strong><br />
              Taxable Value: ₹{taxableValue.toLocaleString('en-IN')}<br />
              CGST @ 9%: ₹{cgst.toLocaleString('en-IN')} | SGST @ 9%: ₹{sgst.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', color: '#555' }}>Gross Subtotal:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '600' }}>₹{subtotal.toLocaleString('en-IN')}</td>
                </tr>
                {discountAmount > 0 && (
                  <tr>
                    <td style={{ padding: '4px 0', color: '#059669' }}>Promotional Discount:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: '#059669', fontWeight: '600' }}>-₹{discountAmount.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '4px 0', color: '#555' }}>Shipping & Handling:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '700', color: '#059669' }}>FREE</td>
                </tr>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                  <td style={{ padding: '8px 0', fontWeight: '900', fontSize: '0.95rem' }}>TOTAL PAYABLE:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '900', fontSize: '1.1rem' }}>
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Signatory */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', fontSize: '0.72rem', color: '#666' }}>
          <div>
            <strong>Terms & Conditions:</strong><br />
            1. Goods once sold are covered under ERA43 10-day replacement policy.<br />
            2. All apparel should retain original tags for any returns/exchanges.<br />
            3. This is a computer-generated tax invoice and requires no physical signature.
          </div>

          <div style={{ textAlign: 'center', minWidth: '160px' }}>
            <div style={{ fontFamily: 'serif', fontSize: '0.92rem', fontWeight: '800', fontStyle: 'italic', color: '#111' }}>
              Nirav Prajapati
            </div>
            <div style={{ borderTop: '1px solid #444', paddingTop: '3px', marginTop: '4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Authorized Signatory<br />
              <strong>ERA43 Apparels Pvt. Ltd.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
